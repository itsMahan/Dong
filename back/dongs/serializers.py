from .models import *
from rest_framework import serializers


class DongSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    total_expenses = serializers.SerializerMethodField()
    remaining_budget = serializers.SerializerMethodField()
    burn_rate = serializers.SerializerMethodField()

    class Meta:
        model = Dong
        fields = ['id', 'title', 'members', 'total_budget', 'total_expenses', 'remaining_budget', 'burn_rate']

    def get_members(self, obj):
        # 'obj' is the Dong instance.
        # obj.members.all() gets all related DongMember objects.
        # We create a list of just their names.
        return [{"id": member.id, "name": member.name} for member in obj.members.all()]

    def get_total_expenses(self, obj):
        """محاسبه مجموع خرج‌ها"""
        return round(obj.get_total_expenses(), 2)

    def get_remaining_budget(self, obj):
        """محاسبه بودجه باقی‌مانده"""
        remaining = obj.get_remaining_budget()
        if remaining is None:
            return None
        return round(remaining, 2)

    def get_burn_rate(self, obj):
        """محاسبه درصد مصرف بودجه"""
        return obj.get_burn_rate()


class DongMemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = DongMember
        fields = ['dong', 'name']



class DongMemberSerializerForExpense(serializers.ModelSerializer):
    class Meta:
        model = DongMember
        fields = ['id', 'name']


class ExpenseListSerializer(serializers.ModelSerializer):
    paid_by = DongMemberSerializerForExpense()
    participants = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'quantity', 'tax_percentage',
            'include_tax', 'total_amount', 'paid_by', 'participants',
            'expense_type', 'created_at'
        ]

    def get_participants(self, obj):
        return [p.member.name for p in obj.participants.all()]

    def get_total_amount(self, obj):
        return round(obj.get_total_amount(), 2)


class ExpenseUpdateSerializer(serializers.ModelSerializer):
    paid_by = serializers.PrimaryKeyRelatedField(queryset=DongMember.objects.all())
    participants = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=DongMember.objects.all(),
        required=False
    )

    class Meta:
        model = Expense
        fields = [
            'title', 'amount', 'paid_by', 'expense_type',
            'quantity', 'tax_percentage', 'include_tax', 'participants'
        ]

    def validate_paid_by(self, value):
        dong = self.instance.dong
        if value.dong != dong:
            raise serializers.ValidationError("Paid by member must belong to the same dong.")
        return value

    def validate_participants(self, value):
        dong = self.instance.dong
        for member in value:
            if member.dong != dong:
                raise serializers.ValidationError(f"Participant {member.name} does not belong to the same dong.")
        return value


class ExpenseCreateSerializer(serializers.ModelSerializer):
    paid_by = serializers.PrimaryKeyRelatedField(queryset=DongMember.objects.all())
    participants = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=DongMember.objects.all()
    )
    paid_by = serializers.PrimaryKeyRelatedField(queryset=DongMember.objects.all())

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


class ExpenseParticipantSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpenseParticipant
        fields = ['expense', 'member']