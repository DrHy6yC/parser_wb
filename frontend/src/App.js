import React, { useEffect, useState, useRef } from "react";
import { Bar, Line } from "react-chartjs-2";
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

import { fetchProducts, fetchProductTypes } from "./api/api";
import FilterPanel from "./components/FilterPanel";
import ProductTable from "./components/ProductTable";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function App() {
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState(null);
  const [priceLimits, setPriceLimits] = useState(null);
  const deferredPriceRange = useRef(null);
  const priceRangeInitialized = useRef(false);

  const [minRating, setMinRating] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [productType, setProductType] = useState("");
  const [availableTypes, setAvailableTypes] = useState([]);

  const [sortField, setSortField] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showTable, setShowTable] = useState(true);
  const [showBarChart, setShowBarChart] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts({
        min_price: deferredPriceRange.current?.[0],
        max_price: deferredPriceRange.current?.[1],
        min_rating: minRating,
        min_reviews: minReviews,
        type_product: productType,
        ordering: (sortOrder === "desc" ? "-" : "") + sortField,
      });
      setProducts(data);

      if (data.length && !priceRangeInitialized.current) {
        const prices = data.map((p) => p.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        setPriceLimits([min, max]);
        setPriceRange([min, max]);
        deferredPriceRange.current = [min, max];

        priceRangeInitialized.current = true;
      }
    } catch (err) {
      console.error("Ошибка загрузки продуктов", err);
    }
  };

  useEffect(() => {
    fetchProductTypes().then(setAvailableTypes).catch(console.error);
    loadProducts();
  }, []);

  useEffect(() => {
    if (deferredPriceRange.current) {
      loadProducts();
    }
  }, [minRating, minReviews, sortField, sortOrder, productType]);

  const handleSort = (field) => {
    setSortOrder((prev) => (field === sortField ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortField(field);
  };

  const priceBuckets = [0, 1000, 5000, 10000, 20000, 50000];
  const priceCounts = priceBuckets.map((min, i) => {
    const max = priceBuckets[i + 1] || Infinity;
    return products.filter((p) => p.price >= min && p.price < max).length;
  });

  const ratingDiscountData = {
    datasets: [
      {
        label: "Скидка (₽)",
        data: products
          .filter((p) => typeof p.rating === "number" && typeof p.discount === "number")
          .map((p) => ({ x: p.rating, y: p.discount }))
          .sort((a, b) => a.x - b.x),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.3)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Аналитика товаров</h1>

      <FilterPanel
        priceRange={priceRange}
        priceLimits={priceLimits}
        setPriceRange={setPriceRange}
        onPriceChange={(val) => {
          deferredPriceRange.current = val;
          loadProducts();
        }}
        minRating={minRating}
        setMinRating={setMinRating}
        minReviews={minReviews}
        setMinReviews={setMinReviews}
        productType={productType}
        setProductType={setProductType}
        availableTypes={availableTypes}
      />

      <section>
        <button onClick={() => setShowTable((prev) => !prev)}>
          {showTable ? "Свернуть таблицу" : "Показать таблицу"}
        </button>
        {showTable && (
          <ProductTable
            products={products}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        )}
      </section>

      <section>
        <button onClick={() => setShowBarChart((prev) => !prev)}>
          {showBarChart ? "Свернуть график по цене" : "Показать график по цене"}
        </button>
        {showBarChart && (
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
        )}
      </section>

      <section>
        <button onClick={() => setShowLineChart((prev) => !prev)}>
          {showLineChart ? "Свернуть график скидок" : "Показать график скидок"}
        </button>
        {showLineChart && (
          <Line
            data={ratingDiscountData}
            options={{
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
                  min: 0,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Скидка (₽)",
                  },
                },
              },
            }}
          />
        )}
      </section>
    </div>
  );
}
