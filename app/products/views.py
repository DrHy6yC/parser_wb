from django.shortcuts import render
from django.views import View
from rest_framework import status
from rest_framework.filters import OrderingFilter
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.response import Response

from .models import Product
from .parser import parse_wildberries
from .serializers import ProductSerializer
from .utils import get_filtered_products, get_product_types


class ProductParseView(GenericAPIView):
    def get(self, request, product_name):
        products = parse_wildberries(product_name)
        if products:
            return Response(products, status=status.HTTP_200_OK)
        return Response(
            {"detail": "Nothing found or error"}, status=status.HTTP_400_BAD_REQUEST
        )


class ProductListView(ListAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [OrderingFilter]
    ordering_fields = [
        "name",
        "type_product",
        "price",
        "sale_price",
        "rating",
        "reviews",
    ]

    def get_queryset(self):
        return get_filtered_products(self.request)


def product_table_view(request):
    return render(request, "products/table.html")


class ProductTypesView(GenericAPIView):
    def get(self, request, *args, **kwargs):
        types = get_product_types()
        return Response(types)


class DashboardView(View):
    def get(self, request):
        products = get_filtered_products(request)

        for p in products:
            p.discount = p.price - p.sale_price if p.price and p.sale_price else 0

        product_types = get_product_types()
        headers = {
            "Название": "name",
            "Цена": "price",
            "Цена со скидкой": "sale_price",
            "Рейтинг": "rating",
            "Отзывы": "reviews",
        }

        return render(
            request,
            "products/dashboard.html",
            {
                "products": products,
                "product_types": product_types,
                "headers": headers,
            },
        )


class ProductTypesView(GenericAPIView):
    def get(self, request):
        types = get_product_types()
        return Response(types)
