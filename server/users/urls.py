from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView,
    LoginView,
    LogoutView,

    MeView,
    UpdateMeView,
    ChangePasswordView,
    DeleteMeView,
    PingUserView,
    BlockUserView,

    UsersListView,
    UserDetailView,

    UserFriendsListView,
    FriendRequestView,
    MyBlockedUsersView,

    AdminUserManagementViewSet,
    AdminAuditLogViewSet,

    AdminDashboardStatsView,
    AdminBulkActionView,
)

router = DefaultRouter()

router.register(r"admin/management", AdminUserManagementViewSet, basename="admin-user-management")
router.register(r"admin/audit-logs", AdminAuditLogViewSet, basename="admin-audit-logs")

urlpatterns = [
    path(
        "",
        include(router.urls)
    ),
    # authentication
    path(
        "register/",
        RegisterView.as_view()
    ),
    path(
        "login/",
        LoginView.as_view()
    ),
    path(
        "logout/",
        LogoutView.as_view()
    ),
    # me
    path(
        "me/",
        MeView.as_view()
    ),
    path(
        "me/update/",
        UpdateMeView.as_view()
    ),
    path(
        "me/change-password/",
        ChangePasswordView.as_view()
    ),
    path(
        "me/delete/",
        DeleteMeView.as_view()
    ),
    path(
        "me/ping/",
        PingUserView.as_view()
    ),
    path(
        "me/blocked/",
        MyBlockedUsersView.as_view()
    ),
    # users
    path(
        "search",
        UsersListView.as_view()
    ),
    path(
        "<int:user_id>/",
        UserDetailView.as_view()
    ),
    # relations
    path(
        "relations/",
        UserFriendsListView.as_view()
    ),
    path(
        "relations/request/",
        FriendRequestView.as_view()
    ),
    path(
        "relations/block/",
        BlockUserView.as_view()
    ),
    # admin
    path(
        "admin/stats/",
        AdminDashboardStatsView.as_view()
    ),
    path(
        "admin/bulk-action/",
        AdminBulkActionView.as_view()
    )
]
