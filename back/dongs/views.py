from django.template.defaultfilters import title
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, status
from .models import *
from .serializers import *


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
    permission_classes = [permissions.IsAuthenticated]