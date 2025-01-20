from rest_framework import serializers

from maps.models.map import Map
from maps.models.tile import Tile


class MapListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Map
        fields = ["id", "name", "owner", "creation_date"]
        read_only_fields = ["owner", "creation_date"]


class TileDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tile
        fields = [
            "id",
            "name",
            "parent",
            "position_x",
            "position_y",
            "description",
        ]
        read_only_fields = ["id"]


class MapDetailSerializer(MapListSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    tiles = TileDetailSerializer(many=True, read_only=True)

    class Meta(MapListSerializer.Meta):
        fields = [
            "id",
            "name",
            "owner",
            "tiles",
            "creation_date",
            "is_official",
            "public",
            "protected",
            "description",
            "creation_date",
            "last_edition",
            "last_editor",
        ]
        read_only_fields = ["tiles"]


class TileMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tile
        fields = [
            "id",
            "name",
            "parent",
            "position_x",
            "position_y",
        ]
        read_only_fields = ["id"]
