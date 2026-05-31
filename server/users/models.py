from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
import os

class CustomUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("Username must be entered")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", CustomUser.ADMIN)

        return super().create_superuser(username, email, password, **extra_fields)

class CustomUser(AbstractUser):

    USER = 'user'
    ADMIN = 'admin'
    ROLE_CHOICES = [
        (USER, 'Běžný uživatel'),
        (ADMIN, 'Administrátor'),
    ]

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=USER
    )

    objects = CustomUserManager()

    REQUIRED_FIELDS = ["email"]

    class Meta:
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return self.username

def user_avatar_path(instance, filename):
    ext = filename.split('.')[-1]
    return os.path.join("avatars", f"user_{instance.user.id}.{ext}")

class Profile(models.Model):

    ONLINE = 'online'
    OFFLINE = 'offline'
    DND = 'dnd'
    STATUS_CHOICES = [
        (ONLINE, 'Online'),
        (OFFLINE, 'Offline'),
        (DND, 'Nerušit'),
    ]

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    avatar = models.ImageField(
        upload_to=user_avatar_path,
        default="avatars/default.png",
        blank=True,
        null=True,
        verbose_name="Profile picture"
    )

    bio = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=OFFLINE
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.user.username} Profile'


class Relationship(models.Model):

    FRIEND = 'friend'
    REQUEST = 'request'
    BLOCK = 'block'
    TYPE_CHOICES = [
        (FRIEND, 'Přítel'),
        (REQUEST, 'Žádost o přátelství'),
        (BLOCK, 'Blokováno'),
    ]

    user_a = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='rel_initiated'
    )

    user_b = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='rel_received'
    )

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user_a', 'user_b')

        indexes = [
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f'{self.user_a} -> {self.user_b} ({self.type})'
    
class AuditLog(models.Model):

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE
    )

    USER_REGISTER = "user_register"
    USER_LOGIN_SUCCESS = "user_login_success"
    USER_LOGIN_FAILED = "user_login_failed"
    USER_LOGOUT = "user_logout"
    USER_PASSWORD_CHANGE = "user_password_change"
    USER_DEACTIVATE = "user_deactivate"
    USER_ACTIVATE = "user_activate"
    USER_BLOCK = "user_block"
    USER_UNBLOCK = "user_unblock"
    FRIEND_ACCEPT = "friend_accept"
    FRIEND_REMOVED = "friend_removed"
    REQUEST_REMOVED = "request_removed"
    ROLE_CHANGE = "role_change"
    PROFILE_UPDATE = "profile_update"
    ADMIN_CREATE_USER = "admin_create_user"
    ADMIN_UPDATE_USER = "admin_update_user"
    ADMIN_DELETE_USER = "admin_delete_user"

    action_type = models.CharField(max_length=50)

    action = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.action
    
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()