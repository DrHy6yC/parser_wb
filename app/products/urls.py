from django.urls import path
from .views import ProductListView, dashboard_view, ProductParseView, product_types_view

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('dashboard', dashboard_view, name='product-dashboard'),
    path('parse/<str:product_name>/', ProductParseView.as_view(), name='product-parse'),
    path("product-types/", product_types_view, name='product-types'),
]
