from django.contrib import admin

from .models import (
    Chat,
    ChatMember,
    Message,
    Attachment,
    Notification,
    Report
)

admin.site.register(Chat)
admin.site.register(ChatMember)
admin.site.register(Message)
admin.site.register(Attachment)
admin.site.register(Notification)
admin.site.register(Report)
