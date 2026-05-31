from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Chat, ChatMember, Message, Notification
from .serializers import ChatSerializer, MessageSerializer, NotificationSerializer


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