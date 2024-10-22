from rest_framework import serializers
from user.models import AuthUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ["id", "username", "email", "is_staff"]
