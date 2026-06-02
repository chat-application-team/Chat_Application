from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserChatsView,
    MessageHistoryView,
    CreateMessageView,
    UserNotificationsView,
    AdminMessageManagementViewSet,
    AdminGroupChatManagementViewSet,
    ReportViewSet
)

router = DefaultRouter()

router.register(r"admin/messages", AdminMessageManagementViewSet, basename="admin-messages-management")
router.register(r"admin/group-chats", AdminGroupChatManagementViewSet, basename="admin-group-chat-management")
router.register(r"report", ReportViewSet, basename="reports")

urlpatterns = [
    path('', include(router.urls)),
    path('chats/', UserChatsView.as_view(), name='chat-list'),
    path('chats/<int:chat_id>/messages/', MessageHistoryView.as_view(), name='message-history'),
    path('chats/<int:chat_id>/send/', CreateMessageView.as_view(), name='create-message'),
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'), 
]