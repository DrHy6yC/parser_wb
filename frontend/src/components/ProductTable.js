import React from "react";

export default function ProductTable({ products, sortField, sortOrder, onSort }) {
  const headers = [
    { label: "Название", field: "name" },
    { label: "Цена", field: "price" },
    { label: "Цена со скидкой", field: "sale_price" },
    { label: "Рейтинг", field: "rating" },
    { label: "Отзывы", field: "reviews" },
  ];

  return (
    <table border="1" cellPadding="5" style={{ width: "100%" }}>
      <thead>
        <tr>
          {headers.map(({ label, field }) => (
            <th key={field} onClick={() => onSort(field)}>
              {label} {sortField === field ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
          ))}
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
  );
}
