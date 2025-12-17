from .models import *
from rest_framework import serializers


class DongCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dong
        fields = ['title']