from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
    BasePermission
)

from users.models import (
    CustomUser as User,
    AuditLog,
    Profile,
    Relationship
)
from django.contrib.auth import authenticate, login, logout
from .serializers import (
    RegisterSerialzer,
    UserSerializer,
    UserAdminSerializer,
    UpdateUserSerializer,
    AuditLogSerializer,
    PingUserSerializer,
    UserListSerializer,
    ChangePasswordSerializer,
    BlockedUserSerializer,
    UserFriendsSerializer
)

from chat.models import (
    Message,
    Chat
)

from django.db.models import Q

from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend

from django.shortcuts import get_object_or_404

# authentication

class IsAdminUserRole(BasePermission):
    def has_permission(self, request, view):
        # Kontrola, zda je uživatel přihlášený a má správnou roli
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'role') and 
            request.user.role == request.user.ADMIN
        )

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerialzer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            AuditLog.objects.create(
                user=user,
                action_type=AuditLog.USER_REGISTER,
                action=f"User {user.username} has successfully registered."
            )

            return Response(
                {"message":"User created"},
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        login_input = request.data.get("login")
        password = request.data.get("password")

        if not login_input or not password:
            return Response(
                {"error":"Missing credentials"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = None

        try:
            if "@" in login_input:
                found_user = User.objects.filter(
                    email=login_input
                ).first()
            else:
                found_user = User.objects.filter(
                    username=login_input
                ).first()
        except User.DoesNotExist:
            pass

        if found_user and not found_user.is_active:
            return Response(
                {"error":"This account is deactivated."},
                status=status.HTTP_403_FORBIDDEN
            )

        if found_user:
            user = authenticate(
                request,
                username=found_user.username,
                password=password
            )

        if user is None:
            if found_user:
                AuditLog.objects.create(
                    user=found_user,
                    action_type=AuditLog.USER_LOGIN_FAILED,
                    action=f"User {found_user.username} has failed to logged in."
                )

            return Response(
                {"error":"Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        login(request, user)

        AuditLog.objects.create(
            user=user,
            action_type=AuditLog.USER_LOGIN_SUCCESS,
            action=f"User {user.username} has successfully logged in."
        )

        return Response(
            {"message": "Logged in"},
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        logout(request)

        AuditLog.objects.create(
            user=user,
            action_type=AuditLog.USER_LOGOUT,
            action=f"User {user.username} has successfully logged out."
        )

        return Response(
            {"message":"Logged out"},
            status=status.HTTP_200_OK
        )
    
# me

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(
            request.user
        )
    
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
class UpdateMeView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = UpdateUserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            AuditLog.objects.create(
                user=request.user,
                action_type=AuditLog.PROFILE_UPDATE,
                action=f"User {request.user.username} has successfully updated profile."
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request":request})

        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data["new_password"])
            user.save()

            AuditLog.objects.create(
                user=user,
                action_type=AuditLog.USER_PASSWORD_CHANGE,
                action=f"User {user.username} successfully change their password."
            )

            return Response(
                {"message":"Password has been successfully updated."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteMeView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user

        user.is_active = False
        user.save(update_fields=["is_active"])

        logout(request)

        AuditLog.objects.create(
            user=user,
            action_type=AuditLog.USER_DEACTIVATE,
            action=f"User {user.username} has been successfully deactivated."
        )

        return Response(
            {"message":"Account has been successfully deactivated."},
            status=status.HTTP_204_NO_CONTENT
        )
    
class PingUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        user.last_login = timezone.now()

        user.save(update_fields=["last_login"])
    
        serializer = PingUserSerializer(user)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
class MyBlockedUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user

        blocked_relations = Relationship.objects.filter(
            user_a=me,
            type=Relationship.BLOCK
        ).select_related("user_b__profile")

        blocked_users = [rel.user_b for rel in blocked_relations]

        serializer = BlockedUserSerializer(blocked_users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# users

class UsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user
        search_query = request.query_params.get("search", None)

        blocked_user_ids = Relationship.objects.filter(
            (Q(user_a=me) | Q(user_b=me)),
            type=Relationship.BLOCK
        ).values_list("user_a_id", "user_b_id")

        exclude_ids = set()
        for a, b in blocked_user_ids:
            exclude_ids.add(a)
            exclude_ids.add(b)
        exclude_ids.add(me.id)

        users = User.objects.filter(is_active=True).exclude(id__in=exclude_ids).select_related("profile")

        if search_query:
            users = users.filter(
                Q(username__icontains=search_query) |
                Q(email__icontains=search_query)
            )

        serializer = UserListSerializer(
            users,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(
                id=user_id
            )

        except User.DoesNotExist:
            return Response(
                {"error":"User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UserSerializer(user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

# relations

class UserFriendsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user

        friendships = Relationship.objects.filter(
            Q(user_a=me) | Q(user_b=me),
            type=Relationship.FRIEND
        ).select_related("user_a__profile", "user_b__profile")

        friends_list = []
        for rel in friendships:
            if rel.user_a == me:
                friends_list.append(rel.user_b)
            else:
                friends_list.append(rel.user_a)

        serializer = UserFriendsSerializer(friends_list, many=True)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        me = request.user

        requestsSend = Relationship.objects.filter(
            Q(user_a=me),
            type=Relationship.REQUEST
        ).values_list("user_b", flat=True)

        requestsRecieved = Relationship.objects.filter(
            Q(user_b=me),
            type=Relationship.REQUEST
        ).values_list("user_a", flat=True)

        users_send = User.objects.filter(id__in=requestsSend).select_related("profile")
        users_recieved = User.objects.filter(id__in=requestsRecieved).select_related("profile")

        serializerSend = UserFriendsSerializer(users_send, many=True)
        serializerRecieved = UserFriendsSerializer(users_recieved, many=True)

        return Response(
            {
                "send":serializerSend.data,
                "recieved":serializerRecieved.data
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):
        me = request.user
        target_id = request.data.get("user_id")

        if not target_id or str(target_id) == str(me.id):
            return Response(
                {"error":"Non valid User ID."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        target_user = get_object_or_404(User, id=target_id, is_active=True)

        existing_rel = Relationship.objects.filter(
            (Q(user_a=me) & Q(user_b=target_user)) |
            (Q(user_a=target_user) & Q(user_b=me))
        ).first()

        if existing_rel:
            return Response(
                {"error":f"Relationship already exists of this type: {existing_rel.type}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        Relationship.objects.create(user_a=me, user_b=target_user, type=Relationship.REQUEST)

        return Response(
            {"message":"Friendrequest has been send."},
            status=status.HTTP_201_CREATED
        )
    
    def patch(self, request):
        me = request.user
        sender_id = request.data.get("user_id")

        rel = Relationship.objects.filter(user_a_id=sender_id, user_b=me, type=Relationship.REQUEST).first()

        if not rel:
            return Response(
                {"error":"No pending request found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        rel.type = Relationship.FRIEND
        rel.save(update_fields=["type"])

        AuditLog.objects.create(
            user=me,
            action_type=AuditLog.FRIEND_ACCEPT,
            action=f"User {me.username} accepted friend request from {rel.user_a.username}."
        )

        return Response(
            {"message":"Friend request has been accepted."}
        )
    
class RelationsDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        me = request.user

        rel = Relationship.objects.filter(
            (Q(user_a=me) & Q(user_b_id=user_id)) |
            (Q(user_a_id=user_id) & Q(user_b=me))
        ).exclude(
            Q(user_b=me),
            type=Relationship.BLOCK
        ).first()

        if not rel:
            return Response(
                {"error":f"No relationship found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        type = rel.type

        rel.delete()

        match type:
            case Relationship.FRIEND:
                action_type = AuditLog.FRIEND_REMOVED
                list_type = "friend"
            case Relationship.BLOCK:
                action_type = AuditLog.USER_UNBLOCK
                list_type = "block"
            case Relationship.REQUEST | _:
                action_type = AuditLog.REQUEST_REMOVED
                list_type = "request"

        AuditLog.objects.create(
            user=me,
            action_type=action_type,
            action=f"User {me.username} removed User ID {user_id} from their {list_type} list."
        )

        return Response(
            {"message":f"User has been successfully removed from {list_type} list."}
        )

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        me = request.user
        target_id = request.data.get("user_id")

        if not target_id or str(target_id) == str(me.id):
            return Response(
                {"error":"Cannot block yourself or invalid ID."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        target_user = get_object_or_404(User, id=target_id)

        Relationship.objects.filter(
            (Q(user_a=me) & Q(user_b=target_user)) |
            (Q(user_a=target_user) & Q(user_b=me))
        ).exclude(
            type=Relationship.BLOCK
        ).delete()

        already_blocked_by_me = Relationship.objects.filter(
            user_a=me,
            user_b=target_user,
            type=Relationship.BLOCK
        ).exists()

        if not already_blocked_by_me:
            Relationship.objects.create(
                user_a=me,
                user_b=target_user,
                type=Relationship.BLOCK
            )

            AuditLog.objects.create(
                user=me,
                action_type=AuditLog.USER_BLOCK,
                action=f"User {me.username} blocked User {target_user.username} (ID: {target_user.id})."
            )

        return Response(
            {"message":"User was successfully blocked."},
            status=status.HTTP_200_OK
        )

# Admin

class AdminUserManagementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUserRole]
    queryset = User.objects.all().select_related("profile")
    serializer_class = UserAdminSerializer

    filterset_fields = ["role", "is_active"]
    search_fields = ["username", "email"]

    def perform_create(self, serializer):
        super().perform_create(serializer)

        AuditLog.objects.create(
            user=self.request.user,
            action_type=AuditLog.ADMIN_CREATE_USER,
            action=f"Admin {self.request.user.username} created User {serializer.instance.username}."
        )
    
    def perform_update(self, serializer):
        super().perform_update(serializer)

        AuditLog.objects.create(
            user=self.request.user,
            action_type=AuditLog.ADMIN_UPDATE_USER,
            action=f"Admin {self.request.user.username} updated User {serializer.instance.username}."
        )

    def perform_destroy(self, instance):
        username = instance.username

        super().perform_destroy(instance)

        AuditLog.objects.create(
            user=self.request.user,
            action_type=AuditLog.ADMIN_DELETE_USER,
            action=f"Admin {self.request.user.username} deleted User {username}"
        )

class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        dnes = timezone.now().date()

        stats = {
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "admins_count": User.objects.filter(role=User.ADMIN).count(),
            "new_users_today": User.objects.filter(date_joined__date=dnes).count(),
            "messages_count":Message.objects.count(),
            "dm_count":Chat.objects.filter(type=Chat.PRIVATE).count(),
            "group_chat_count":Chat.objects.filter(type=Chat.GROUP).count(),
        }
        return Response(stats)

class AdminBulkActionView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request):
        me = request.user

        user_ids = request.data.get("user_ids", [])
        
        user_ids_set = set(user_ids)
        user_ids_set.discard(me.id)

        user_ids = list(user_ids_set)

        if not user_ids:
            return Response(
                {"error":"No Users were selected for the bulk action."},
                status=status.HTTP_400_BAD_REQUEST
            )

        action = request.data.get("action")

        role_value = request.data.get("role")

        action_text = ""

        queryset = User.objects.filter(
            id__in=user_ids
        )

        match action:
            case AuditLog.USER_DEACTIVATE:
                updated_count = queryset.update(
                    is_active=False
                )
                action_text = f"Admin {me.username} deactivated {updated_count} Users in bulk. Their IDs: {user_ids}."
            case AuditLog.USER_ACTIVATE:
                updated_count = queryset.update(
                    is_active=True
                )
                action_text = f"Admin {me.username} activated {updated_count} Users in bulk. Their IDs: {user_ids}."
            case AuditLog.ROLE_CHANGE:
                if not role_value:
                    return Response(
                        {"error":"To change the role, you must specify the 'role' parametr"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                updated_count = queryset.update(
                    role=role_value
                )
                action_text = f"Admin {me.username} changed role of {updated_count} Users in bulk to '{role_value}'. Their IDs: {user_ids}."
            case AuditLog.ADMIN_DELETE_USER:
                deleted_count, _ = queryset.delete()
                updated_count = deleted_count
                
                action_text = f"Admin {me.username} deleted {updated_count} Users in bulk. Their IDs: {user_ids}."
            case _:
                return Response(
                    {"error":"Unknown action"},
                    status=status.HTTP_400_BAD_REQUEST)
        
        AuditLog.objects.create(
            user=me,
            action_type=action,
            action=action_text
        )
        
        return Response(
            {
                "message":f"Action '{action}' has been successfully executed.",
                "count": updated_count
            },
            status=status.HTTP_200_OK
        )

class AdminAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdminUserRole]
    queryset = AuditLog.objects.all().select_related("user")
    serializer_class = AuditLogSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]

    filterset_fields = ["action_type"]

    search_fields = ["action", "user__username"]
