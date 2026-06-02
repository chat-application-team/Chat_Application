from django.urls import path
from .views import UserChatsView, MessageHistoryView, CreateMessageView, UserNotificationsView, CreateChatView, AddGroupMemberView

urlpatterns = [
    path('chats/', UserChatsView.as_view(), name='chat-list'),
    path('chats/create/', CreateChatView.as_view(), name='create-chat'),
    path('chats/<int:chat_id>/messages/', MessageHistoryView.as_view(), name='message-history'),
    path('chats/<int:chat_id>/send/', CreateMessageView.as_view(), name='create-message'),
    path('chats/<int:chat_id>/add-member/', AddGroupMemberView.as_view(), name='add-group-member'),
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'), 
]