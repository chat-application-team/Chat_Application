from rest_framework import serializers
from .models import Chat, ChatMember, Message, Attachment, Notification, Report
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
    other_user = serializers.SerializerMethodField()
    class Meta:
        model = Chat
        fields = ['id', 'type', 'name', 'image', 'description', 'last_activity', 'created_at', 'other_user']

    def get_other_user(self, obj):
        request = self.context.get('request')
        if not request or not request.user:
            return None
        
        if obj.type == Chat.PRIVATE:
            other_member = obj.members.filter(chat=obj).exclude(user=request.user).first()
            if other_member:
                return CustomUserSerializer(other_member.user).data
        
        return None

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'type', 'content', 'is_read', 'created_at']

class UserSubmitReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "target",
            "reason"
        ]
    
    def validate(self, data):
        if self.context["request"].user == data["target"]:
            raise serializers.ValidationError("You cannot report yourself.")
        return data

class AdminReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source="reporter.username", read_only=True)
    target_username = serializers.CharField(source="target.username", read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "reporter",
            "reporter_username",
            "target",
            "target_username",
            "reason",
            "is_resolved",
            "created_at"
        ]
        read_only_fields = fields

class AdminChatMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = ChatMember
        fields = [
            "user",
            "username",
            "email",
            "role",
            "joined_at"
        ]

class AdminChatSerializer(serializers.ModelSerializer):
    members_count = serializers.IntegerField(read_only=True)

    management_team = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            "id",
            "type",
            "name",
            "image",
            "description",
            "members_count",
            "management_team",
            "last_activity",
            "created_at"
        ]

        read_only_fields = ["id", "type", "last_activity", "created_at"]

    def get_management_team(self, obj):
        managers = obj.members.filter(role__in=[ChatMember.ROLE_OWNER, ChatMember.ROLE_ADMIN]).select_related('user')
        return AdminChatMemberSerializer(managers, many=True).data
    
class AdminAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = [
            "id",
            "file_url",
            "file_type",
            "uploaded_at"
        ]

class AdminMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)
    chat_name = serializers.SerializerMethodField()

    attachments = AdminAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "chat",
            "chat_name",
            "sender",
            "sender_username",
            "content",
            "type",
            "is_read",
            "read_at",
            "created_at",
            "edited_at",
            "attachments"
        ]

        read_only_fields = fields

    def get_chat_name(self, obj):
        if obj.chat.type == "group" and obj.chat.name:
            return f"Group: {obj.chat.name}"
        return f"Private chat (ID: {obj.chat.id})"