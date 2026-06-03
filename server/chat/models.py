from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, F
from users.models import CustomUser

class Chat(models.Model):

    PRIVATE = 'private'
    GROUP = 'group'
    TYPE_CHOICES = [
        (PRIVATE, 'Soukromý'),
        (GROUP, 'Skupinový'),
    ]

    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        db_index=True
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

    last_activity = models.DateTimeField(
        auto_now=True,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['last_activity']),
        ]

    def clean(self):

        if self.type == Chat.GROUP and not self.name:
            raise ValidationError(
                'Group chat must have a name.'
            )

    def __str__(self):

        if self.name:
            return self.name

        return f'Chat {self.id}'


class ChatMember(models.Model):

    ROLE_OWNER = 'owner'
    ROLE_ADMIN = 'admin'
    ROLE_MEMBER = 'member'
    ROLE_CHOICES = [
        (ROLE_OWNER, 'Vlastník'),
        (ROLE_ADMIN, 'Správce'),
        (ROLE_MEMBER, 'Člen'),
    ]

    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='members'
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='chat_memberships'
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_MEMBER,
        db_index=True
    )

    joined_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        unique_together = ('chat', 'user')

        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['joined_at']),
        ]

    def __str__(self):
        return f'{self.user} in {self.chat}'


class Message(models.Model):

    MESSAGE_TEXT = 'text'
    MESSAGE_IMAGE = 'image'
    MESSAGE_GIF = 'gif'
    MESSAGE_TYPES = [
        (MESSAGE_TEXT, 'Text'),
        (MESSAGE_IMAGE, 'Image'),
        (MESSAGE_GIF, 'GIF'),
    ]

    chat = models.ForeignKey(
        Chat,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_messages'
    )

    content = models.TextField()

    type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default=MESSAGE_TEXT,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    is_read = models.BooleanField(
        default=False,
        db_index=True
    )

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
            models.Index(fields=['type']),
        ]

    def clean(self):

        if not self.content.strip():
            raise ValidationError(
                'Message content cannot be empty.'
            )

    def __str__(self):
        return f'Message {self.id}'


class Attachment(models.Model):

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='attachments'
    )

    file_url = models.URLField()

    file_type = models.CharField(
        max_length=50,
        db_index=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        indexes = [
            models.Index(fields=['file_type']),
        ]

    def __str__(self):
        return self.file_type


class Notification(models.Model):

    NOTIFICATION_MESSAGE = 'message'
    NOTIFICATION_FRIEND_REQUEST = 'friend_request'
    NOTIFICATION_GROUP_INVITE = 'group_invite'
    NOTIFICATION_GROUP_REMOVE = 'group_remove'
    NOTIFICATION_ROLE_CHANGED = 'role_changed'
    TYPE_CHOICES = [
        (NOTIFICATION_MESSAGE, 'Zpráva'),
        (NOTIFICATION_FRIEND_REQUEST, 'Žádost'),
        (NOTIFICATION_GROUP_INVITE, 'Pozvánka'),
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        db_index=True
    )

    content = models.TextField()

    is_read = models.BooleanField(
        default=False,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = ['-created_at']

        indexes = [
            models.Index(fields=['is_read']),
            models.Index(fields=['created_at']),
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

    is_resolved = models.BooleanField(
        default=False,
        db_index=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.CheckConstraint(
                condition=~Q(reporter=F('target')),
                name='prevent_self_report'
            )
        ]

    def clean(self):

        if self.reporter == self.target:
            raise ValidationError(
                'User cannot report themselves.'
            )

    def __str__(self):
        return f'Report {self.id}'
