from django.urls import path
from . import views


urlpatterns = [
    path('register', views.UserRegisterView.as_view(), name='user_register'),
    path('verify', views.UserVerifyOtp.as_view(), name='user_verification'),
    path('resend-code', views.ResendOtpView.as_view(), name='resend_otp_code'),
    path('forgot-password', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('rest-password', views.PasswordResetView.as_view(), name='reset_password'),
]