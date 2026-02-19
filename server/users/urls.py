from django.urls import path
from .views import users_view, signIn_view, signUp_view

urlpatterns = [
    path('', users_view),
    path('sign-in/', signIn_view, name="signin"),
    path('sign-up/', signUp_view, name="signup"),
]
