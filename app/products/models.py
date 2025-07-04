from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)
    type_product = models.CharField(max_length=255, default="", blank=True)
    price = models.IntegerField()
    sale_price = models.IntegerField()
    rating = models.FloatField()
    reviews = models.IntegerField()

    def __str__(self):
        return self.name
