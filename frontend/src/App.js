import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/products/')
      .then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h1>Товары</h1>
      <ul>
        {products.map(p => (
          <li key={p.name}>{p.name} — {p.price}₽</li>
        ))}
      </ul>
    </div>
  );
}
