from datetime import timedelta
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils import timezone
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    # phone_number = models.CharField(max_length=11, unique=True)
    email = models.EmailField(unique=True)
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


class OtpCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='codes')
    code = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    code_expiry = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.full_name} - Code'

    # def set_code(self, otp_code):
    #     self.code = otp_code
    #     self.code_expiry = timezone.now() + timedelta(minutes=2)
    #     self.save()

    def is_valid(self, code):
        if self.is_used:
            return False

        if self.code != code:
            return False

        if timezone.now() > self.code_expiry:
            self.delete()
            return False

        return True

    @classmethod
    def clean_expired_codes(cls):
        cls.objects.filter(models.Q(is_used=True) | models.Q(code_expiry__lt=timezone.now())).delete()