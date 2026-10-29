from rest_framework import serializers

from .models import Income


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ("id", "source", "amount", "received_on", "notes", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_source(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Income source is required.")
        return value
