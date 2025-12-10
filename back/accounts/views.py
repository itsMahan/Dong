from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView
from .utils import send_otp_code_via_email
from .models import User, OtpCode


class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            # پاک کردن کدهای قدیمی این کاربر
            # OtpCode.objects.filter(user=user).delete()

            if send_otp_code_via_email(user.email):
                return Response(data="Please Check Your Email Address for Verification Code", status=status.HTTP_201_CREATED)
            else:
                # اگه ارسال ایمیل ناموفق بود، کاربر رو پاک کن
                user.delete()
                return Response(
                    {'error': "Error while sending email, Try again"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserVerifyOtp(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VerifyOtpSerializer

    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.data['email']
            code = int(serializer.data['otp'])

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(data='User not found with given email address', status=status.HTTP_404_NOT_FOUND)

            otp = OtpCode.objects.filter(
                user=user,
                code=code,
                is_used=False).order_by('-created_at').first()
            if not otp:
                return Response(data='Invalid Code', status=status.HTTP_404_NOT_FOUND)
            if otp.is_valid(code):
                otp.is_used = True
                otp.save()

                user.is_verified = True
                user.save()
                return Response(data='Account Verified Successfully', status=status.HTTP_200_OK)

            else:
                return Response(data='Verification Code expired or invalid', status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendOtpView(APIView):
    """ارسال مجدد کد OTP"""
    permission_classes = [permissions.AllowAny]
    serializer_class = ResendOtpSerializer

    def post(self, request):
        # email = request.data.get('email')
        serializer = ResendOtpSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.data['email']

        try:
            User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found with given email address'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ارسال کد
        if send_otp_code_via_email(email):
            return Response(
                {'message': 'New code has been sent'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Error Sending email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found with given email address'},
                status=status.HTTP_404_NOT_FOUND
            )

        if send_otp_code_via_email(email):
            return Response(
                {'message': 'New code has been sent'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Error Sending email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        code = int(serializer.validated_data['otp'])
        new_password = serializer.validated_data['new_password']

        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found with given email address'},
                status=status.HTTP_404_NOT_FOUND
            )

        otp = OtpCode.objects.filter(
            user = user,
            code = code,
            is_used = False,
        ).order_by('-created_at').first()

        if not otp:
            return Response(
                {'error': 'Invalid Code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if otp.is_valid(code):
            otp.is_used = True
            otp.save()

            user.set_password(new_password)
            user.save()
            return Response(
                {'message': 'Password changed successfully'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Code expired or invalid'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
