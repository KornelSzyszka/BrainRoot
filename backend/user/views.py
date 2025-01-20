from django.contrib.auth import get_user_model
from django.db.models import Q, QuerySet
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from user.serializers import UserSerializer, LoginSerializer, UserDetailSerializer

User = get_user_model()


class UserViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self) -> list | list[IsAuthenticated]:
        if self.action in ["retrieve", "create"]:
            return []
        return [IsAuthenticated()]

    def get_queryset(self):
        if hasattr(self, "swagger_fake_view"):
            return User.objects.none()
        return User.objects.filter(id=self.request.user.id)

    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            users: QuerySet[User] = User.objects.filter(
                Q(username=serializer.validated_data["username"]) |
                Q(email=serializer.validated_data["email"])
            )
            if not users.exists():
                User.objects.create_user(
                    username=serializer.validated_data["username"],
                    password=serializer.validated_data["password"],
                    email=serializer.validated_data["email"],
                )
                return Response(
                    status=status.HTTP_201_CREATED,
                )
            return Response(
                data={"error": "Username or email is already taken"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def list(self, request: Request, *args, **kwargs) -> Response:
        return Response(
            UserDetailSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )
