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


class ExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense
        fields = ['dong', 'title', 'amount', 'paid_by']


class ExpenseUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense
        fields = ['title', 'amount', 'paid_by']


class ExpenseParticipantSerializer(serializers.ModelSerializer):

    class Meta:
        model = DongMember
        fields = ['expense', 'member']