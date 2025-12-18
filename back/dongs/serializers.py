from .models import *
from rest_framework import serializers


class DongSerializer(serializers.ModelSerializer):

    class Meta:
        model = Dong
        fields = ['title']


class DongMemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = DongMember
        fields = ['dong', 'name']