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
    dong = models.ForeignKey(Dong, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.IntegerField()
    paid_by = models.ForeignKey(DongMember, on_delete=models.CASCADE, related_name='paid_expenses')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_expenses')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} in {self.dong.title} paid by {self.paid_by.name}'

#
# class ExpenseParticipant(models.Model):
#     expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='participants')
#     member = models.ForeignKey(DongMember, on_delete=models.CASCADE, related_name='shared_expenses')
#
#     class Meta:
#         unique_together = ('expense', 'member')
#
#     def __str__(self):
#         return f"{self.member.name} in {self.expense.title}"





