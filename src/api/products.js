const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.detail || JSON.stringify(data) || "Request failed";
    throw new Error(message);
  }

  return data;
}

export function getProducts(search = "") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const query = params.toString();
  return request(`/products/${query ? `?${query}` : ""}`);
}

export function createProduct(payload) {
  return request("/products/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return request(`/products/${id}/`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return request(`/products/${id}/`, {
    method: "DELETE",
  });
}

