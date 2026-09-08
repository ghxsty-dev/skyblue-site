"use client";

import { useCallback, useEffect, useState } from "react";

interface ProductData {
  en: Record<string, unknown>;
  tr: Record<string, unknown>;
}

interface Product {
  id: string;
  category: string;
  slug: string | null;
  data: ProductData;
  sort_order: number;
  visible: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: "package", label: "Paket" },
  { value: "design", label: "Tasarım" },
  { value: "discord", label: "Discord Bot" },
  { value: "minecraft", label: "Minecraft" },
];

export default function DesignProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<ProductData>({ en: {}, tr: {} });
  const [editSlug, setEditSlug] = useState("");
  const [pending, setPending] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("design");
  const [newData, setNewData] = useState<ProductData>({
    en: { title: "", desc: "", price: 0 },
    tr: { title: "", desc: "", price: 0 },
  });

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/design-products", { cache: "no-store" });
      if (response.status === 401) { window.location.assign("/login"); return; }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setProducts(result.products || []);
    } catch {
      setError("Ürün listesi yüklenemedi.");
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => { void loadProducts(); }, 0);
    return () => window.clearTimeout(t);
  }, [loadProducts]);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditData(JSON.parse(JSON.stringify(product.data)));
    setEditSlug(product.slug || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({ en: {}, tr: {} });
    setEditSlug("");
  }

  async function saveEdit(id: string) {
    setPending(true);
    try {
      const response = await fetch("/api/admin/design-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, data: editData, slug: editSlug || null }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, data: editData, slug: editSlug || null } : p));
      cancelEdit();
    } catch {
      setError("Kaydedilemedi.");
    } finally {
      setPending(false);
    }
  }

  async function toggleVisible(id: string, visible: boolean) {
    const response = await fetch("/api/admin/design-products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, visible: !visible }),
    });
    if (response.ok) setProducts((prev) => prev.map((p) => p.id === id ? { ...p, visible: !visible } : p));
  }

  async function deleteProduct(id: string) {
    if (!confirm("Bu ürünü silmek istediğine emin misin?")) return;
    const response = await fetch("/api/admin/design-products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function addProduct() {
    setPending(true);
    try {
      const response = await fetch("/api/admin/design-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory, data: newData, sort_order: products.length }),
      });
      if (!response.ok) throw new Error("CREATE_FAILED");
      setShowAdd(false);
      setNewData({ en: { title: "", desc: "", price: 0 }, tr: { title: "", desc: "", price: 0 } });
      await loadProducts();
    } catch {
      setError("Ürün eklenemedi.");
    } finally {
      setPending(false);
    }
  }

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <>
      <div className="admin-section-header">
        <h2>Tasarım Ürünleri</h2>
        <button type="button" className="admin-btn primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Kapat" : "+ Yeni Ürün"}
        </button>
      </div>

      <div className="admin-filter-row">
        <button type="button" className={`admin-btn small ${filter === "all" ? "primary" : ""}`} onClick={() => setFilter("all")}>Tümü</button>
        {CATEGORIES.map((c) => (
          <button key={c.value} type="button" className={`admin-btn small ${filter === c.value ? "primary" : ""}`} onClick={() => setFilter(c.value)}>
            {c.label}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {showAdd && (
        <div className="admin-add-form">
          <div className="admin-add-row">
            <label><span>Kategori</span>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="admin-role-select">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label><span>Slug</span>
              <input type="text" placeholder="optional-slug" className="admin-search" style={{ maxWidth: 200 }} onChange={(e) => setNewData((prev) => ({ ...prev, slug: e.target.value }))} />
            </label>
          </div>
          <div className="admin-add-row">
            <label><span>TR Başlık</span>
              <input type="text" className="admin-search" value={String(newData.tr?.title || "")} onChange={(e) => setNewData((prev) => ({ ...prev, tr: { ...prev.tr, title: e.target.value } }))} />
            </label>
            <label><span>EN Başlık</span>
              <input type="text" className="admin-search" value={String(newData.en?.title || "")} onChange={(e) => setNewData((prev) => ({ ...prev, en: { ...prev.en, title: e.target.value } }))} />
            </label>
          </div>
          <div className="admin-add-row">
            <label><span>TR Açıklama</span>
              <input type="text" className="admin-search" value={String(newData.tr?.desc || "")} onChange={(e) => setNewData((prev) => ({ ...prev, tr: { ...prev.tr, desc: e.target.value } }))} />
            </label>
            <label><span>EN Açıklama</span>
              <input type="text" className="admin-search" value={String(newData.en?.desc || "")} onChange={(e) => setNewData((prev) => ({ ...prev, en: { ...prev.en, desc: e.target.value } }))} />
            </label>
          </div>
          <div className="admin-add-row">
            <label><span>Fiyat (TL)</span>
              <input type="number" className="admin-search" style={{ maxWidth: 120 }} value={Number(newData.tr?.price || 0)} onChange={(e) => {
                const price = Number(e.target.value);
                setNewData((prev) => ({ en: { ...prev.en, price }, tr: { ...prev.tr, price } }));
              }} />
            </label>
            <label><span>Birim</span>
              <input type="text" className="admin-search" style={{ maxWidth: 120 }} placeholder="per icon, per emoji..." value={String(newData.en?.unit || "")} onChange={(e) => {
                setNewData((prev) => ({ en: { ...prev.en, unit: e.target.value }, tr: { ...prev.tr, unit: e.target.value } }));
              }} />
            </label>
          </div>
          <button type="button" className="admin-btn primary" disabled={pending} onClick={addProduct}>
            {pending ? "Ekleniyor..." : "Ekle"}
          </button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ürün</th>
              <th>Kategori</th>
              <th>Fiyat</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const d = product.data;
              const trTitle = String(d.tr?.title || d.en?.title || "—");
              const price = d.tr?.price || d.en?.price;
              const isEditing = editingId === product.id;

              return (
                <tr key={product.id} className={!product.visible ? "admin-row-banned" : ""}>
                  <td>
                    {isEditing ? (
                      <div className="admin-edit-cell">
                        <input type="text" className="admin-search" value={String(editData.tr?.title || "")} placeholder="TR başlık" onChange={(e) => setEditData((prev) => ({ ...prev, tr: { ...prev.tr, title: e.target.value } }))} />
                        <input type="text" className="admin-search" value={String(editData.en?.title || "")} placeholder="EN başlık" onChange={(e) => setEditData((prev) => ({ ...prev, en: { ...prev.en, title: e.target.value } }))} />
                      </div>
                    ) : (
                      <div className="admin-member-cell">
                        <div>
                          <span className="admin-member-name">{trTitle}</span>
                          {product.slug && <span className="admin-member-ip">/{product.slug}</span>}
                        </div>
                      </div>
                    )}
                  </td>
                  <td><span className="admin-badge">{CATEGORIES.find((c) => c.value === product.category)?.label || product.category}</span></td>
                  <td>
                    {isEditing ? (
                      <input type="number" className="admin-search" style={{ width: 80 }} value={Number(editData.tr?.price || 0)} onChange={(e) => {
                        const price = Number(e.target.value);
                        setEditData((prev) => ({ en: { ...prev.en, price }, tr: { ...prev.tr, price } }));
                      }} />
                    ) : (
                      <span>{price ? `${price} TL` : "—"}</span>
                    )}
                  </td>
                  <td>
                    <button type="button" className={`admin-btn small ${product.visible ? "primary" : "danger"}`} onClick={() => toggleVisible(product.id, product.visible)}>
                      {product.visible ? "Aktif" : "Gizli"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      {isEditing ? (
                        <>
                          <button type="button" className="admin-btn primary small" disabled={pending} onClick={() => saveEdit(product.id)}>Kaydet</button>
                          <button type="button" className="admin-btn small" onClick={cancelEdit}>İptal</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="admin-btn small" onClick={() => startEdit(product)}>Düzenle</button>
                          <button type="button" className="admin-btn danger small" onClick={() => deleteProduct(product.id)}>Sil</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">Ürün bulunamadı</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
