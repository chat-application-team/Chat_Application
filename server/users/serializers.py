from rest_framework import serializers
from users.models import (
    CustomUser as User,
    AuditLog,
    Profile,
    Relationship
)

from django.utils import timezone

from datetime import timedelta

class RegisterSerialzer(serializers.ModelSerializer):
    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "password",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"]
        )

        return user

class ProfileSerializer(serializers.ModelSerializer):
    updated_at = serializers.DateTimeField(format="%d.%m.%Y %H:%M", read_only=True)

    class Meta:
        model = Profile
        
        fields = [
            "bio",
            "avatar",
            "updated_at"
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    date_joined = serializers.DateTimeField(format="%d.%m.%Y %H:%M", read_only=True)
    
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "date_joined",
            "profile"
        ]

class ProfileListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile

        fields = [
            "avatar"
        ]

class UserListSerializer(serializers.ModelSerializer):
    profile = ProfileListSerializer(read_only=True)

    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "role_display",
            "profile"
        ]

class UserFriendsSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source="profile.avatar", read_only=True)

    status = serializers.SerializerMethodField()

    status_display = serializers.CharField(source="get_status_disply", read_only=True)

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "avatar",
            "status",
            "status_display"
        ]

    def get_status(self, obj):
        if hasattr(obj, "profile") and obj.profile.status == Profile.DND:
            return Profile.DND
        
        if obj.last_login:
            now = timezone.now()
            limit_online = timedelta(minutes=5)

            if now - obj.last_login < limit_online:
                return Profile.ONLINE
            
        return Profile.OFFLINE

class UserAdminSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_disply", read_only=True)

    date_joined = serializers.DateTimeField(format="%d.%m.%Y %H:%M:%S", read_only=True)
    
    class Meta:
        model = User
        
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "date_joined",
            "is_active",
            "last_login"
        ]

class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        
        fields = [
            "bio",
            "avatar",
            "status"
        ]

    def validate_status(self, value):
        allowed_statuses = [Profile.DND, Profile.ONLINE]

        normalized_value = value.lower() if value else value

        if normalized_value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Allowed values are only {" or ".join(allowed_statuses)}."
            )
        
        return normalized_value

class UpdateUserSerializer(serializers.ModelSerializer):
    profile = ProfileUpdateSerializer()
    
    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "profile"
        ]
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data:
            profile_instance = instance.profile
            for attr, value in profile_data.items():
                setattr(profile_instance, attr, value)
            profile_instance.save()

        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value

class BlockedUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source="profile.avatar", read_only=True)

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "avatar"
        ]

class PingUserSerializer(serializers.ModelSerializer):
    last_login = serializers.DateTimeField(format="%d.%m.%Y %H.%M:%S", read_only=True)
    
    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "last_login",
        ]

class UserMinifieldSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "role_display"
        ]

class AuditLogSerializer(serializers.ModelSerializer):
    user = UserMinifieldSerializer(read_only=True)

    created_at = serializers.DateTimeField(format="%d.%m.%Y %H:%M:%S", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "action_type",
            "action",
            "created_at"
        ]