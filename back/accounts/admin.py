from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User

admin.site.register(User)

# @admin.register(CustomUser)
# class CustomUserAdmin(UserAdmin):
#     model = CustomUser
#     list_display = ("phone_number" ,"email", "full_name", "is_staff", "is_active", "is_verified")
#     # list_filter = ()
#     # ordering = ("email",)
#     search_fields = ("full_name", "phone_number")
#
#     fieldsets = (
#         (None, {"fields": ("email", "password")}),
#         ("Personal info", {"fields": ("full_name")}),
#         ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
#         ("Important dates", {"fields": ("last_login", "date_joined")}),
#     )
#
#     add_fieldsets = (
#         (None, {
#             "classes": ("wide",),
#             "fields": ("email", "phone_number", "full_name", "password1", "password2", "is_staff", "is_active"),
#         }),
#     )