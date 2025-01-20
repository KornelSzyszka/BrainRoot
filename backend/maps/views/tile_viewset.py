from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from maps import serializers
from maps.models import Tile, Map


class TileViewSet(viewsets.GenericViewSet):
    serializer_class = serializers.TileDetailSerializer

    def get_map_id(self) -> str | None:
        return self.kwargs.get('map_pk')

    def get_permissions(self) -> list | list[IsAuthenticated]:
        if self.action in ["list", "retrieve"]:
            return []
        return [IsAuthenticated()]

    def get_queryset(self) -> QuerySet[Tile]:
        if self.action in ['create', 'destroy', 'partial_update']:
            return Tile.objects.filter(
                map=self.get_map_id(),
                map__owner=self.request.user,
            )
        return Tile.objects.filter(
            map=self.get_map_id()
        )

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_queryset().get(id=self.kwargs.get('pk'))
        serializer = serializers.TileDetailSerializer(instance)
        return Response(serializer.data)

    def create(self, request: Request, *args, **kwargs) -> Response:
        map_object: Map = get_object_or_404(Map.objects.all(), id=self.get_map_id())
        serializer = serializers.TileDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.validated_data.get("id")
        if serializer.validated_data.get("parent"):
            print(serializer.validated_data.get("parent").map.id)
            if map_object.id != serializer.validated_data.get("parent").map.id:
                return Response(status=404)
        serializer.save(map=map_object)
        return Response(serializer.data, status=201)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_queryset().get(id=self.kwargs.get('pk'))
        instance.delete()
        return Response(status=204)

    def partial_update(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_queryset().get(id=self.kwargs.get('pk'))
        serializer = serializers.TileDetailSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
