from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, F

# =========================
# USER ROLES
# =========================

ROLE_USER = 'user'
ROLE_ADMIN = 'admin'

# =========================
# USER STATUS
# =========================

STATUS_ONLINE = 'online'
STATUS_OFFLINE = 'offline'
STATUS_DND = 'dnd'

# =========================
# RELATIONSHIP TYPES
# =========================

RELATIONSHIP_FRIEND = 'friend'
RELATIONSHIP_REQUEST = 'request'
RELATIONSHIP_BLOCK = 'block'


class CustomUser(AbstractUser):

    ROLE_CHOICES = [
        (ROLE_USER, 'Běžný uživatel'),
        (ROLE_ADMIN, 'Administrátor'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_USER,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    last_seen = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['last_seen']),
        ]

    def __str__(self):
        return self.username

    @property
    def profile_data(self):
        return self.profile


class Profile(models.Model):

    STATUS_CHOICES = [
        (STATUS_ONLINE, 'Online'),
        (STATUS_OFFLINE, 'Offline'),
        (STATUS_DND, 'Nerušit'),
    ]

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    avatar = models.URLField(
        max_length=255,
        blank=True,
        null=True
    )

    bio = models.TextField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_OFFLINE,
        db_index=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.user.username} Profile'

    @property
    def username(self):
        return self.user.username

    @property
    def email(self):
        return self.user.email


class Relationship(models.Model):

    TYPE_CHOICES = [
        (RELATIONSHIP_FRIEND, 'Přítel'),
        (RELATIONSHIP_REQUEST, 'Žádost o přátelství'),
        (RELATIONSHIP_BLOCK, 'Blokováno'),
    ]

    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='relationships_sent'
    )

    receiver = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='relationships_received'
    )

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        unique_together = ('sender', 'receiver')

        constraints = [
            models.CheckConstraint(
                check=~Q(sender=F('receiver')),
                name='prevent_self_relationship'
            )
        ]

        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['created_at']),
        ]

    def clean(self):

        if self.sender == self.receiver:
            raise ValidationError(
                'User cannot create relationship with themselves.'
            )

    def __str__(self):
        return f'{self.sender} -> {self.receiver} ({self.type})'