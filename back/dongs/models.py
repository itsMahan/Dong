from django.db import models
from accounts.models import User



class Dong(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dongs')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} - Created.By: {self.created_by.full_name}'


class DongMember(models.Model):
    dong = models.ForeignKey(Dong, on_delete=models.CASCADE, related_name='members')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} member of: {self.dong.title}"


class Expense(models.Model):
    EXPENSE_TYPE_CHOICES = [
        ('total', 'Total Expense'),
        ('individual', 'Individual Expense'),
    ]

    dong = models.ForeignKey(Dong, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.IntegerField()
    paid_by = models.ForeignKey(DongMember, on_delete=models.CASCADE, related_name='paid_expenses')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_expenses')
    created_at = models.DateTimeField(auto_now_add=True)
    expense_type = models.CharField(max_length=20, choices=EXPENSE_TYPE_CHOICES, default='total')
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=10.00,
        help_text="Tax percentage (e.g., 10 for 10%)"
    )
    include_tax = models.BooleanField(default=False)
    quantity = models.IntegerField(default=1, help_text="Number of items")

    def get_total_amount(self):
        """محاسبه مبلغ نهایی با احتساب مالیات"""
        base_amount = self.amount * self.quantity
        if self.include_tax:
            tax_amount = base_amount * (self.tax_percentage / 100)
            return base_amount + tax_amount
        return base_amount

    def __str__(self):
        return f'{self.title} in {self.dong.title} paid by {self.paid_by.name}'


class ExpenseParticipant(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='participants')
    member = models.ForeignKey(DongMember, on_delete=models.CASCADE, related_name='shared_expenses')

    class Meta:
        unique_together = ('expense', 'member')

    def __str__(self):
        return f"{self.member.name} in {self.expense.title}"





