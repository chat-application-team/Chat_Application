from rest_framework.views import APIView

from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import (
    IsAuthenticated,
    AllowAny,
)

from users.models import CustomUser as User
from django.contrib.auth import authenticate, login, logout
from .serializers import (
    RegisterSerialzer,
    UserSerializer,
    UpdateUserSerializer,
)

from django.db.models import Q
    
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerialzer(data=request.data)
        if serializer.is_valid():
            serializer.save()

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

        if "@" in login_input:
            try:
                found_user = User.objects.filter(
                    email=login_input
                ).first()

                user = authenticate(
                    request,
                    username=found_user.username,
                    password=password
                )
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(
                request,
                username=login_input,
                password=password
            )

        if user is None:
            return Response(
                {"error":"Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        login(request, user)

        return Response(
            {"message": "Logged in"},
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)

        return Response(
            {"message":"Logged out"},
            status=status.HTTP_200_OK
        )
    
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

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class DeleteMeView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        request.user.delete()

        return Response(
            {"message":"Account deleted"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class UsersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()

        serializer = UserSerializer(
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