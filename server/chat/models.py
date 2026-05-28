from django.db import models
from users.models import CustomUser

class Chat(models.Model):
    TYPE_CHOICES = [
        ('private', 'Soukromý'),
        ('group', 'Skupinový'),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    name = models.CharField(max_length=100, blank=True, null=True)
    image = models.URLField(blank=True, null=True)
    last_activity = models.DateTimeField(auto_now=True)

class ChatMember(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Vlastník'),
        ('admin', 'Správce'),
        ('member', 'Člen'),
    ]
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

class Attachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file_url = models.URLField()
    file_type = models.CharField(max_length=50)