from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from decimal import Decimal

from django.contrib.auth import get_user_model
from dongs.models import Dong, DongMember, Expense, ExpenseParticipant

User = get_user_model()

# =============================================================================
# UNDERSTANDING THIS FILE
# =============================================================================
#
# Your User model has NO username. It uses email as the login identifier.
# So to create a test user you always do:
#   User.objects.create_user(email='x@x.com', password='pass', full_name='Name')
#
# There are two kinds of tests here:
#
# 1. TestCase → Model tests. Pure Python, no HTTP. Fast.
#    Use when testing methods like get_total_amount() that have math/logic.
#
# 2. APITestCase → Integration tests. Simulates real HTTP requests.
#    self.client is a fake browser built into APITestCase.
#    self.client.force_authenticate(user) = logs in as that user instantly,
#    no password needed. This is test-only magic, not a security hole.
#
# Every test method MUST start with the word "test_" otherwise Django ignores it.
# setUp() runs fresh before EVERY test. The database is wiped between tests.
# =============================================================================


# =============================================================================
# PART 1: MODEL TESTS
# Testing the business logic inside your Dong/Expense model methods.
# These are pure Python — no HTTP requests involved.
# =============================================================================

class ExpenseModelTest(TestCase):

    def setUp(self):
        # Minimum setup: one user, one dong, one member.
        # This runs before EVERY test method below.
        self.user = User.objects.create_user(
            email='test@test.com',
            password='testpass123',
            full_name='Test User'
        )
        self.dong = Dong.objects.create(
            title='Test Dong',
            created_by=self.user,
            total_budget=Decimal('1000.00')
        )
        self.member = DongMember.objects.create(
            dong=self.dong,
            name='Ali'
        )

    def test_expense_total_without_tax(self):
        """
        amount=100, quantity=2, no tax → total must be 200.
        This is a multiplication, but it's YOUR code doing it. Test it.
        """
        expense = Expense.objects.create(
            dong=self.dong,
            title='Pizza',
            amount=100,
            quantity=2,
            include_tax=False,
            paid_by=self.member,
            created_by=self.user,
        )
        self.assertEqual(expense.get_total_amount(), 200)

    def test_expense_total_with_tax(self):
        """
        amount=100, quantity=1, tax=10% → total must be 110.
        (100 base) + (100 * 10/100 = 10 tax) = 110
        This is the most critical model test — tax logic can silently break.
        """
        expense = Expense.objects.create(
            dong=self.dong,
            title='Restaurant',
            amount=100,
            quantity=1,
            include_tax=True,
            tax_percentage=Decimal('10.00'),
            paid_by=self.member,
            created_by=self.user,
        )
        self.assertEqual(expense.get_total_amount(), 110)

    def test_expense_total_with_tax_and_quantity(self):
        """
        amount=100, quantity=3, tax=10% → base=300, tax=30 → total=330.
        Combining both quantity and tax together.
        """
        expense = Expense.objects.create(
            dong=self.dong,
            title='Drinks',
            amount=100,
            quantity=3,
            include_tax=True,
            tax_percentage=Decimal('10.00'),
            paid_by=self.member,
            created_by=self.user,
        )
        self.assertEqual(expense.get_total_amount(), 330)

    def test_dong_remaining_budget(self):
        """
        Dong budget=1000, we add a 300 expense → remaining must be 700.
        Tests get_remaining_budget() which calls get_total_expenses() internally.
        """
        Expense.objects.create(
            dong=self.dong,
            title='Groceries',
            amount=300,
            quantity=1,
            include_tax=False,
            paid_by=self.member,
            created_by=self.user,
        )
        self.assertEqual(self.dong.get_remaining_budget(), Decimal('700.00'))

    def test_dong_no_budget_returns_none(self):
        """
        If a Dong has no total_budget set, get_remaining_budget() should
        return None instead of crashing. Tests the None guard in your code.
        """
        dong_no_budget = Dong.objects.create(
            title='No Budget Dong',
            created_by=self.user,
            # no total_budget → defaults to None
        )
        self.assertIsNone(dong_no_budget.get_remaining_budget())

    def test_burn_rate_calculation(self):
        """
        budget=1000, expenses=500 → burn rate = 50%.
        get_burn_rate() returns a percentage float.
        """
        Expense.objects.create(
            dong=self.dong,
            title='Half budget gone',
            amount=500,
            quantity=1,
            include_tax=False,
            paid_by=self.member,
            created_by=self.user,
        )
        self.assertEqual(self.dong.get_burn_rate(), 50.0)

    def test_burn_rate_no_budget_returns_none(self):
        """
        No budget set → burn rate can't be calculated → must return None.
        """
        dong = Dong.objects.create(title='No Budget', created_by=self.user)
        self.assertIsNone(dong.get_burn_rate())


