from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.filters import OrderingFilter
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Product
from .parser import parse_wildberries
from .serializers import ProductSerializer


class ProductParseView(APIView):
    def get(self, request, product_name):
        products = parse_wildberries(product_name)
        if products:
            return Response(products, status=status.HTTP_200_OK)
        return Response({"detail": "Nothing found or error"}, status=status.HTTP_400_BAD_REQUEST)


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [OrderingFilter]
    ordering_fields = ['name', 'name_product', 'price', 'sale_price', 'rating', 'reviews']

    def get_queryset(self):
        qs = super().get_queryset()
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
