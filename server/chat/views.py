from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from django.db import transaction
from django.db.models import Q
from channels.layers import get_channel_layer
from users.models import CustomUser, Relationship
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
    
class CreateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        chat_type = request.data.get("type")
        name = request.data.get("name")
        desciription = request.data.get("description")
        other_user_id = request.data.get("other_user_id")

        if chat_type not in ['private', 'group']:
            return Response({"error": "Neplatný typ chatu. Musí být 'private' nebo 'group'."}, status=400)
        
        if chat_type == 'group' and not name:
            return Response({"error": "Skupinový chat musí mít název."}, status=400)
        
        with transaction.atomic():
            chat = Chat.objects.create(
                type=chat_type,
                name=name if chat_type == 'group' else None, #Funguje to: pokud je to skupinový chat, použije se název, jinak bude None
                description=desciription if chat_type == 'group' else None
            )

            ChatMember.objects.create(
                chat=chat,
                user=request.user,
                role='owner'
            )

            if chat_type == 'private':
                if not other_user_id:
                    return Response({"error": "Pro soukromý chat musí být zadán 'other_user_id'."}, status=400)
                
                is_blocked = Relationship.objects.filter(
                    (Q(user_a=request.user, user_b_id=other_user_id) | Q(user_a_id=other_user_id, user_b=request.user)), #Detailni vysvetleni: Tento dotaz hledá vztahy, kde buď uživatel A je aktuální uživatel a uživatel B je ten druhý, nebo naopak. To zajišťuje, že se zkontrolují oba směry vztahu mezi těmito dvěma uživateli. 
                    type='block'
                ).exists()

                if is_blocked:
                    return Response({"error": "Nelze založit chat. Jeden z uživatelů si zablokoval druhého."}, status=403)
                
                try:
                    other_user = CustomUser.objects.get(id=other_user_id)
                    ChatMember.objects.create(
                        chat=chat,
                        user=other_user,
                        role='member'
                    )
                
                except CustomUser.DoesNotExist:
                    return Response({"error": "Uživatel, se kterým chceš založit chat, neexistuje."}, status=404)
                
        serializer = ChatSerializer(chat)
        return Response(serializer.data, status=201)


class CreateMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        if not ChatMember.objects.filter(chat_id=chat_id, user=request.user).exists():
            return Response({"error": "Nemáš přístup do tohoto chatu."}, status=403)
        
        if chat.type == 'private':
            other_member = ChatMember.objects.filter(chat_id=chat_id).exclude(user=request.user).first()

            if other_member:
                is_blocked = Relationship.objects.filter(
                    (Q(user_a=request.user, user_b=other_member.user) | Q(user_a=other_member.user, user_b=request.user)),
                     type='block'
                ).exists()

                if is_blocked:
                    return Response({"error": "Zprávu nelze odeslat. Uživatel si tě zablokoval nebo jsi zablokoval ty jeho."}, status=403)

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


class AddGroupMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return Response({"error": "Chat neexistuje."}, status=404)
    
        if chat.type != 'group':
            return Response({"error": "Tato akce je povolena pouze pro skupinové chaty."}, status=400)
        
        try:
            current_member = ChatMember.objects.get(chat=chat, user=request.user)
            if current_member.role not in ['owner', 'admin']:
                return Response({"error": "Nemáš práva přidávat členy. Musíš být vlastníkem nebo administrátorem skupiny."}, status=403)
        
        except ChatMember.DoesNotExist:
            return Response({"error": "Nejsi členem tohoto chatu."}, status=403)
        
        user_to_add_id = request.data.get("user_id")
        if not user_to_add_id:
            return Response({"error": "Musíš zadat 'user_id' uživatele, kterého chceš přidat."}, status=400)
        
        try:
            user_to_add = CustomUser.objects.get(id=user_to_add_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Uživatel, kterého chceš přidat, neexistuje."}, status=404)
        
        if ChatMember.objects.filter(chat=chat, user=user_to_add).exists():
            return Response({"error": "Tento uživatel je již členem tohoto chatu."}, status=400)
        
        ChatMember.objects.create(
            chat=chat,
            user=user_to_add,
            role='member'
        )
        
        return Response({"status": f"Uživatel {user_to_add.username} byl úspěšně přidán do chatu."})
    

class LeaveGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return Response({"error": "Chat neexistuje."}, status=404)
            
        if chat.type != 'group':
            return Response({"error": "Ze soukromého chatu nelze odejít."}, status=400)
            
        try:
            member = ChatMember.objects.get(chat=chat, user=request.user)

        except ChatMember.DoesNotExist:
            return Response({"error": "Nejsi členem této skupiny."}, status=403)
            
        if member.role == 'owner':
            other_members_count = ChatMember.objects.filter(chat=chat).exclude(user=request.user).count()
            if other_members_count == 0:
                return Response({"error": "Jako Vlastník nemůžeš odejít, dokud na někoho nepřevedeš vlastnictví nebo dokud nezrušíš skupinu."}, status=403)

        member.delete()

        return Response({"status": "Úspěšně jsi opustil skupinu."})
        
    
class DeleteChatView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)

        except Chat.DoesNotExist:
            return Response({"error": "Chat neexistuje."}, status=404)
            
        try:
            member = ChatMember.objects.get(chat=chat, user=request.user)
            
        except ChatMember.DoesNotExist:
            return Response({"error": "Nejsi členem tohoto chatu."}, status=403)
            
        if chat.type == 'group' and member.role != 'owner':
            return Response({"error": "Pouze Vlastník může smazat skupinový chat."}, status=403)
            
        chat.delete()
        return Response({"status": "Chat byl úspěšně smazán."})


class UserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)