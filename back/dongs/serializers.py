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

    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'paid_by', 'participants', 'created_at']

    def get_participants(self, obj):
        # لیست اسامی شرکت‌کنندگان
        return [p.member.name for p in obj.participants.all()]


class ExpenseCreateSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=DongMember.objects.all()
    )

    class Meta:
        model = Expense
        fields = ['title', 'amount', 'paid_by', 'participants']

    def validate(self, data):
        dong_id = self.context.get('dong_id')
        paid_by = data.get('paid_by')
        participants = data.get('participants', [])

        if paid_by.dong_id != dong_id:
            raise serializers.ValidationError(
                "پرداخت‌کننده باید عضو این گروه باشه!"
            )

        for member in participants:
            if member.dong.id != dong_id:
                raise serializers.ValidationError(
                    f"{member.name} عضو این گروه نیست!"
                )

        return data


class ExpenseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['title', 'amount', 'paid_by']


class ExpenseParticipantSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpenseParticipant
        fields = ['expense', 'member']
