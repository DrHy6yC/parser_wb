from django.urls import path
from .views import ProductListView, product_table_view, ProductParseView

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('dashboard/', product_table_view, name='product-dashboard'),
    path('parse/<str:product_name>/', ProductParseView.as_view(), name='product-parse'),
]
