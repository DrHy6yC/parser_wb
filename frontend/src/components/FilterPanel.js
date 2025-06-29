import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function FilterPanel({
  priceRange,
  priceLimits,
  setPriceRange,
  onPriceChange,
  minRating,
  setMinRating,
  minReviews,
  setMinReviews,
  productType,
  setProductType,
  availableTypes,
}) {
  return (
    <div style={{ marginBottom: 20, border: "1px solid #ccc", padding: 15 }}>
      <h3>Фильтр по цене</h3>

      {priceLimits && priceRange && (
        <>
          <p>
            Цена: от <b>{priceRange[0]}</b> ₽ до <b>{priceRange[1]}</b> ₽
          </p>
          <Slider
            range
            min={priceLimits[0]}
            max={priceLimits[1]}
            step={500}
            value={priceRange}
            onChange={setPriceRange}
            onAfterChange={onPriceChange}
          />
        </>
      )}

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
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
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
