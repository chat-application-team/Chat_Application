from rest_framework import serializers
from .models import Chat, ChatMember, Message, Attachment, Notification
from users.models import CustomUser 

class CustomUserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()
    status = serializers.CharField(source='profile.status', read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'avatar', 'status'] 

    def get_avatar(self, obj):
        if hasattr(obj, 'profile') and obj.profile.avatar:
            return obj.profile.avatar.url
        return "/media/avatars/default.png"

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file_url', 'file_type']

class MessageSerializer(serializers.ModelSerializer):
    sender = CustomUserSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True) 

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'content', 'type', 'created_at', 'is_read', 'read_at', 'edited_at', 'attachments']

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'type', 'name', 'image', 'description', 'last_activity', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'type', 'content', 'is_read', 'created_at']