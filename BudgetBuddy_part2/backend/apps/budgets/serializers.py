from django.db.models import Sum
from rest_framework import serializers

from apps.expenses.models import Expense
from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    utilization_percent = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ("id", "name", "amount", "start_date", "end_date", "spent", "remaining", "utilization_percent", "created_at")
        read_only_fields = ("id", "spent", "remaining", "utilization_percent", "created_at")

    def _spent(self, obj):
        total = Expense.objects.filter(user=obj.user, spent_on__gte=obj.start_date, spent_on__lte=obj.end_date).aggregate(total=Sum("amount"))["total"]
        return total or 0

    def get_spent(self, obj):
        return self._spent(obj)

    def get_remaining(self, obj):
        return max(obj.amount - self._spent(obj), 0)

    def get_utilization_percent(self, obj):
        if not obj.amount:
            return 0
        return round(float(self._spent(obj) / obj.amount * 100), 1)

    def validate(self, attrs):
        start = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date must be on or after start date."})
        return attrs

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Budget name is required.")
        return value
