from rest_framework import serializers
from .models import Chat, ChatMember, Message, Attachment, Notification
from users.models import CustomUser 

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username'] 

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