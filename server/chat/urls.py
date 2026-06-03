from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserChatsView,
    MessageHistoryView,
    CreateMessageView,
    UserNotificationsView,
    CreateChatView,
    AddGroupMemberView,
    LeaveGroupView,
    DeleteChatView,
    MarkNotificationReadView,
    RemoveGroupMemberView,
    ChangeMemberRoleView,
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
    path('chats/create/', CreateChatView.as_view(), name='create-chat'),
    path('chats/<int:chat_id>/messages/', MessageHistoryView.as_view(), name='message-history'),
    path('chats/<int:chat_id>/send/', CreateMessageView.as_view(), name='create-message'),
    path('chats/<int:chat_id>/add-member/', AddGroupMemberView.as_view(), name='add-group-member'),
    path('chats/<int:chat_id>/change-role/', ChangeMemberRoleView.as_view(), name='change-member-role'),
    path('chats/<int:chat_id>/leave/', LeaveGroupView.as_view(), name='leave-group'),
    path('chats/<int:chat_id>/delete/', DeleteChatView.as_view(), name='delete-chat'),
    path('chats/<int:chat_id>/remove-member/', RemoveGroupMemberView.as_view(), name='remove-group-member'),
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'),
    path('notifications/<int:notification_id>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
]