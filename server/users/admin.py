from django.contrib import admin

from .models import (
    CustomUser,
    Profile,
    Relationship,
    AuditLog
)

admin.site.register(CustomUser)
admin.site.register(Profile)
admin.site.register(Relationship)
admin.site.register(AuditLog)