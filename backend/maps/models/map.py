from django.db import models
import uuid

from user.models import AuthUser


class Map(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    is_official = models.BooleanField(default=False)
    public = models.BooleanField(default=False)
    protected = models.BooleanField(default=True)  # false if is editable for all users
    description = models.TextField(blank=True, null=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    last_edition = models.DateTimeField(auto_now=True)
    last_editor = models.ForeignKey(
        AuthUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='maps'
    )
    deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def delete(self, using=None, keep_parents=False):
        self.deleted = True
        self.save()
