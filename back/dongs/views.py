from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, status
from .serializers import *
from .permissions import IsOwnerOrReadOnly
from decimal import Decimal


class DongCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DongSerializer

    def post(self, request):
        serializer = DongSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DongListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        dongs = Dong.objects.filter(created_by=request.user)
        serializer = DongSerializer(dongs, many=True)
        return Response(serializer.data)


class DongDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def delete(self, request, pk):
        try:
            dong = Dong.objects.get(id=pk)
        except Dong.DoesNotExist:
            return Response({"error": "No Dong has been found"}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, dong)
        dong.delete()
        return Response("dong has been deleted successfully", status=status.HTTP_200_OK)


class DongUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    serializer_class = DongSerializer

    def patch(self, request, pk):
        try:
            dong = Dong.objects.get(id=pk)
        except Dong.DoesNotExist:
            return Response({"error": "No Dong has been found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DongSerializer(
            dong,
            data=request.data,
            partial=True
        )

        self.check_object_permissions(request, dong)
        if serializer.is_valid():
            serializer.save()
            return Response("dong has been updated successfully", status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddDongMemberView(APIView):
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    serializer_class = DongMemberSerializer

    def post(self, request):
        serializer = DongMemberSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if DongMember.objects.filter(
                dong=serializer.validated_data['dong'],
                name=serializer.validated_data['name'],
        ).exists():
            return Response("A member with this name already exists in this dong.", status=status.HTTP_400_BAD_REQUEST)
        else:
            DongMember.objects.create(
                dong=serializer.validated_data['dong'],
                name=serializer.validated_data['name'],
            )

        return Response("Member added successfully", status=status.HTTP_200_OK)


class DeleteDongMember(APIView):
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]

    def delete(self, request, dong_id, member_name):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "No Dong has been found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            member = DongMember.objects.get(
                dong=dong,
                name=member_name,
            )
        except DongMember.DoesNotExist:
            return Response({"error": "No Dong Member has been found"}, status=status.HTTP_404_NOT_FOUND)

        member.delete()
        return Response("dong member has been deleted successfully", status=status.HTTP_200_OK)


