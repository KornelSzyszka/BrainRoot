from django.contrib import admin

from maps.models import Map, Tile


class MapAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'owner', 'creation_date']
    list_filter = ['owner', 'creation_date']
    search_fields = ['name', 'owner']


class TileAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'map', 'position_x', 'position_y']
    list_filter = ['map', 'position_x', 'position_y']
    search_fields = ['name', 'map']


admin.site.register(Map, MapAdmin)
admin.site.register(Tile, TileAdmin)
