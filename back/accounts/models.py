from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils import timezone
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    # phone_number = models.CharField(max_length=11, unique=True)
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=4, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    full_name = models.CharField(max_length=255)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f'{self.full_name} - {self.email}'
