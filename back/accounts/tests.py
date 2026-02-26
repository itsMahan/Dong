from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth import get_user_model
from accounts.models import OtpCode

User = get_user_model()

# =============================================================================
# UNDERSTANDING THE ACCOUNTS APP TESTS
# =============================================================================
#
# Your accounts app has one tricky thing: registration sends an OTP email.
# We can't actually send real emails in tests (no SMTP server, slow, unreliable).
# So we use "mocking" — we fake/replace the email function with a dummy.
#
# @patch('accounts.views.send_otp_code_via_email')
# This decorator intercepts the call to send_otp_code_via_email inside views.py
# and replaces it with a fake function (mock_send_otp).
# The mock does nothing (no real email sent) and returns whatever we tell it to.
#
# This is a very common and important testing pattern. Remember it.
# =============================================================================


class UserModelTest(TestCase):
    """
    Tests for the User model and UserManager.
    No HTTP here — just testing that creating users works correctly.
    """

    def test_create_user_successfully(self):
        """
        Basic sanity check: can we create a user at all?
        Tests that UserManager.create_user() works with email + password + full_name.
        """
        user = User.objects.create_user(
            email='ali@test.com',
            password='securepass123',
            full_name='Ali Ahmadi'
        )
        self.assertEqual(user.email, 'ali@test.com')
        self.assertEqual(user.full_name, 'Ali Ahmadi')
        self.assertTrue(user.check_password('securepass123'))  # password is hashed, not stored raw
        self.assertFalse(user.is_verified)   # new users are NOT verified by default
        self.assertFalse(user.is_staff)      # not staff by default
        self.assertTrue(user.is_active)      # active by default

    def test_user_email_is_normalized(self):
        """
        Email normalization means the domain part gets lowercased.
        'Ali@TEST.COM' should be stored as 'Ali@test.com'.
        Your UserManager calls normalize_email() — this tests that it works.
        """
        user = User.objects.create_user(
            email='Ali@TEST.COM',
            password='pass',
            full_name='Ali'
        )
        self.assertEqual(user.email, 'Ali@test.com')

    def test_create_user_without_email_raises_error(self):
        """
        Your UserManager raises ValueError if no email is provided.
        This test confirms that guard works.
        assertRaises() verifies that the code inside the 'with' block raises the expected error.
        """
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='pass', full_name='Ali')

    def test_create_superuser(self):
        """
        Superusers must have is_staff=True and is_superuser=True.
        """
        admin = User.objects.create_superuser(
            email='admin@test.com',
            password='adminpass'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_user_str_representation(self):
        """
        Tests the __str__ method of User.
        Your model returns "{full_name} - {email}".
        """
        user = User.objects.create_user(
            email='test@test.com',
            password='pass',
            full_name='Mahan'
        )
        self.assertEqual(str(user), 'Mahan - test@test.com')


class OtpCodeModelTest(TestCase):
    """Tests for the OtpCode model's validation logic."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@test.com',
            password='pass',
            full_name='Test'
        )

    def _create_otp(self, code=1234, minutes_until_expiry=2, is_used=False):
        """
        Helper to create an OTP. Not a test itself (no "test_" prefix).
        Tests call this to avoid repeating OtpCode.objects.create() everywhere.
        """
        return OtpCode.objects.create(
            user=self.user,
            code=code,
            code_expiry=timezone.now() + timedelta(minutes=minutes_until_expiry),
            is_used=is_used,
        )

    def test_valid_otp_returns_true(self):
        """Fresh, unused, correct code → is_valid() must return True."""
        otp = self._create_otp(code=1234)
        self.assertTrue(otp.is_valid(1234))

    def test_wrong_code_returns_false(self):
        """Correct OTP exists but user submits wrong number → False."""
        otp = self._create_otp(code=1234)
        self.assertFalse(otp.is_valid(9999))

    def test_used_otp_returns_false(self):
        """Once marked is_used=True, the OTP must be rejected."""
        otp = self._create_otp(code=1234, is_used=True)
        self.assertFalse(otp.is_valid(1234))

    def test_expired_otp_returns_false(self):
        """
        OTP expired 5 minutes ago → is_valid() must return False.
        timedelta(minutes=-5) means the expiry is set to 5 minutes in the PAST.
        """
        otp = self._create_otp(code=1234, minutes_until_expiry=-5)
        self.assertFalse(otp.is_valid(1234))


class UserRegistrationTest(APITestCase):
    """
    Tests for the registration endpoint.
    Registration triggers an email OTP — we mock that out so no real email is sent.
    """

    def test_register_with_valid_data(self):
        """
        @patch replaces send_otp_code_via_email with a fake that returns True.
        This simulates "email sent successfully" without actually sending anything.
        mock_send_otp is the fake function injected by @patch as a parameter.
        """
        with patch('accounts.views.send_otp_code_via_email', return_value=True):
            url = reverse('user_register')
            data = {
                'email': 'newuser@test.com',
                'password': 'securepass123',
                'password2': 'securepass123',
                'full_name': 'New User',
            }
            response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # User was created in DB but NOT yet verified (needs OTP first)
        user = User.objects.get(email='newuser@test.com')
        self.assertFalse(user.is_verified)

    def test_register_with_mismatched_passwords(self):
        """
        password and password2 don't match → 400 Bad Request.
        Tests the validate() method in UserRegisterSerializer.
        """
        url = reverse('user_register')
        data = {
            'email': 'user@test.com',
            'password': 'password123',
            'password2': 'differentpassword',  # doesn't match!
            'full_name': 'Test User',
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_with_duplicate_email(self):
        """
        Email must be unique. Registering the same email twice should fail.
        """
        User.objects.create_user(
            email='existing@test.com',
            password='pass',
            full_name='Existing'
        )
        with patch('accounts.views.send_otp_code_via_email', return_value=True):
            url = reverse('user_register')
            data = {
                'email': 'existing@test.com',  # already exists!
                'password': 'pass123',
                'password2': 'pass123',
                'full_name': 'Another User',
            }
            response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_without_email_fails(self):
        """Missing required field → 400."""
        url = reverse('user_register')
        data = {
            'password': 'pass123',
            'password2': 'pass123',
            'full_name': 'No Email User',
            # no 'email' field!
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_send_failure_deletes_user(self):
        """
        If the OTP email fails to send, the user should be deleted.
        Your view deletes the user and returns 500 in this case.
        We mock the email function to return False (simulate failure).
        """
        with patch('accounts.views.send_otp_code_via_email', return_value=False):
            url = reverse('user_register')
            data = {
                'email': 'fail@test.com',
                'password': 'pass123',
                'password2': 'pass123',
                'full_name': 'Fail User',
            }
            response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        # User must have been cleaned up — should NOT exist in DB
        self.assertFalse(User.objects.filter(email='fail@test.com').exists())


class OtpVerificationTest(APITestCase):
    """Tests for the OTP verification endpoint."""

    def setUp(self):
        # Create an unverified user and a valid OTP for them
        self.user = User.objects.create_user(
            email='verify@test.com',
            password='pass',
            full_name='Verify User'
        )
        self.otp = OtpCode.objects.create(
            user=self.user,
            code=1234,
            code_expiry=timezone.now() + timedelta(minutes=2),
            is_used=False,
        )

    def test_verify_with_correct_code(self):
        """
        Submit correct email + OTP → user becomes verified and gets JWT tokens.
        """
        url = reverse('user_verification')
        response = self.client.post(url, {'email': 'verify@test.com', 'otp': '1234'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check the response has JWT tokens
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        # User must now be verified in DB
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)

    def test_verify_with_wrong_code(self):
        """Wrong OTP → 404."""
        url = reverse('user_verification')
        response = self.client.post(url, {'email': 'verify@test.com', 'otp': '9999'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_verify_with_nonexistent_email(self):
        """Email doesn't exist in DB → 404."""
        url = reverse('user_verification')
        response = self.client.post(url, {'email': 'nobody@test.com', 'otp': '1234'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_verify_with_expired_code(self):
        """
        OTP exists but expired 10 minutes ago → should fail.
        We create a separate expired OTP for this test.
        """
        expired_otp = OtpCode.objects.create(
            user=self.user,
            code=5678,
            code_expiry=timezone.now() - timedelta(minutes=10),  # in the past!
            is_used=False,
        )
        url = reverse('user_verification')
        response = self.client.post(url, {'email': 'verify@test.com', 'otp': '5678'})
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])


class LoginTest(APITestCase):
    """
    Tests for JWT login (CustomTokenObtainPairView).
    Your login serializer rejects unverified users — test that.
    """

    def setUp(self):
        self.verified_user = User.objects.create_user(
            email='verified@test.com',
            password='pass123',
            full_name='Verified User'
        )
        self.verified_user.is_verified = True
        self.verified_user.save()

        self.unverified_user = User.objects.create_user(
            email='unverified@test.com',
            password='pass123',
            full_name='Unverified User'
        )
        # is_verified stays False (default)

    def test_verified_user_can_login(self):
        """Correct credentials + is_verified=True → 200 with tokens."""
        url = reverse('login')  # standard simplejwt URL name
        response = self.client.post(url, {
            'email': 'verified@test.com',
            'password': 'pass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_unverified_user_cannot_login(self):
        """
        Valid credentials but is_verified=False → login rejected.
        Your CustomTokenObtainPairSerializer raises an error for unverified users.
        """
        url = reverse('login')
        response = self.client.post(url, {
            'email': 'unverified@test.com',
            'password': 'pass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_wrong_password_rejected(self):
        url = reverse('login')
        response = self.client.post(url, {
            'email': 'verified@test.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)