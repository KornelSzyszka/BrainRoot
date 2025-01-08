from rest_framework import serializers

from maps.models.map import Map
from maps.models.tile import Tile
from user.models import AuthUser


class MapListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Map
        fields = ["id", "name"]
        read_only_fields = ["owner", "creation_date"]


class MapDetailSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Map
        fields = '__all__'


class TileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tile
        fields = '__all__'
