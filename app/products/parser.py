import requests
from .models import Product

def parse_wildberries(type_product):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

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


            if not Product.objects.filter(name=name, price=price, sale_price=sale_price).exists():
                Product.objects.create(
                    name=name,
                    type_product=type_product,
                    price=price,
                    sale_price=sale_price,
                    rating=rating,
                    reviews=reviews,
                )

            result.append({
                "name": name,
                "type_product": type_product,
                "price": price,
                "sale_price": sale_price,
                "rating": rating,
                "reviews": reviews,
                "discount": price - sale_price,
            })

        return result

    except Exception as e:
        print(f"[WB Parser] Ошибка при запросе: {e}")
        return []
