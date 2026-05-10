from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    LogoutView,

    MeView,
    UpdateMeView,
    DeleteMeView,

    UsersListView,
    UserDetailView,
)

urlpatterns = [
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

    path(
        "me/",
        MeView.as_view()
    ),
    path(
        "me/update/",
        UpdateMeView.as_view()
    ),
    path(
        "me/delete/",
        DeleteMeView.as_view()
    ),

    path(
        "",
        UsersListView.as_view()
    ),
    path(
        "<int:user_id>/",
        UserDetailView.as_view()
    ),
]
