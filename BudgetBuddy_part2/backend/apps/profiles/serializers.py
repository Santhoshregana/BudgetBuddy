from rest_framework import serializers

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = ("id", "username", "email", "display_name", "currency", "allowance_amount", "preferences", "created_at", "updated_at")
        read_only_fields = ("id", "username", "email", "created_at", "updated_at")

    def validate_currency(self, value):
        value = value.strip().upper()
        if len(value) != 3 or not value.isalpha():
            raise serializers.ValidationError("Enter a three-letter currency code.")
        return value
