from rest_framework import serializers

from maps.models.map import Map
from maps.models.tile import Tile


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Map
        fields = '__all__'


class TileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tile
        fields = '__all__'
