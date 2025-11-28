from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView
from .utils import send_otp_code_via_email


class UserRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            send_otp_code_via_email(serializer.data['email'])
            return Response(data="Please Check Your Email Address for Verification Code", status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserVerifyOtp(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VerifyAccountSerializer

    def post(self, request):
        serializer =VerifyAccountSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.data['email']
            otp = serializer.data['otp']
            users = User.objects.filter(email=email)
            if not users.exists():
                return Response(data='Invalid email address', status=status.HTTP_400_BAD_REQUEST)

            if users[0].otp != otp:
                return Response(data='Wrong Verification Code', status=status.HTTP_400_BAD_REQUEST)

            user = users.first()
            user.is_verified = True
            user.otp = None
            user.save()
            return Response(data='Account Verified Successfully', status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
