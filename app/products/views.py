from django.shortcuts import render
from rest_framework import generics

from .models import Product
from .serializers import ProductSerializer


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = Product.objects.all()
        params = self.request.query_params

        min_price = params.get('min_price')
        max_price = params.get('max_price')
        min_rating = params.get('min_rating')
        min_reviews = params.get('min_reviews')

        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if min_rating:
            qs = qs.filter(rating__gte=min_rating)
        if min_reviews:
            qs = qs.filter(reviews__gte=min_reviews)

        return qs


def product_table_view(request):
    return render(request, 'products/table.html')
