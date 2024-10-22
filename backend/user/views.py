from django.contrib.auth import get_user_model
from rest_framework import permissions
from rest_framework.viewsets import GenericViewSet
from user.serializers import UserSerializer

User = get_user_model()


class UserViewSet(GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if hasattr(self, "swagger_fake_view"):
            return User.objects.none()
        return User.objects.filter(id=self.request.user.id)
