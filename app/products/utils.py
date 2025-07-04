import requests

from products.models import Product


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


def parse_wildberries(type_product):
    headers = {"User-Agent": "Mozilla/5.0"}

    url = f"https://search.wb.ru/exactmatch/ru/common/v4/search"
    params = {
        "query": type_product,
        "dest": "-1257786",  # Москва
        "resultset": "catalog",
        "sort": "popular",
        "spp": "30",
    }
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }

    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()

        data = response.json()
        products = data.get("data", {}).get("products", [])
        if not products:
            print(f"[WB] Товары не найдены по запросу: {type_product}")
            return []

        result = []
        for item in products:
            name = item.get("name", "")
            price = item.get("priceU", 0) // 100
            sale_price = item.get("salePriceU", 0) // 100
            rating = item.get("reviewRating", 0)
            reviews = item.get("feedbacks", 0)

            if not Product.objects.filter(
                name=name, price=price, sale_price=sale_price
            ).exists():
                Product.objects.create(
                    name=name,
                    type_product=type_product,
                    price=price,
                    sale_price=sale_price,
                    rating=rating,
                    reviews=reviews,
                )

            result.append(
                {
                    "name": name,
                    "type_product": type_product,
                    "price": price,
                    "sale_price": sale_price,
                    "rating": rating,
                    "reviews": reviews,
                    "discount": price - sale_price,
                }
            )

        return result

    except Exception as e:
        print(f"[WB Parser] Ошибка при запросе: {e}")
        return []
