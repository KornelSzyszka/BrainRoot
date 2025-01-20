from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from maps.views.map_viewset import MapViewSet
from maps.views.tile_viewset import TileViewSet

app_name = 'maps'

router = DefaultRouter()
router.register(r'', MapViewSet, basename='map')
map_router = routers.NestedDefaultRouter(router, r'', lookup='map')
map_router.register(r'tile', TileViewSet, basename='map-tile')
urlpatterns = [
    path("", include(router.urls)),
    path("", include(map_router.urls)),
]
