from django.template.defaultfilters import title
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, status
from .models import *
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
        return Response({"message" : "a dongs has been created"} , status=status.HTTP_201_CREATED)


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
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    serializer_class = ExpenseSerializer

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if Expense.objects.filter(
            dong = serializer.validated_data['dong'],
            title = serializer.validated_data['title'],
        ).exists():
            return Response("An expense with this title already exists in this dong.", status=status.HTTP_400_BAD_REQUEST)
        else:
            Expense.objects.create(
                dong=serializer.validated_data['dong'],
                title=serializer.validated_data['title'],
                amount=serializer.validated_data['amount'],
                paid_by=serializer.validated_data['paid_by'],
                created_by=request.user,
            )
        return Response("Expense added successfully", status=status.HTTP_200_OK)


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
            return Response("Expense has been updated successfully", status=status.HTTP_200_OK)
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