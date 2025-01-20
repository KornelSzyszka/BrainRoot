from django.db import models
import uuid

from maps.models.map import Map


class Tile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    map = models.ForeignKey(
        Map, on_delete=models.CASCADE, related_name='tiles'
    )
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children'
    )
    # upper-left corner; {x: int, y: int}
    position_x = models.IntegerField(default=0, null=False, blank=False)
    position_y = models.IntegerField(default=0, null=False, blank=False)

    description = models.TextField(blank=True, null=True)
    deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def delete(self, using=None, keep_parents=False):
        self.deleted = True
        self.save()
        