from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'Běžný uživatel'),
        ('admin', 'Administrátor'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

class Profile(models.Model):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('dnd', 'Nerušit'),
    ]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    avatar = models.URLField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')

class Relationship(models.Model):
    TYPE_CHOICES = [
        ('friend', 'Přítel'),
        ('request', 'Žádost o přátelství'),
        ('block', 'Blokováno'),
    ]
    user_a = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='rel_initiated')
    user_b = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='rel_received')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    class Meta:
        unique_together = ('user_a', 'user_b')