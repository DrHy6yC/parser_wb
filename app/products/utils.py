from .models import Product


def get_filtered_products(request):
    qs = Product.objects.all()
    params = request.GET

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

    return qs


def get_product_types():
    return Product.objects.values_list("type_product", flat=True).distinct()
