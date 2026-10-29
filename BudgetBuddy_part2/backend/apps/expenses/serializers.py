from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ("id", "category", "amount", "spent_on", "description", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_category(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Category is required.")
        return value
