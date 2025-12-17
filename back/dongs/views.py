from django.template.defaultfilters import title
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, status
from .models import *
from .serializers import *
from .permissions import IsOwnerOrReadOnly


class DongCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DongCreateSerializer

    def post(self, request):
        serializer = DongCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(created_by=request.user)
        return Response({"message" : "a dongs has been created"} , status=status.HTTP_201_CREATED)


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
    serializer_class = DongUpdateSerializer

    def patch(self, request, pk):
        try:
            dong = Dong.objects.get(id=pk)
        except Dong.DoesNotExist:
            return Response({"error": "No Dong has been found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DongUpdateSerializer(
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
