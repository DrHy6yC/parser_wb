import requests
from .models import Product

def parse_wildberries(query):
    url = "https://search.wb.ru/exactmatch/ru/common/v4/search"
    params = {
        "query": query,
        "dest": "-1257786",   # Москва
        "resultset": "catalog",
        "sort": "popular",
        "spp": "30",
    }
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }

    response = requests.get(url, params=params, headers=headers)

    try:
        data = response.json()

        # Проверка содержимого
        products = data.get('data', {}).get('products', [])
        if not products:
            print("Нет товаров для запроса.")
            return

        for item in products:
            name = item.get("name", "")
            price = item.get("priceU", 0) // 100
            sale_price = item.get("salePriceU", 0) // 100
            rating = item.get("reviewRating", 0.0)
            reviews = item.get("feedbacks", 0)

            Product.objects.update_or_create(
                name=name,
                defaults={
                    "price": price,
                    "sale_price": sale_price,
                    "rating": rating,
                    "reviews": reviews,
                }
            )

        print(f"Сохранено товаров: {len(products)}")

    except Exception as e:
        print("Ошибка парсинга:", e)
        print("Ответ:", response.text)
