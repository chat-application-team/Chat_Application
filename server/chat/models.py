from django.db import models
from users.models import CustomUser


class Chat(models.Model):

    TYPE_CHOICES = [
        ('private', 'Soukromý'),
        ('group', 'Skupinový'),
    ]

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES
    )

    name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    image = models.URLField(
        blank=True,
        null=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    last_activity = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['last_activity']),
        ]

    def __str__(self):
        return self.name if self.name else f'Chat {self.id}'


class ChatMember(models.Model):

    ROLE_CHOICES = [
        ('owner', 'Vlastník'),
        ('admin', 'Správce'),
        ('member', 'Člen'),
    ]

    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='members'
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='member'
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('chat', 'user')

        indexes = [
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f'{self.user} in {self.chat}'


class Message(models.Model):

    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('gif', 'GIF'),
    ]

    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True
    )

    content = models.TextField()

    type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default='text'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    is_read = models.BooleanField(default=False)

    read_at = models.DateTimeField(
        blank=True,
        null=True
    )

    edited_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['created_at']

        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return f'Message {self.id}'


class Attachment(models.Model):

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='attachments'
    )

    file_url = models.URLField()

    file_type = models.CharField(max_length=50)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['file_type']),
        ]

    def __str__(self):
        return self.file_type


class Notification(models.Model):

    TYPE_CHOICES = [
        ('message', 'Zpráva'),
        ('friend_request', 'Žádost'),
        ('group_invite', 'Pozvánka'),
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES
    )

    content = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

        indexes = [
            models.Index(fields=['is_read']),
        ]

    def __str__(self):
        return self.type


class Report(models.Model):

    reporter = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='reports_sent'
    )

    target = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='reports_received'
    )

    reason = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Report {self.id}'


class AuditLog(models.Model):

    admin = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE
    )

    action = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.action