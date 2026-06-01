from django.contrib import admin

from .models import (
    CustomUser,
    Profile,
    Relationship
)

admin.site.register(CustomUser)
admin.site.register(Profile)
admin.site.register(Relationship)