class AddExpenseView(APIView):
    """
    ✅ اضافه کردن expense - با پشتیبانی از تعداد و مالیات
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExpenseCreateSerializer

    def post(self, request, dong_id):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "Dong not found"}, status=404)

        serializer = ExpenseCreateSerializer(
            data=request.data,
            context={'dong_id': dong_id}
        )

        if serializer.is_valid():
            participants = serializer.validated_data.pop('participants')
            expense_type = serializer.validated_data.get('expense_type', 'total')

            # محاسبه مبلغ کل خرج جدید
            amount = serializer.validated_data.get('amount')
            quantity = serializer.validated_data.get('quantity', 1)
            tax_percentage = serializer.validated_data.get('tax_percentage', 10.00)
            include_tax = serializer.validated_data.get('include_tax', False)

            base_amount = amount * quantity
            if include_tax:
                tax_amount = base_amount * (float(tax_percentage) / 100)
                new_expense_total = base_amount + tax_amount
            else:
                new_expense_total = base_amount

            # چک کردن بودجه
            if dong.total_budget is not None:
                remaining_budget = dong.get_remaining_budget()
                if new_expense_total > remaining_budget:
                    return Response({
                        "error": "بودجه کافی نیست!",
                        "details": {
                            "total_budget": float(dong.total_budget),
                            "current_expenses": round(dong.get_total_expenses(), 2),
                            "remaining_budget": round(remaining_budget, 2),
                            "new_expense_amount": round(new_expense_total, 2),
                            "shortage": round(new_expense_total - remaining_budget, 2)
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)

            # ذخیره expense
            expense = serializer.save(
                dong=dong,
                created_by=request.user
            )

            # اضافه کردن participants
            for member in participants:
                ExpenseParticipant.objects.create(
                    expense=expense,
                    member=member
                )

            return Response({
                "message": f"Expense created successfully (type: {expense_type})",
                "expense_id": expense.id,
                "expense_type": expense_type,
                "base_amount": expense.amount,
                "quantity": expense.quantity,
                "tax_percentage": float(expense.tax_percentage),
                "include_tax": expense.include_tax,
                "total_amount": round(expense.get_total_amount(), 2),
                "budget_info": {
                    "total_budget": float(dong.total_budget) if dong.total_budget else None,
                    "total_expenses": round(dong.get_total_expenses(), 2),
                    "remaining_budget": round(dong.get_remaining_budget(), 2) if dong.total_budget else None,
                    "burn_rate": dong.get_burn_rate()
                }
            }, status=201)

        return Response(serializer.errors, status=400)


class UpdateExpenseView(APIView):
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    serializer_class = ExpenseUpdateSerializer

    def patch(self, request, expense_id):
        try:
            expense = Expense.objects.get(id=expense_id)
        except Expense.DoesNotExist:
            return Response({"error": "No Expense has been found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExpenseUpdateSerializer(
            expense,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            dong = expense.dong

            # محاسبه مبلغ فعلی خرج (قبل از آپدیت)
            old_expense_total = expense.get_total_amount()

            # محاسبه مبلغ جدید خرج (بعد از آپدیت)
            amount = serializer.validated_data.get('amount', expense.amount)
            quantity = serializer.validated_data.get('quantity', expense.quantity)
            tax_percentage = serializer.validated_data.get('tax_percentage', expense.tax_percentage)
            include_tax = serializer.validated_data.get('include_tax', expense.include_tax)

            base_amount = amount * quantity
            if include_tax:
                tax_amount = base_amount * (float(tax_percentage) / 100)
                new_expense_total = base_amount + tax_amount
            else:
                new_expense_total = base_amount

            # چک کردن بودجه
            if dong.total_budget is not None:
                # محاسبه بودجه باقی‌مانده + مبلغ فعلی این خرج (چون قراره جایگزین بشه)
                remaining_budget = dong.get_remaining_budget() + Decimal(str(old_expense_total))

                if new_expense_total > remaining_budget:
                    return Response({
                        "error": "بودجه کافی نیست!",
                        "details": {
                            "total_budget": float(dong.total_budget),
                            "current_expenses": round(dong.get_total_expenses(), 2),
                            "old_expense_amount": round(old_expense_total, 2),
                            "new_expense_amount": round(new_expense_total, 2),
                            "available_budget": round(remaining_budget, 2),
                            "shortage": round(new_expense_total - remaining_budget, 2)
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)

            participants_data = serializer.validated_data.pop('participants', None)

            instance = serializer.save()

            if participants_data is not None:
                # Delete existing participants
                for participant in instance.participants.all():
                    participant.delete()
                # Add new participants
                for member in participants_data:
                    ExpenseParticipant.objects.create(expense=instance, member=member)

            # After saving, serialize the updated data with ExpenseListSerializer
            response_serializer = ExpenseListSerializer(instance)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def delete(self, request, pk):
        try:
            expense = Expense.objects.get(id=pk)
        except Expense.DoesNotExist:
            return Response({"error": "No Expense has been found"}, status=status.HTTP_404_NOT_FOUND)

        expense.delete()
        return Response("expense has been deleted successfully", status=status.HTTP_200_OK)


class ExpenseListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dong_id):
        expenses = Expense.objects.filter(dong=dong_id)
        serializer = ExpenseListSerializer(expenses, many=True)
        return Response(serializer.data)


class AddExpenseParticipantView(APIView):
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    serializer_class = ExpenseParticipantSerializer

    def post(self, request):
        serializer = ExpenseParticipantSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if ExpenseParticipant.objects.filter(
                expense=serializer.validated_data['expense'],
                member=serializer.validated_data['member'],
        ).exists():
            return Response("An expense participant with this name already exists in this expense.",
                            status=status.HTTP_400_BAD_REQUEST)
        else:
            ExpenseParticipant.objects.create(
                expense=serializer.validated_data['expense'],
                member=serializer.validated_data['member'],
            )
        return Response("Expense participant added successfully", status=status.HTTP_200_OK)


class BalanceView(APIView):
    """
    ✅ محاسبه balance با احتساب تعداد و مالیات
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dong_id):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "Dong not found"}, status=404)

        members = dong.members.all()
        balances = []

        for member in members:
            # چقدر پرداخت کرده (با احتساب تعداد و مالیات)
            paid_expenses = dong.expenses.filter(paid_by=member)
            paid = sum(exp.get_total_amount() for exp in paid_expenses)

            # سهمش از هزینه‌ها
            participated_expenses = ExpenseParticipant.objects.filter(
                member=member,
                expense__dong=dong
            )

            should_pay = Decimal('0')
            expense_details = []

            for participation in participated_expenses:
                expense = participation.expense
                participants_count = expense.participants.count()

                # محاسبه مبلغ کل با تعداد و مالیات
                total_amount = expense.get_total_amount()
                share = Decimal(total_amount) / Decimal(participants_count)
                should_pay += share

                expense_details.append({
                    "expense_title": expense.title,
                    "base_amount": expense.amount,
                    "quantity": expense.quantity,
                    "tax_percentage": float(expense.tax_percentage),
                    "include_tax": expense.include_tax,
                    "total_amount": round(total_amount, 2),
                    "expense_type": expense.expense_type,
                    "participants_count": participants_count,
                    "your_share": round(share, 2),
                    "paid_by": expense.paid_by.name
                })

            balance = paid - should_pay

            balances.append({
                "member": member.name,
                "paid": round(paid, 2),
                "should_pay": round(should_pay, 2),
                "balance": round(balance, 2),
                "status": "طلبکار" if balance > 0 else "بدهکار" if balance < 0 else "تسویه",
                "expense_details": expense_details
            })

        return Response({
            "dong_title": dong.title,
            "balances": balances
        })


