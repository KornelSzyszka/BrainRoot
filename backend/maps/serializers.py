from rest_framework import serializers

from maps.models.map import Map
from maps.models.tile import Tile


class MapListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Map
        fields = ["id", "name", "owner", "creation_date"]
        read_only_fields = ["owner", "creation_date"]


class MapDetailSerializer(MapListSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta(MapListSerializer.Meta):
        fields = [
            "id",
            "name",
            "owner",
            "creation_date",
            "is_official",
            "public",
            "protected",
            "description",
            "creation_date",
            "last_edition",
            "last_editor",
        ]


class TileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tile
        fields = [
            "id",
            "name",
            "map",
            "parent",
            "position",
            "description",
        ]
