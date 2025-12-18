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

