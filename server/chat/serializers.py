from rest_framework import serializers
from .models import Chat, ChatMember, Message, Attachment
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
        fields = ['id', 'chat', 'sender', 'content', 'created_at', 'is_read', 'attachments']

class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'type', 'name', 'image', 'last_activity']