from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.decorators import api_view
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
    ordering_fields = ['name', 'type_product', 'price', 'sale_price', 'rating', 'reviews']

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        min_price = params.get('min_price')
        max_price = params.get('max_price')
        min_rating = params.get('min_rating')
        min_reviews = params.get('min_reviews')
        type_product = params.get('type_product')
        ordering = params.get('ordering')

        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if min_rating:
            qs = qs.filter(rating__gte=min_rating)
        if min_reviews:
            qs = qs.filter(reviews__gte=min_reviews)
        if type_product:
            qs = qs.filter(type_product__icontains=type_product)

        if ordering:
            qs = qs.order_by(ordering)

        return qs


def product_table_view(request):
    return render(request, 'products/table.html')


@api_view(["GET"])
def product_types_view(request):
    types = Product.objects.values_list("type_product", flat=True).distinct()
    return Response(types)


def product_dashboard_view(request):
    qs = Product.objects.all()
    params = request.GET

    # Фильтры
    min_price = params.get("min_price")
    max_price = params.get("max_price")
    min_rating = params.get("min_rating")
    min_reviews = params.get("min_reviews")
    type_product = params.get("type_product")
    ordering = params.get("ordering")

    if min_price:
        qs = qs.filter(price__gte=min_price)
    if max_price:
        qs = qs.filter(price__lte=max_price)
    if min_rating:
        qs = qs.filter(rating__gte=min_rating)
    if min_reviews:
        qs = qs.filter(reviews__gte=min_reviews)
    if type_product:
        qs = qs.filter(type_product=type_product)
    if ordering:
        qs = qs.order_by(ordering)

    types = Product.objects.values_list("type_product", flat=True).distinct()
    headers = {
        "Название": "name",
        "Цена": "price",
        "Цена со скидкой": "sale_price",
        "Рейтинг": "rating",
        "Отзывы": "reviews"
    }

    return render(request, "products/dashboard.html", {
        "products": qs,
        "product_types": types,
        "headers": headers,
    })

class ProductTypesView(APIView):
    def get(self, request):
        types = Product.objects.values_list('type_product', flat=True).distinct()
        return Response(types)


def dashboard_view(request):
    products = Product.objects.all()

    for p in products:
        p.discount = p.price - p.sale_price if p.price and p.sale_price else 0

    return render(request, 'products/dashboard.html', {
        'products': products,
    })