# =============================================================================
# PART 2: API TESTS
# Every test below fires a real HTTP request at your Django views.
# The database is real (test DB), the serializers run, permissions are checked.
# This is testing the FULL stack together.
# =============================================================================

class AuthenticationTest(APITestCase):
    """
    The most fundamental safety tests.
    Every endpoint requires login. Let's make sure that's actually enforced.
    If ANY of these fail, your API is publicly accessible — a security hole.
    """

    def test_unauthenticated_cannot_list_dongs(self):
        # We do NOT call force_authenticate → simulates a random internet user
        url = reverse('dongs:list_dongs')
        response = self.client.get(url)
        # 401 = "you need to be logged in"
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_create_dong(self):
        url = reverse('dongs:create_dong')
        response = self.client.post(url, {'title': 'Hacked'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_add_expense(self):
        url = reverse('dongs:add_expense', kwargs={'dong_id': 1})
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DongCRUDTest(APITestCase):
    """
    Tests for creating, listing, updating, and deleting Dongs.
    Also includes permission tests: can a stranger touch someone else's dong?
    """

    def setUp(self):
        # Two separate users. 'owner' owns the dong. 'stranger' should be blocked.
        self.owner = User.objects.create_user(
            email='owner@test.com',
            password='pass',
            full_name='Owner User'
        )
        self.stranger = User.objects.create_user(
            email='stranger@test.com',
            password='pass',
            full_name='Stranger User'
        )

    def test_authenticated_user_can_create_dong(self):
        """
        Log in as owner → POST to create → expect 201 Created.
        Also verify the dong actually saved to the database.
        """
        self.client.force_authenticate(user=self.owner)
        url = reverse('dongs:create_dong')
        response = self.client.post(url, {'title': 'Tehran Trip'})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Double-check it's actually in the DB, not just in the response
        self.assertTrue(Dong.objects.filter(title='Tehran Trip').exists())

    def test_list_returns_only_own_dongs(self):
        """
        Security test: user should ONLY see their own dongs.
        We create one dong for owner, one for stranger.
        When owner lists, they should only see 1 result, not 2.
        """
        Dong.objects.create(title='Owners Dong', created_by=self.owner)
        Dong.objects.create(title='Strangers Dong', created_by=self.stranger)

        self.client.force_authenticate(user=self.owner)
        url = reverse('dongs:list_dongs')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # only 1, not 2!
        self.assertEqual(response.data[0]['title'], 'Owners Dong')

    def test_owner_can_delete_own_dong(self):
        dong = Dong.objects.create(title='My Dong', created_by=self.owner)

        self.client.force_authenticate(user=self.owner)
        url = reverse('dongs:delete_dong', kwargs={'pk': dong.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Confirm it's actually gone from DB
        self.assertFalse(Dong.objects.filter(pk=dong.pk).exists())

    def test_stranger_cannot_delete_others_dong(self):
        """
        Permission test: tests your IsOwnerOrReadOnly class.
        Stranger is logged in but tries to delete the owner's dong.
        Should get 403 Forbidden (logged in, but not allowed).
        Note: 401 = not logged in. 403 = logged in but no permission.
        """
        dong = Dong.objects.create(title='Owners Dong', created_by=self.owner)

        self.client.force_authenticate(user=self.stranger)  # logged in as stranger
        url = reverse('dongs:delete_dong', kwargs={'pk': dong.pk})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        # Must still exist in DB — stranger shouldn't have deleted it
        self.assertTrue(Dong.objects.filter(pk=dong.pk).exists())

    def test_owner_can_update_own_dong(self):
        dong = Dong.objects.create(title='Old Title', created_by=self.owner)

        self.client.force_authenticate(user=self.owner)
        url = reverse('dongs:update_dong', kwargs={'pk': dong.pk})
        response = self.client.patch(url, {'title': 'New Title'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dong.refresh_from_db()  # reload the object from DB
        self.assertEqual(dong.title, 'New Title')

    def test_delete_nonexistent_dong_returns_404(self):
        self.client.force_authenticate(user=self.owner)
        url = reverse('dongs:delete_dong', kwargs={'pk': 99999})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class DongMemberTest(APITestCase):
    """Tests for adding and deleting members from a dong."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@test.com',
            password='pass',
            full_name='Test User'
        )
        self.client.force_authenticate(user=self.user)
        self.dong = Dong.objects.create(title='Trip', created_by=self.user)

    def test_add_member_successfully(self):
        url = reverse('dongs:add_member')
        response = self.client.post(url, {'dong': self.dong.pk, 'name': 'Sara'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(DongMember.objects.filter(name='Sara', dong=self.dong).exists())

    def test_duplicate_member_name_is_rejected(self):
        """
        Your view has a duplicate-name check. Let's make sure it works.
        Adding 'Sara' twice to the same dong should fail on the second attempt.
        """
        DongMember.objects.create(dong=self.dong, name='Sara')

        url = reverse('dongs:add_member')
        response = self.client.post(url, {'dong': self.dong.pk, 'name': 'Sara'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Still only 1 Sara, not 2
        self.assertEqual(DongMember.objects.filter(name='Sara', dong=self.dong).count(), 1)

    def test_delete_member_successfully(self):
        member = DongMember.objects.create(dong=self.dong, name='Reza')
        url = reverse('dongs:delete_member', kwargs={
            'dong_id': self.dong.pk,
            'member_name': 'Reza'
        })
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(DongMember.objects.filter(pk=member.pk).exists())


class ExpenseJourneyTest(APITestCase):
    """
    The most important test class. Simulates a full real user journey:
    user has a dong with members → adds expenses → checks results.
    """

    def setUp(self):
        self.user = User.objects.create_user(
            email='mahan@test.com',
            password='pass',
            full_name='Mahan'
        )
        self.client.force_authenticate(user=self.user)

        # We create dong and members directly in the DB (bypassing the API).
        # This is fine for setUp — we're testing expenses, not dong creation.
        self.dong = Dong.objects.create(title='Dinner', created_by=self.user)
        self.ali = DongMember.objects.create(dong=self.dong, name='Ali')
        self.reza = DongMember.objects.create(dong=self.dong, name='Reza')

    def _expense_payload(self, overrides=None):
        """
        Helper method (not a test — no "test_" prefix) that returns a valid
        expense payload. Tests call this and override specific fields to test
        edge cases. This avoids copy-pasting the same dict 5 times.
        """
        payload = {
            'title': 'Pizza',
            'amount': 300000,
            'paid_by': self.ali.pk,
            'participants': [self.ali.pk, self.reza.pk],
            'expense_type': 'total',
            'quantity': 1,
            'tax_percentage': '0.00',
            'include_tax': False,
        }
        if overrides:
            payload.update(overrides)
        return payload

    def test_add_expense_successfully(self):
        """Valid data → 200 OK and expense exists in DB."""
        url = reverse('dongs:add_expense', kwargs={'dong_id': self.dong.pk})
        response = self.client.post(url, self._expense_payload(), format='json')

        # format='json' is needed when sending lists (participants=[...])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Expense.objects.filter(title='Pizza').exists())

    def test_expense_with_tax_calculates_correctly(self):
        """
        amount=1000, quantity=1, tax=10%, include_tax=True
        → total should be 1100 in the response.
        """
        url = reverse('dongs:add_expense', kwargs={'dong_id': self.dong.pk})
        payload = self._expense_payload({
            'amount': 1000,
            'include_tax': True,
            'tax_percentage': '10.00',
        })
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], 1100.0)

    def test_paid_by_member_from_different_dong_is_rejected(self):
        """
        Serializer validation test.
        'paid_by' must belong to THIS dong, not any random dong.
        Using a member from another dong should return 400.
        """
        other_dong = Dong.objects.create(title='Other Dong', created_by=self.user)
        outsider = DongMember.objects.create(dong=other_dong, name='Outsider')

        url = reverse('dongs:add_expense', kwargs={'dong_id': self.dong.pk})
        response = self.client.post(
            url,
            self._expense_payload({'paid_by': outsider.pk}),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expense_exceeds_budget_is_rejected(self):
        """
        If dong has a budget and the expense would exceed it → 400.
        Tests the budget guard logic inside AddExpenseView.
        """
        self.dong.total_budget = Decimal('100.00')
        self.dong.save()

        url = reverse('dongs:add_expense', kwargs={'dong_id': self.dong.pk})
        response = self.client.post(
            url,
            self._expense_payload({'amount': 999999}),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)  # should explain the error

    def test_individual_expense_without_participants_is_rejected(self):
        """
        expense_type='individual' with empty participants → 400.
        Tests the validate() method in ExpenseCreateSerializer.
        """
        url = reverse('dongs:add_expense', kwargs={'dong_id': self.dong.pk})
        response = self.client.post(
            url,
            self._expense_payload({'expense_type': 'individual', 'participants': []}),
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_expense_list_returns_created_expenses(self):
        """
        Create an expense → GET the list → it should appear.
        Full round trip: write then read.
        """
        Expense.objects.create(
            dong=self.dong,
            title='Coffee',
            amount=50000,
            paid_by=self.ali,
            created_by=self.user,
        )
        url = reverse('dongs:list_expenses', kwargs={'dong_id': self.dong.pk})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Coffee')

    def test_add_expense_to_nonexistent_dong_returns_404(self):
        url = reverse('dongs:add_expense', kwargs={'dong_id': 99999})
        response = self.client.post(url, self._expense_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)