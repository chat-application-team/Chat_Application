from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from .serializers import UserSerializer

from django.contrib.auth import authenticate, login
from django.db.models import Q

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # ignoruje CSRF

@api_view(['GET', 'POST'])
def users_view(request):

    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def signIn_view(request):
    if request.method == 'POST':
        data = request.data

        # "username" or "email"
        login = data.get("login")
        password = data.get("password")
        username = ""

        if not password or not login:
            return Response({"message":"Login and password required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_obj = User.objects.get(
                Q(username=login) | Q(email=login)
            )
            username = user_obj.username
        except User.DoesNotExist:
            return Response({"message":"User not found"}, status=status.HTTP_404_NOT_FOUND)

        user = authenticate(request, username=username, password=password)
        if user is not None: return Response({"message":"User logged in"}, status=status.HTTP_200_OK)
        return Response({"message":"User not authorized"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def signUp_view(request):
    if request.method == "POST":
        data = request.data

        username = data.get("username")
        password = data.get("password")
        email = data.get("email")

        if not username or not password:
            return Response({"message":"Username and password required"}, status=status.HTTP_400_BAD_REQUEST)

        # kontrola jestli už user existuje
        if User.objects.filter(username=username).exists():
            return Response({"message":"User with this username exists"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"message":"User with this email exists"}, status=status.HTTP_400_BAD_REQUEST)

        # vytvoření uživatele
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        # automatické přihlášení po registraci
        login(request, user)

        return Response({"message":"User created"}, status=status.HTTP_201_CREATED)