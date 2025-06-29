from django.urls import path
from products.views import DashboardView, ProductListView, ProductParseView, ProductTypesView

urlpatterns = [
    path("products/", ProductListView.as_view(), name="product-list"),
    path("dashboard", DashboardView.as_view(), name="product-dashboard"),
    path("parse/<str:product_name>/", ProductParseView.as_view(), name="product-parse"),
    path("product-types/", ProductTypesView.as_view(), name="product-types"),
]
