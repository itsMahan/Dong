from .models import *
from rest_framework import serializers


class DongSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = Dong
        fields = ['id', 'title', 'members']

    def get_members(self, obj):
        # 'obj' is the Dong instance.
        # obj.members.all() gets all related DongMember objects.
        # We create a list of just their names.
        return [{"id": member.id, "name": member.name} for member in obj.members.all()]


class DongMemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = DongMember
        fields = ['dong', 'name']


class ExpenseSerializer(serializers.ModelSerializer):
    paid_by = serializers.StringRelatedField()  # نمایش نام
    participants = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField() # ✅ مبلغ نهایی با مالیات

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'quantity', 'tax_percentage',
            'include_tax', 'total_amount', 'paid_by', 'participants',
            'expense_type', 'created_at'
        ]

    def get_participants(self, obj):
        # لیست اسامی شرکت‌کنندگان
        return [p.member.name for p in obj.participants.all()]

    def get_total_amount(self, obj):
        """نمایش مبلغ نهایی با احتساب تعداد و مالیات"""
        return round(obj.get_total_amount(), 2)


class ExpenseCreateSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=DongMember.objects.all()
    )

    class Meta:
        model = Expense
        fields = [
            'title', 'amount', 'paid_by', 'participants',
            'expense_type', 'quantity', 'tax_percentage', 'include_tax'
        ]

    def validate(self, data):
        dong_id = self.context.get('dong_id')
        paid_by = data.get('paid_by')
        participants = data.get('participants', [])
        expense_type = data.get('expense_type', 'total')
        quantity = data.get('quantity', 1)

        if paid_by.dong_id != dong_id:
            raise serializers.ValidationError(
                "پرداخت‌کننده باید عضو این گروه باشه!"
            )

        for member in participants:
            if member.dong.id != dong_id:
                raise serializers.ValidationError(
                    f"{member.name} عضو این گروه نیست!"
                )

        if expense_type == 'individual' and len(participants) == 0:
            raise serializers.ValidationError(
                "In Individual Expense type you must specify at least one participant"
            )

        if quantity < 1:
            raise serializers.ValidationError(
                "quantity must be at least 1!"
            )

        return data


class ExpenseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            'title', 'amount', 'paid_by', 'expense_type',
            'quantity', 'tax_percentage', 'include_tax'
        ]


class ExpenseParticipantSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpenseParticipant
        fields = ['expense', 'member']