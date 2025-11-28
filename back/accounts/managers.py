from django.contrib.auth.base_user import BaseUserManager



class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("You must provide an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        user = self.create_user(email=email, password=password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user
