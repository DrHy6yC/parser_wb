from django.db.models import Max, Min
from django.shortcuts import render
from django.views import View
from rest_framework import status
from rest_framework.filters import OrderingFilter
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.response import Response

from products.models import Product
from products.serializers import ProductSerializer
from products.utils import get_filtered_products, get_product_types
from products.utils import parse_wildberries


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


class ProductTypesView(GenericAPIView):
    def get(self, request, *args, **kwargs):
        types = get_product_types()
        return Response(types)


class DashboardView(View):
    def get(self, request):
        # Продукты с учётом фильтров
        products = get_filtered_products(request)

        # Добавим поле discount вручную
        for p in products:
            p.discount = (p.price or 0) - (p.sale_price or 0)

        # Все типы продуктов
        product_types = get_product_types()

        # Минимальная и максимальная цена
        all_products = Product.objects.all()
        price_limits = [
            all_products.aggregate(Min("price"))["price__min"] or 0,
            all_products.aggregate(Max("price"))["price__max"] or 100000,
        ]

        # Распределение по ценовым диапазонам
        price_buckets = [0, 1000, 5000, 10000, 20000, 50000]
        price_counts = []
        for i in range(len(price_buckets)):
            min_price = price_buckets[i]
            max_price = price_buckets[i + 1] if i + 1 < len(price_buckets) else None
            if max_price:
                count = products.filter(
                    price__gte=min_price, price__lt=max_price
                ).count()
            else:
                count = products.filter(price__gte=min_price).count()
            price_counts.append(count)

        # Данные для графика: скидка vs рейтинг
        discount_data = sorted(
            [
                (p.rating, p.discount)
                for p in products
                if isinstance(p.rating, (int, float))
            ],
            key=lambda x: x[0],
        )
        ratings = [x[0] for x in discount_data]
        discounts = [x[1] for x in discount_data]

        return render(
            request,
            "dashboard.html",
            {
                "products": products,
                "product_types": product_types,
                "price_limits": price_limits,
                "price_counts": price_counts,
                "ratings": ratings,
                "discounts": discounts,
            },
        )
