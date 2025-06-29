from products.models import Product
from rest_framework import serializers


class ProductSerializer(serializers.ModelSerializer):
    discount = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "type_product",
            "price",
            "sale_price",
            "rating",
            "reviews",
            "discount",
        ]

    def get_discount(self, obj):
        return obj.price - obj.sale_price
