from django.urls import path
from .views import UserChatsView, MessageHistoryView, CreateMessageView, UserNotificationsView

urlpatterns = [
    path('chats/', UserChatsView.as_view(), name='chat-list'),
    path('chats/<int:chat_id>/messages/', MessageHistoryView.as_view(), name='message-history'),
    path('chats/<int:chat_id>/send/', CreateMessageView.as_view(), name='create-message'),
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'), 
]