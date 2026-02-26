from django.core.management.base import BaseCommand
from faker import Faker
import random
from decimal import Decimal

from accounts.models import User
from dongs.models import Dong, DongMember, Expense, ExpenseParticipant


class Command(BaseCommand):
    help = 'Generate realistic fake data for the Dong app'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fake = Faker()

    def add_arguments(self, parser):
        parser.add_argument('--users', type=int, default=3)
        parser.add_argument('--dongs', type=int, default=2)

    def handle(self, *args, **options):
        self.stdout.write('Creating fake data...\n')

        for _ in range(options['users']):

            user = User.objects.create_user(
                email=self.fake.unique.email(),
                password='pass@123',
                full_name=self.fake.name(),
                is_verified=True,
            )
            self.stdout.write(f'  User created: {user.email}')

            for _ in range(options['dongs']):

                has_budget = random.choice([True, False])
                total_budget = Decimal(random.randint(500000, 5000000)) if has_budget else None

                dong = Dong.objects.create(
                    title=f'{self.fake.city()} Trip',
                    created_by=user,
                    total_budget=total_budget,
                )
                self.stdout.write(f'    Dong created: {dong.title}')

                members = [
                    DongMember.objects.create(dong=dong, name=self.fake.first_name())
                    for _ in range(random.randint(3, 6))
                ]
                self.stdout.write(f'      {len(members)} members added')

                spent = Decimal('0')
                expense_count = 0

                for _ in range(random.randint(5, 15)):

                    if total_budget is not None:
                        remaining = total_budget - spent
                        if remaining <= 0:
                            break
                        max_amount = min(200000, int(remaining))
                        if max_amount < 1000:
                            break
                        amount = random.randint(1000, max_amount)
                    else:
                        amount = random.randint(10000, 500000)

                    expense = Expense.objects.create(
                        dong=dong,
                        title=random.choice(['Restaurant', 'Taxi', 'Hotel', 'Coffee', 'Grocery']),
                        amount=amount,
                        paid_by=random.choice(members),
                        created_by=user,
                        expense_type=random.choice(['total', 'individual']),
                        quantity=1,
                        tax_percentage=Decimal('0.00'),
                        include_tax=False,
                    )

                    spent += Decimal(amount)
                    expense_count += 1

                    for member in random.sample(members, random.randint(1, len(members))):
                        ExpenseParticipant.objects.create(expense=expense, member=member)

                self.stdout.write(f'      {expense_count} expenses added')

        self.stdout.write(self.style.SUCCESS('\nDone! Password for all users: pass@123'))