from rest_framework.routers import DefaultRouter

from maps.views.map_viewset import MapViewSet
from maps.views.tile_viewset import TileViewSet

router = DefaultRouter()

router.register('', MapViewSet, basename="map")
router.register('<map_id>/', TileViewSet, basename="tile")
urlpatterns = router.urls
