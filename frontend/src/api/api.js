import axios from "axios";

const apiHost =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://backend:8000";

export const fetchProductTypes = () =>
  axios.get(`${apiHost}/api/product-types/`).then((res) => res.data);

export const fetchProducts = (params = {}) =>
  axios.get(`${apiHost}/api/products/`, { params }).then((res) => res.data);
