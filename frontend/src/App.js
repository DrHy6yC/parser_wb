import React, { useEffect, useState, useRef } from "react";
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
  const [productType, setProductType] = useState("");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [priceLimits, setPriceLimits] = useState([0, 100000]);
  const [showTable, setShowTable] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);
  const deferredPriceRange = useRef([0, 100000]);

  const apiHost =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "http://backend:8000";

  const [minPrice, maxPrice] = deferredPriceRange.current;

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axios.get(`${apiHost}/api/product-types/`);
        setAvailableTypes(res.data);
      } catch (error) {
        console.error("Ошибка при получении типов продуктов:", error);
      }
    };
    fetchTypes();
  }, [apiHost]);

  useEffect(() => {
    const fetchPriceLimits = async () => {
      try {
        const res = await axios.get(`${apiHost}/api/products/`);
        if (res.data.length > 0) {
          const prices = res.data.map(p => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceLimits([min, max]);
          setPriceRange([min, max]);
          deferredPriceRange.current = [min, max];
        }
      } catch (error) {
        console.error("Ошибка при определении пределов цены:", error);
      }
    };
    fetchPriceLimits();
  }, [apiHost]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiHost}/api/products/`, {
        params: {
          min_price: deferredPriceRange.current[0],
          max_price: deferredPriceRange.current[1],
          min_rating: minRating,
          min_reviews: minReviews,
          type_product: productType,
          ordering: (sortOrder === "desc" ? "-" : "") + sortField,
        },
      });
      setProducts(res.data);
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [minRating, minReviews, sortField, sortOrder, productType]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
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
    labels: products
      .map((p) => p.rating)
      .filter((r) => typeof r === "number")
      .sort((a, b) => a - b),
    datasets: [
      {
        label: "Скидка (₽)",
        data: products
          .filter((p) => typeof p.rating === "number")
          .map((p) => ({ x: p.rating, y: p.discount }))
          .sort((a, b) => a.x - b.x),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.3)",
        tension: 0.3,
      },
    ],
  };

  const ratingDiscountOptions = {
    responsive: true,
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 5,
        title: {
          display: true,
          text: "Рейтинг",
        },
      },
      y: {
        title: {
          display: true,
          text: "Скидка (₽)",
        },
      },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Аналитика товаров</h1>

      <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px" }}>
        <h3>Фильтр по цене</h3>
        <p>
          Цена: от <b>{priceRange[0]}</b> ₽ до <b>{priceRange[1]}</b> ₽
        </p>
        <Slider
          range
          min={priceLimits[0]}
          max={priceLimits[1]}
          step={500}
          value={priceRange}
          onChange={(val) => setPriceRange(val)}
          onAfterChange={(val) => {
            deferredPriceRange.current = val;
            fetchData();
          }}
        />

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
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
          <label>
            Тип продукта:
            <select value={productType} onChange={(e) => setProductType(e.target.value)}>
              <option value="">Все</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px" }}>
        <button onClick={() => setShowTable(prev => !prev)}>
          {showTable ? "Свернуть таблицу" : "Показать таблицу"}
        </button>
        {showTable && (
          <table border="1" cellPadding="5" style={{ width: "100%", marginTop: "15px" }}>
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
              {products.map((p) => (
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
        )}
      </div>

      <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px" }}>
        <button onClick={() => setShowBarChart(prev => !prev)}>
          {showBarChart ? "Свернуть график по цене" : "Показать график по цене"}
        </button>
        {showBarChart && (
          <>
            <h2 style={{ marginTop: "20px" }}>Распределение товаров по цене</h2>
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
          </>
        )}
      </div>

      <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px" }}>
        <button onClick={() => setShowLineChart(prev => !prev)}>
          {showLineChart ? "Свернуть график скидок" : "Показать график скидок"}
        </button>
        {showLineChart && (
          <>
            <h2 style={{ marginTop: "20px" }}>Скидка на товар vs Рейтинг</h2>
            <Line data={ratingDiscountData} options={ratingDiscountOptions} />
          </>
        )}
      </div>
    </div>
  );
}