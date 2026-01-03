from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, status
from .serializers import *
from .permissions import IsOwnerOrReadOnly


class DongCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DongSerializer

    def post(self, request):
        serializer = DongSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(created_by=request.user)
        return Response(serializer.data , status=status.HTTP_201_CREATED)


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
        # Enforce object-level permissions
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
            dong,                  # instance to update
            data=request.data,
            partial=True           # allow partial update
        )

        # Enforce object-level permissions
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
            dong = serializer.validated_data['dong'],
            name = serializer.validated_data['name'],
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
                dong = dong,
                name = member_name,
            )
        except DongMember.DoesNotExist:
            return Response({"error": "No Dong Member has been found"}, status=status.HTTP_404_NOT_FOUND)

        # self.check_object_permissions(request, member)
        member.delete()
        return Response("dong member has been deleted successfully", status=status.HTTP_200_OK)


class AddExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExpenseCreateSerializer  # ✅ تغییر

    def post(self, request, dong_id):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "Dong not found"}, status=404)

        serializer = ExpenseCreateSerializer(  # ✅ تغییر
            data=request.data,
            context={'dong_id': dong_id}
        )

        if serializer.is_valid():
            # ✅ جدا کردن participants قبل از save
            participants = serializer.validated_data.pop('participants')

            # ذخیره expense
            expense = serializer.save(
                dong=dong,
                created_by=request.user
            )

            for member in participants:
                ExpenseParticipant.objects.create(
                    expense=expense,
                    member=member
                )

            return Response({"message": "Expense created"}, status=201)

        return Response(serializer.errors, status=400)