class SettlementView(APIView):
    """
    ✅ الگوریتم تسویه بهبود یافته - هر بدهکار به طلبکارهای مختلف پول میده
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dong_id):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "Dong not found"}, status=404)

        members = dong.members.all()

        # محاسبه balance هر نفر با احتساب تعداد و مالیات
        member_balances = {}
        for member in members:
            paid_expenses = dong.expenses.filter(paid_by=member)
            paid = sum(exp.get_total_amount() for exp in paid_expenses)

            participated_expenses = ExpenseParticipant.objects.filter(
                member=member,
                expense__dong=dong
            )

            should_pay = Decimal('0')
            for participation in participated_expenses:
                expense = participation.expense
                participants_count = expense.participants.count()
                total_amount = expense.get_total_amount()
                share = Decimal(total_amount) / Decimal(participants_count)
                should_pay += share

            balance = paid - should_pay
            member_balances[member.name] = float(round(balance, 2))

        # ✅ الگوریتم بهبود یافته: جداسازی طلبکاران و بدهکاران
        creditors = [(name, bal) for name, bal in member_balances.items() if bal > 0]
        debtors = [(name, abs(bal)) for name, bal in member_balances.items() if bal < 0]

        # مرتب‌سازی برای بهینه‌سازی
        creditors.sort(key=lambda x: x[1], reverse=True)
        debtors.sort(key=lambda x: x[1], reverse=True)

        transactions = []

        # ✅ الگوریتم Greedy برای کمترین تعداد تراکنش
        creditor_idx = 0
        debtor_idx = 0

        creditor_remaining = list(creditors)  # کپی برای تغییر
        debtor_remaining = list(debtors)

        while creditor_idx < len(creditor_remaining) and debtor_idx < len(debtor_remaining):
            creditor_name, creditor_amount = creditor_remaining[creditor_idx]
            debtor_name, debtor_amount = debtor_remaining[debtor_idx]

            # حداقل مقدار قابل تسویه
            settle_amount = min(creditor_amount, debtor_amount)

            if settle_amount > 0.01:  # فقط مبالغ معنادار
                transactions.append({
                    "from": debtor_name,
                    "to": creditor_name,
                    "amount": round(settle_amount, 2),
                    "description": f"{debtor_name} باید {round(settle_amount, 2)} تومان به {creditor_name} بپردازد"
                })

            # به‌روزرسانی مقادیر
            creditor_remaining[creditor_idx] = (creditor_name, creditor_amount - settle_amount)
            debtor_remaining[debtor_idx] = (debtor_name, debtor_amount - settle_amount)

            # حرکت به بعدی اگر تسویه شد
            if creditor_remaining[creditor_idx][1] < 0.01:
                creditor_idx += 1
            if debtor_remaining[debtor_idx][1] < 0.01:
                debtor_idx += 1

        # خلاصه
        summary = {
            "total_expenses": round(sum(exp.get_total_amount() for exp in dong.expenses.all()), 2),
            "creditors": [{"name": name, "amount": round(amt, 2)} for name, amt in creditors],
            "debtors": [{"name": name, "amount": round(amt, 2)} for name, amt in debtors],
            "total_transactions": len(transactions)
        }

        return Response({
            "dong_title": dong.title,
            "summary": summary,
            "transactions": transactions,
            "member_balances": member_balances
        })


class MemberDetailView(APIView):
    """✅ جزئیات کامل یک عضو با احتساب تعداد و مالیات"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dong_id, member_name):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "Dong not found"}, status=404)

        try:
            member = dong.members.get(name=member_name)
        except:
            return Response({"error": "Member not found"}, status=404)

        # هزینه‌هایی که این عضو پرداخت کرده
        paid_expenses = dong.expenses.filter(paid_by=member)
        paid_list = []
        total_paid = Decimal('0')

        for expense in paid_expenses:
            participants = [p.member.name for p in expense.participants.all()]
            total_amount = expense.get_total_amount()

            paid_list.append({
                "title": expense.title,
                "base_amount": expense.amount,
                "quantity": expense.quantity,
                "tax_percentage": float(expense.tax_percentage),
                "include_tax": expense.include_tax,
                "total_amount": round(total_amount, 2),
                "expense_type": expense.expense_type,
                "participants": participants,
                "date": expense.created_at
            })
            total_paid += total_amount

        # هزینه‌هایی که در آن‌ها شرکت داشته
        participated = ExpenseParticipant.objects.filter(
            member=member,
            expense__dong=dong
        )

        participated_list = []
        total_share = Decimal('0')

        for participation in participated:
            expense = participation.expense
            participants_count = expense.participants.count()
            total_amount = expense.get_total_amount()
            share = Decimal(total_amount) / Decimal(participants_count)
            total_share += share

            participated_list.append({
                "title": expense.title,
                "base_amount": expense.amount,
                "quantity": expense.quantity,
                "tax_percentage": float(expense.tax_percentage),
                "include_tax": expense.include_tax,
                "total_amount": round(total_amount, 2),
                "expense_type": expense.expense_type,
                "paid_by": expense.paid_by.name,
                "participants_count": participants_count,
                "your_share": round(share, 2),
                "date": expense.created_at
            })

        balance = total_paid - total_share

        return Response({
            "member": member.name,
            "total_paid": round(total_paid, 2),
            "total_share": round(total_share, 2),
            "balance": round(balance, 2),
            "status": "طلبکار" if balance > 0 else "بدهکار" if balance < 0 else "تسویه",
            "paid_expenses": paid_list,
            "participated_expenses": participated_list
        })