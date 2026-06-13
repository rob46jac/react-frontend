import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";

import { createProduct, deleteProduct, getProducts, updateProduct } from "./api/products";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  is_active: true,
};

function normalizeProductForm(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price || 0).toFixed(2),
    stock: Number(form.stock || 0),
    is_active: Boolean(form.is_active),
  };
}

function ProductForm({ editingProduct, isSaving, onCancel, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!editingProduct) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: editingProduct.name,
      description: editingProduct.description || "",
      price: editingProduct.price,
      stock: String(editingProduct.stock),
      is_active: editingProduct.is_active,
    });
  }, [editingProduct]);

  const isValid = form.name.trim() && Number(form.price) >= 0 && Number(form.stock) >= 0;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isValid || isSaving) return;
    await onSubmit(normalizeProductForm(form));
    setForm(emptyForm);
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-title">
        <h2>{editingProduct ? "Edit product" : "New product"}</h2>
        {editingProduct && (
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Cancel edit">
            <X size={18} />
          </button>
        )}
      </div>

      <label>
        <span>Name</span>
        <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
      </label>

      <label>
        <span>Description</span>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows="4"
        />
      </label>

      <div className="field-grid">
        <label>
          <span>Price</span>
          <input
            min="0"
            step="0.01"
            type="number"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            required
          />
        </label>

        <label>
          <span>Stock</span>
          <input
            min="0"
            step="1"
            type="number"
            value={form.stock}
            onChange={(event) => updateField("stock", event.target.value)}
            required
          />
        </label>
      </div>

      <label className="toggle">
        <input
          checked={form.is_active}
          type="checkbox"
          onChange={(event) => updateField("is_active", event.target.checked)}
        />
        <span>Active</span>
      </label>

      <button className="primary-button" type="submit" disabled={!isValid || isSaving}>
        {isSaving ? <Loader2 className="spin" size={18} /> : editingProduct ? <Check size={18} /> : <Plus size={18} />}
        {editingProduct ? "Save product" : "Create product"}
      </button>
    </form>
  );
}

function ProductTable({ products, onDelete, onEdit }) {
  if (!products.length) {
    return <div className="empty-state">No products found.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <strong>{product.name}</strong>
                {product.description && <small>{product.description}</small>}
              </td>
              <td>${Number(product.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
              <td>{product.stock}</td>
              <td>
                <span className={product.is_active ? "badge active" : "badge inactive"}>
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => onEdit(product)} aria-label="Edit">
                    <Pencil size={17} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(product.id)} aria-label="Delete">
                    <Trash2 size={17} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    return products.reduce(
      (summary, product) => ({
        count: summary.count + 1,
        active: summary.active + (product.is_active ? 1 : 0),
        stock: summary.stock + product.stock,
      }),
      { count: 0, active: 0, stock: 0 }
    );
  }, [products]);

  async function loadProducts(query = search) {
    setLoading(true);
    setError("");
    try {
      setProducts(await getProducts(query));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts("");
  }, []);

  async function handleSubmit(payload) {
    setSaving(true);
    setError("");
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    setError("");
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    loadProducts(search);
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <h1>Product CRUD</h1>
          <p>Django REST API + React frontend</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => loadProducts()}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      <section className="stats-grid">
        <article>
          <span>Total</span>
          <strong>{totals.count}</strong>
        </article>
        <article>
          <span>Active</span>
          <strong>{totals.active}</strong>
        </article>
        <article>
          <span>Stock</span>
          <strong>{totals.stock}</strong>
        </article>
      </section>

      {error && <div className="alert">{error}</div>}

      <div className="content-grid">
        <ProductForm
          editingProduct={editingProduct}
          isSaving={saving}
          onCancel={() => setEditingProduct(null)}
          onSubmit={handleSubmit}
        />

        <section className="panel list-panel">
          <div className="panel-title">
            <h2>Products</h2>
            <form className="search-box" onSubmit={handleSearch}>
              <Search size={17} />
              <input
                value={search}
                placeholder="Search"
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>
          </div>

          {loading ? (
            <div className="loading">
              <Loader2 className="spin" size={22} />
            </div>
          ) : (
            <ProductTable products={products} onDelete={handleDelete} onEdit={setEditingProduct} />
          )}
        </section>
      </div>
    </main>
  );
}

