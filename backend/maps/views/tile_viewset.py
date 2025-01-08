from django.db import models
from rest_framework import viewsets

from maps import serializers
from maps.models import Tile


class TileViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TileSerializer

    def get_map_id(self) -> str | None:
        return self.request.query_params.get('map')

    def get_queryset(self) -> dict:
        return Tile.objects.filter(
            map=self.get_map_id()
        )
