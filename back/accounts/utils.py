from datetime import timedelta
from kavenegar import *
import random
from .models import User, OtpCode
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


def send_otp_code(phone_number):
    try:
        api = KavenegarAPI('37744F66472B576E51713139724856576A4C616B5379485059567778555345362F455A4E367978563758413D')
        code = random.randint(1000, 9999)
        params = {
            'sender': '2000660110',  # optional
            'receptor': phone_number,  # multiple mobile number, split by comma
            'message': f'{code}   کد تایید دنگ: ',
        }
        response = api.sms_send(params)
        print(response)
        user = User.objects.get(phone_number=phone_number)
        user.otp = code
        user.save()
    except APIException as e:
        print(e)
    except HTTPException as e:
        print(e)


def send_otp_code_via_email(email):
    subject = 'your Dong app verification code'
    code = random.randint(1000, 9999)
    message = f'{code}کد تایید دنگ: '
    email_from = settings.EMAIL_HOST
    try:
        send_mail(subject, message, email_from, [email])
        user = User.objects.get(email=email)
        OtpCode.objects.create(
            user = user,
            code = code,
            code_expiry = timezone.now() + timedelta(minutes=2)
        )
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False
