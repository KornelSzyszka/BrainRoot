from rest_framework import serializers
from user.models import AuthUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ["id", "username", "email"]


class UserDetailSerializer(UserSerializer):
    class Meta:
        model = AuthUser
        fields = ["id", "username"]
        read_only_fields = ["id", "username"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    email = serializers.EmailField()

    class Meta:
        fields = ["username", "password", "email"]
