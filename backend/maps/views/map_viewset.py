from typing import Type

from django.db.models import QuerySet, Q
from rest_framework import viewsets, status
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, DestroyModelMixin, UpdateModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from maps.models import Map
from maps.serializers import MapListSerializer, MapDetailSerializer
from user.models import AuthUser


class MapViewSet(ListModelMixin, RetrieveModelMixin, DestroyModelMixin, UpdateModelMixin, viewsets.GenericViewSet):
    def get_serializer_class(self) -> Type[MapListSerializer | MapDetailSerializer]:
        if self.action == "list":
            return MapListSerializer
        return MapDetailSerializer

    def get_permissions(self) -> list | list[IsAuthenticated]:
        if self.action in ["list", "retrieve"]:
            return []
        return [IsAuthenticated()]

    def get_queryset(self) -> QuerySet:
        if hasattr(self, "swagger_fake_view"):
            return Map.objects.none()

        return Map.objects.filter(
            Q(public=True)
            | Q(owner=self.request.user)
        )

    def get_owned_queryset(self) -> QuerySet[Map]:
        return Map.objects.filter(
            owner=self.request.user
        )

    def create(self, request: Request, *args, **kwargs) -> Response:
        owner: AuthUser = self.request.user
        map_serializer = self.get_serializer(data=request.data)
        map_serializer.is_valid(raise_exception=True)
        map_serializer.save(owner=owner)

        return Response(map_serializer.data, status=status.HTTP_201_CREATED)
