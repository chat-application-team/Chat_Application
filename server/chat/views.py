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


def create_notification(user, text):
    Notification.objects.create(user=user, text=text)


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
        description = request.data.get("description")
        other_user_id = request.data.get("other_user_id")

        if chat_type not in [Chat.PRIVATE, Chat.GROUP]:
            return Response({"error": "Neplatný typ chatu. Musí být 'private' nebo 'group'."}, status=400)
        
        if chat_type == Chat.GROUP and not name:
            return Response({"error": "Skupinový chat musí mít název."}, status=400)
        
        with transaction.atomic():
            chat = Chat.objects.create(
                type=chat_type,
                name=name if chat_type == Chat.GROUP else None, #Funguje to: pokud je to skupinový chat, použije se název, jinak bude None
                description=description if chat_type == Chat.GROUP else None
            )

            ChatMember.objects.create(
                chat=chat,
                user=request.user,
                role='owner'
            )

            if chat_type == Chat.PRIVATE:
                if not other_user_id:
                    return Response({"error": "Pro soukromý chat musí být zadán 'other_user_id'."}, status=400)
                
                is_blocked = Relationship.objects.filter(
                    (Q(user_a=request.user, user_b_id=other_user_id) | Q(user_a_id=other_user_id, user_b=request.user)), #Detailni vysvetleni: Tento dotaz hledá vztahy, kde buď uživatel A je aktuální uživatel a uživatel B je ten druhý, nebo naopak. To zajišťuje, že se zkontrolují oba směry vztahu mezi těmito dvěma uživateli. 
                    type=Relationship.BLOCK
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
        
        if chat.type == Chat.PRIVATE:
            other_member = ChatMember.objects.filter(chat_id=chat_id).exclude(user=request.user).first()

            if other_member:
                is_blocked = Relationship.objects.filter(
                    (Q(user_a=request.user, user_b=other_member.user) | Q(user_a=other_member.user, user_b=request.user)),
                     type=Relationship.BLOCK
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

        other_members = ChatMember.objects.filter(chat_id=chat_id).exclude(user=request.user)
        for member in other_members:
            if chat.type == Chat.PRIVATE:
                notification_text = f"Nová zpráva od {request.user.username} v soukromém chatu."
            else:
                notification_text = f"Nová zpráva od {request.user.username} ve skupinovém chatu '{chat.name}'."
            
            create_notification(user=member.user, text=notification_text)

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
    
        if chat.type != Chat.GROUP:
            return Response({"error": "Tato akce je povolena pouze pro skupinové chaty."}, status=400)
        
        try:
            current_member = ChatMember.objects.get(chat=chat, user=request.user)
            if current_member.role not in [ChatMember.OWNER, ChatMember.ADMIN]:
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

        create_notification(user=user_to_add, text=f"Byl jsi přidán do skupinového chatu '{chat.name}'.")
        
        return Response({"status": f"Uživatel {user_to_add.username} byl úspěšně přidán do chatu."})
    

class LeaveGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
        except Chat.DoesNotExist:
            return Response({"error": "Chat neexistuje."}, status=404)
            
        if chat.type != Chat.GROUP:
            return Response({"error": "Ze soukromého chatu nelze odejít."}, status=400)
            
        try:
            member = ChatMember.objects.get(chat=chat, user=request.user)

        except ChatMember.DoesNotExist:
            return Response({"error": "Nejsi členem této skupiny."}, status=403)
            
        if member.role == ChatMember.OWNER:
            other_members_count = ChatMember.objects.filter(chat=chat).exclude(user=request.user).count()
            if other_members_count == 0:
                return Response({"error": "Jako Vlastník nemůžeš odejít, dokud na někoho nepřevedeš vlastnictví nebo dokud nezrušíš skupinu."}, status=403)

        member.delete()

        return Response({"status": "Úspěšně jsi opustil skupinu."})
    

class RemoveGroupMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
        
        except Chat.DoesNotExist:
            return Response({"error": "Chat neexistuje."}, status=404)
        
        if chat.type != Chat.GROUP:
            return Response({"error": "Tato akce je povolena pouze pro skupinové chaty."}, status=400)
        
        try:
            current_member = ChatMember.objects.get(chat=chat, user=request.user)
            if current_member.role not in [ChatMember.OWNER, ChatMember.ADMIN]:
                return Response({"error": "Nemáš práva odstraňovat členy. Musíš být vlastníkem nebo administrátorem skupiny."}, status=403)

        except ChatMember.DoesNotExist:
            return Response({"error": "Nejsi členem tohoto chatu."}, status=403)

        user_to_remove_id = request.data.get("user_id")
        if not user_to_remove_id:
            return Response({"error": "Musíš zadat 'user_id' uživatele, kterého chceš odstranit."}, status=400)

        try:
            member_to_remove = ChatMember.objects.get(chat=chat, user_id=user_to_remove_id)
        
        except ChatMember.DoesNotExist:
            return Response({"error": "Uživatel, kterého chceš odstranit, není členem tohoto chatu."}, status=404)

        if member_to_remove.role == ChatMember.OWNER:
            return Response({"error": "Vlastníka nelze odstranit."}, status=403)
        
        if current_member.role == ChatMember.ADMIN and member_to_remove.role == ChatMember.ADMIN:
            return Response({"error": "Administrátor nemůže odstranit jiného administrátora."}, status=403)
        
        member_to_remove.delete()

        create_notification(user=member_to_remove.user, text=f"Byl jsi odstraněn z skupinového chatu '{chat.name}'.")

        return Response({"status": f"Uživatel {member_to_remove.user.username} byl úspěšně odstraněn z chatu."})
        
    
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
            
        if chat.type == Chat.GROUP and member.role != ChatMember.OWNER:
            return Response({"error": "Pouze Vlastník může smazat skupinový chat."}, status=403)
            
        chat.delete()
        return Response({"status": "Chat byl úspěšně smazán."})
    

class ChangeMemberRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)

        except Chat.DoesNotExist:
            return Response({"error": "Chat neexistuje."}, status=404)
        
        if chat.type != Chat.GROUP:
            return Response({"error": "V soikromém chatu nelze měnit role členů."}, status=400)
        
        try:
            current_member = ChatMember.objects.get(chat=chat, user=request.user)
            if current_member.role not in [ChatMember.OWNER, ChatMember.ADMIN]:
                return Response({"error": "Nemáš práva měnit role členů. Musíš být vlastníkem nebo administrátorem skupiny."}, status=403)
            
        except ChatMember.DoesNotExist:
            return Response({"error": "Nejsi členem tohoto chatu."}, status=403)
        
        target_user_id = request.data.get("user_id")
        new_role = request.data.get("role")

        if not target_user_id or not new_role:
            return Response({"error": "Musíš zadat 'user_id' a 'role' pro změnu role člena."}, status=400)
        
        if new_role not in [ChatMember.ADMIN, ChatMember.MEMBER]:
            return Response({"error": "Neplatná role. Role musí být 'admin' nebo 'member'."}, status=400)
        
        try:
            member_to_change = ChatMember.objects.get(chat=chat, user_id=target_user_id)
        
        except ChatMember.DoesNotExist:
            return Response({"error": "Uživatel, jehož roli chceš změnit, není členem tohoto chatu."}, status=404)
        
        if member_to_change.role == ChatMember.OWNER:
            return Response({"error": "Roli vlastníka nelze měnit."}, status=403)
        
        if current_member.role == ChatMember.ADMIN and member_to_change.role == ChatMember.ADMIN:
            return Response({"error": "Správce nemůže měnit roli jiného správce."}, status=403)
        
        member_to_change.role = new_role
        member_to_change.save()

        create_notification(user=member_to_change.user, text=f"Tvá role v skupinovém chatu '{chat.name}' byla změněna na {new_role}.")  

        return Response({"status": f"Role uživatele {member_to_change.user.username} byla úspěšně změněna na {new_role}."})
        

class UserNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)
    

class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"status": "Notifikace označena jako přečtená."})
        
        except Notification.DoesNotExist:
            return Response({"error": "Notifikace neexistuje nebo nepatří tobě."}, status=404)
        