class UpdateExpenseView(APIView):
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    serializer_class = ExpenseUpdateSerializer

    def patch(self, request, pk):
        try:
            expense = Expense.objects.get(id=pk)
        except Expense.DoesNotExist:
            return Response({"error": "No Expense has been found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ExpenseSerializer(
            expense,  # instance to update
            data=request.data,
            partial=True  # allow partial update
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
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
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)


class AddExpenseParticipantView(APIView):
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    serializer_class = ExpenseParticipantSerializer

    def post(self, request):
        serializer = ExpenseParticipantSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if ExpenseParticipant.objects.filter(
            expense = serializer.validated_data['expense'],
            member = serializer.validated_data['member'],
        ).exists():
            return Response("An expense participant with this name already exists in this expense.", status=status.HTTP_400_BAD_REQUEST)
        else:
            ExpenseParticipant.objects.create(
                expense=serializer.validated_data['expense'],
                member=serializer.validated_data['member'],
            )
        return Response("Expense participant added successfully", status=status.HTTP_200_OK)


# class BalanceView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get(self, request, dong_id):
#         try:
#             dong = Dong.objects.get(id=dong_id)
#         except Dong.DoesNotExist:
#             return Response({"error": "Dong not found"}, status=404)
#
#         # همه اعضا
#         members = dong.members.all()
#
#         # محاسبه برای هر عضو
#         balances = []
#         for member in members:
#             # چقدر پرداخت کرده
#             paid = dong.expenses.filter(paid_by=member).aggregate(
#                 total=models.Sum('amount')
#             )['total'] or 0
#
#             # در چه هزینه‌هایی شرکت داشته
#             participated_expenses = ExpenseParticipant.objects.filter(
#                 member=member,
#                 expense__dong=dong
#             )
#
#             # سهمش از هر هزینه
#             should_pay = 0
#             for participation in participated_expenses:
#                 expense = participation.expense
#                 # تعداد شرکت‌کننده‌های این هزینه
#                 participants_count = expense.participants.count()
#                 # سهم این عضو = مبلغ کل / تعداد شرکت‌کننده‌ها
#                 share = expense.amount / participants_count
#                 should_pay += share
#
#             # تسویه = پرداخت شده - سهم
#             balance = paid - should_pay
#
#             balances.append({
#                 "member": member.name,
#                 "paid": paid,
#                 "should_pay": should_pay,
#                 "balance": balance,
#                 "status": "طلبکار" if balance > 0 else "بدهکار" if balance < 0 else "تسویه"
#             })
#
#         return Response(balances)

class BalanceView(APIView):
    """نمایش balance هر عضو - چقدر پرداخت کرده، چقدر باید بپردازد، بدهکار یا طلبکار"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dong_id):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "Dong not found"}, status=404)

        members = dong.members.all()
        balances = []

        for member in members:
            # چقدر پرداخت کرده
            paid = dong.expenses.filter(paid_by=member).aggregate(
                total=models.Sum('amount')
            )['total'] or 0

            # سهمش از هزینه‌ها
            participated_expenses = ExpenseParticipant.objects.filter(
                member=member,
                expense__dong=dong
            )

            should_pay = 0
            expense_details = []

            for participation in participated_expenses:
                expense = participation.expense
                participants_count = expense.participants.count()
                share = expense.amount / participants_count
                should_pay += share

                expense_details.append({
                    "expense_title": expense.title,
                    "total_amount": expense.amount,
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
    """محاسبه دقیق تسویه - چه کسی به چه کسی چقدر باید بده"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, dong_id):
        try:
            dong = Dong.objects.get(id=dong_id)
        except Dong.DoesNotExist:
            return Response({"error": "Dong not found"}, status=404)

        members = dong.members.all()

        # محاسبه balance هر نفر
        member_balances = {}
        for member in members:
            paid = dong.expenses.filter(paid_by=member).aggregate(
                total=models.Sum('amount')
            )['total'] or 0

            participated_expenses = ExpenseParticipant.objects.filter(
                member=member,
                expense__dong=dong
            )

            should_pay = 0
            for participation in participated_expenses:
                expense = participation.expense
                participants_count = expense.participants.count()
                share = expense.amount / participants_count
                should_pay += share

            balance = paid - should_pay
            member_balances[member.name] = round(balance, 2)

        # جدا کردن طلبکاران و بدهکاران
        creditors = {name: bal for name, bal in member_balances.items() if bal > 0}
        debtors = {name: abs(bal) for name, bal in member_balances.items() if bal < 0}

        # الگوریتم تسویه با کمترین تراکنش
        transactions = []

        creditors_list = list(creditors.items())
        debtors_list = list(debtors.items())

        i, j = 0, 0
        while i < len(creditors_list) and j < len(debtors_list):
            creditor_name, creditor_amount = creditors_list[i]
            debtor_name, debtor_amount = debtors_list[j]

            # کمترین مقدار بین طلب و بدهی
            amount = min(creditor_amount, debtor_amount)

            transactions.append({
                "from": debtor_name,
                "to": creditor_name,
                "amount": round(amount, 2),
                "description": f"{debtor_name} باید {round(amount, 2)} تومان به {creditor_name} بپردازد"
            })

            # به‌روزرسانی مقادیر
            creditors_list[i] = (creditor_name, creditor_amount - amount)
            debtors_list[j] = (debtor_name, debtor_amount - amount)

            # اگر طلبکار تسویه شد، برو به بعدی
            if creditors_list[i][1] == 0:
                i += 1

            # اگر بدهکار تسویه شد، برو به بعدی
            if debtors_list[j][1] == 0:
                j += 1

        # خلاصه
        summary = {
            "total_expenses": round(
                sum(member_balances.values()) + sum(abs(v) for v in member_balances.values() if v < 0), 2),
            "creditors": [{"name": name, "amount": round(amt, 2)} for name, amt in creditors.items()],
            "debtors": [{"name": name, "amount": round(amt, 2)} for name, amt in debtors.items()],
            "total_transactions": len(transactions)
        }

        return Response({
            "dong_title": dong.title,
            "summary": summary,
            "transactions": transactions,
            "member_balances": member_balances
        })


class MemberDetailView(APIView):
    """جزئیات کامل یک عضو - چه هزینه‌هایی پرداخت کرده، در چه هزینه‌هایی شرکت داشته"""
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
        total_paid = 0

        for expense in paid_expenses:
            participants = [p.member.name for p in expense.participants.all()]
            paid_list.append({
                "title": expense.title,
                "amount": expense.amount,
                "participants": participants,
                "date": expense.created_at
            })
            total_paid += expense.amount

        # هزینه‌هایی که در آن‌ها شرکت داشته
        participated = ExpenseParticipant.objects.filter(
            member=member,
            expense__dong=dong
        )

        participated_list = []
        total_share = 0

        for participation in participated:
            expense = participation.expense
            participants_count = expense.participants.count()
            share = expense.amount / participants_count
            total_share += share

            participated_list.append({
                "title": expense.title,
                "total_amount": expense.amount,
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