import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");

  const apiHost =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "http://backend:8000";

  const [minPrice, maxPrice] = priceRange;

  useEffect(() => {
    axios
      .get(`${apiHost}/api/products/`, {
        params: {
          min_price: minPrice,
          max_price: maxPrice,
          min_rating: minRating,
          min_reviews: minReviews,
        },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("API error:", err));
  }, [priceRange, minRating, minReviews]);

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortField) return 0;

    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const priceBuckets = [0, 1000, 5000, 10000, 20000, 50000];
  const priceCounts = priceBuckets.map((min, i) => {
    const max = priceBuckets[i + 1] || Infinity;
    return products.filter((p) => p.price >= min && p.price < max).length;
  });

  const ratingDiscountData = {
    labels: products.map((p) => p.name),
    datasets: [
      {
        label: "Скидка (₽)",
        data: products.map((p) => p.price - p.sale_price),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.3)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Аналитика товаров</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Фильтр по цене</h3>
        <p>
          Цена: от <b>{minPrice}</b> ₽ до <b>{maxPrice}</b> ₽
        </p>
        <Slider
          range
          min={0}
          max={100000}
          step={500}
          value={priceRange}
          onChange={setPriceRange}
        />
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <label>
          Рейтинг от:
          <input
            type="number"
            step="0.1"
            value={minRating}
            onChange={(e) => setMinRating(+e.target.value)}
          />
        </label>
        <label>
          Отзывов от:
          <input
            type="number"
            value={minReviews}
            onChange={(e) => setMinReviews(+e.target.value)}
          />
        </label>
      </div>

      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>Название {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
            <th onClick={() => handleSort("price")}>Цена {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
            <th onClick={() => handleSort("sale_price")}>Цена со скидкой {sortField === "sale_price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
            <th onClick={() => handleSort("rating")}>Рейтинг {sortField === "rating" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
            <th onClick={() => handleSort("reviews")}>Отзывы {sortField === "reviews" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((p) => (
            <tr key={p.id || p.name}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.sale_price}</td>
              <td>{p.rating}</td>
              <td>{p.reviews}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "40px" }}>Распределение товаров по цене</h2>
      <Bar
        data={{
          labels: ["0–1K", "1K–5K", "5K–10K", "10K–20K", "20K–50K", "50K+"],
          datasets: [
            {
              label: "Количество товаров",
              data: priceCounts,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        }}
      />

      <h2 style={{ marginTop: "40px" }}>Скидка на товар vs Рейтинг</h2>
      <Line data={ratingDiscountData} />
    </div>
  );
}