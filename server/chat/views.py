from rest_framework import generics, viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Chat, ChatMember, Message, Notification, Report
from .serializers import (
    ChatSerializer,
    MessageSerializer,
    NotificationSerializer,
    AdminChatSerializer,
    AdminMessageSerializer,
    UserSubmitReportSerializer,
    AdminReportSerializer
)
from users.views import IsAdminUserRole
from users.models import AuditLog
from django.db.models import Count, Q

class UserChatsView(generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(members__user=self.request.user).order_by('-last_activity')


class MessageHistoryView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        chat_id = self.kwargs["chat_id"]
        
        if not ChatMember.objects.filter(chat_id=chat_id, user=self.request.user).exists():
            raise PermissionDenied("Nemáš přístup do tohoto chatu.")
            
        return Message.objects.filter(chat_id=chat_id).order_by('created_at')


class CreateMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        if not ChatMember.objects.filter(chat_id=chat_id, user=request.user).exists():
            return Response({"error": "Nemáš přístup do tohoto chatu."}, status=403)

        content = request.data.get("content")
        message_type = request.data.get("type", "text") 
        
        if not content or not content.strip():
            return Response({"error": "Obsah zprávy nesmí být prázdný."}, status=400)
        
        message = Message.objects.create(
            chat_id=chat_id,
            sender=request.user,
            content=content,
            type=message_type
        )

        chat = message.chat
        chat.last_activity = message.created_at
        chat.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{chat_id}",
            {
                "type": "chat.message",
                "message": {
                    "id": message.id,
                    "content": message.content,
                    "type": message.type, 
                    "sender_id": request.user.id,
                    "username": request.user.username,
                    "created_at": str(message.created_at)
                }
            }
        )

        return Response({"status": "Odesláno", "message_id": message.id})


class UserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)
    
class ReportViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    queryset = Report.objects.all().select_related("reporter", "target")

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        return [IsAdminUserRole()]
    
    def get_serializer_class(self):
        if self.action == "create":
            return UserSubmitReportSerializer
        return AdminReportSerializer
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve(self, request, pk=None):
        report = self.get_object()
        report.is_resolved = True
        report.save()

        return Response(
            {"detail":"Report marked as resolved."},
            status=status.HTTP_200_OK
        )

class AdminGroupChatManagementViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    permission_classes = [IsAdminUserRole]
    serializer_class = AdminChatSerializer

    filterset_fields = ["created_at"]
    search_fields = ["name", "description"]

    def get_queryset(self):
        return Chat.objects.filter(
            type=Chat.GROUP
        ).annotate(members_count=Count("members", distinct=True)
        ).prefetch_related("members__user")

    def perform_destroy(self, instance):
        chat_name = instance.name
        chat_id = instance.id

        super().perform_destroy(instance)

        AuditLog.objects.create(
            user=self.request.user,
            action_type=AuditLog.ADMIN_DELETE_CHAT,
            action=f"Admin {self.request.user.username} deleted Group chat '{chat_name}' (ID: {chat_id})."
        )

class AdminMessageManagementViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    permission_classes = [IsAdminUserRole]
    serializer_class = AdminMessageSerializer

    def get_queryset(self):
        reported_user_ids = Report.objects.filter(
            is_resolved=False
        ).values_list("target_id", flat=True)

        return Message.objects.filter(
            Q(chat__type=Chat.GROUP) |
            Q(sender_id__in=reported_user_ids)
        ).select_related("sender", "chat").prefetch_related("attachments")


    filterset_fields = ["chat", "sender", "type", "is_read"]
    search_fields = ["content"]

    def perform_destroy(self, instance):
        message_id = instance.id
        sender_username = instance.sender.username if instance.sender else "Deleted User"
        chat_id = instance.chat.id
        content_snippet = instance.content[:30]

        super().perform_destroy(instance)
    
        AuditLog.objects.create(
            user=self.request.user,
            action_type=AuditLog.ADMIN_DELETE_MESSAGE,
            action=f"Admin {self.request.user.username} deleted message ID {message_id} ('{content_snippet}...') sent by {sender_username} in Chat ID {chat_id}."
        )