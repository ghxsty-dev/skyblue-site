"use client";

import { useCallback, useEffect, useState } from "react";

interface Product {
  id: string;
  category: string;
  slug: string | null;
  data: Record<string, unknown>;
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

function emptyProduct(category: string): Record<string, unknown> {
  if (category === "package") {
    return {
      en: { title: "", desc: "", slug: "", basic: 0, pro: 0, basicIncludes: [], proIncludes: [] },
      tr: { title: "", desc: "", slug: "", basic: 0, pro: 0, basicIncludes: [], proIncludes: [] },
    };
  }
  return {
    en: { title: "", desc: "", price: 0 },
    tr: { title: "", desc: "", price: 0 },
  };
}

function getVal(data: Record<string, unknown>, lang: string, key: string): string {
  const section = data[lang] as Record<string, unknown> | undefined;
  if (!section) return "";
  const v = section[key];
  if (Array.isArray(v)) return v.join("\n");
  return String(v ?? "");
}

function setVal(data: Record<string, unknown>, lang: string, key: string, value: string, isNum?: boolean): Record<string, unknown> {
  const section = (data[lang] as Record<string, unknown>) || {};
  const next = { ...section, [key]: isNum ? Number(value) || 0 : value };
  return { ...data, [lang]: next };
}

function getListVal(data: Record<string, unknown>, lang: string, key: string): string {
  const section = data[lang] as Record<string, unknown> | undefined;
  if (!section) return "";
  const arr = section[key];
  return Array.isArray(arr) ? arr.join("\n") : String(arr ?? "");
}

function setListVal(data: Record<string, unknown>, lang: string, key: string, value: string): Record<string, unknown> {
  const section = (data[lang] as Record<string, unknown>) || {};
  const arr = value.split("\n").map((s) => s.trim()).filter(Boolean);
  return { ...data, [lang]: { ...section, [key]: arr } };
}

function PackageEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="admin-package-editor">
      {(["tr", "en"] as const).map((lang) => (
        <div key={lang} className="admin-lang-section">
          <div className="admin-lang-label">{lang.toUpperCase()}</div>
          <label className="admin-field">
            <span>Başlık</span>
            <input type="text" className="admin-search" value={getVal(data, lang, "title")} onChange={(e) => onChange(setVal(data, lang, "title", e.target.value))} />
          </label>
          <label className="admin-field">
            <span>Açıklama</span>
            <input type="text" className="admin-search" value={getVal(data, lang, "desc")} onChange={(e) => onChange(setVal(data, lang, "desc", e.target.value))} />
          </label>
          <label className="admin-field">
            <span>Slug</span>
            <input type="text" className="admin-search" value={getVal(data, lang, "slug")} onChange={(e) => onChange(setVal(data, lang, "slug", e.target.value))} />
          </label>
          <div className="admin-price-row">
            <label className="admin-field">
              <span>Basic Fiyat (TL)</span>
              <input type="number" className="admin-search" value={getVal(data, lang, "basic")} onChange={(e) => onChange(setVal(data, lang, "basic", e.target.value, true))} />
            </label>
            <label className="admin-field">
              <span>Pro Fiyat (TL)</span>
              <input type="number" className="admin-search" value={getVal(data, lang, "pro")} onChange={(e) => onChange(setVal(data, lang, "pro", e.target.value, true))} />
            </label>
          </div>
          <label className="admin-field">
            <span>Basic İçerik (satır satır)</span>
            <textarea className="admin-search admin-textarea" rows={3} value={getListVal(data, lang, "basicIncludes")} onChange={(e) => onChange(setListVal(data, lang, "basicIncludes", e.target.value))} />
          </label>
          <label className="admin-field">
            <span>Pro İçerik (satır satır)</span>
            <textarea className="admin-search admin-textarea" rows={4} value={getListVal(data, lang, "proIncludes")} onChange={(e) => onChange(setListVal(data, lang, "proIncludes", e.target.value))} />
          </label>
        </div>
      ))}
    </div>
  );
}

function SimpleEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="admin-package-editor">
      {(["tr", "en"] as const).map((lang) => (
        <div key={lang} className="admin-lang-section">
          <div className="admin-lang-label">{lang.toUpperCase()}</div>
          <label className="admin-field">
            <span>Başlık</span>
            <input type="text" className="admin-search" value={getVal(data, lang, "title")} onChange={(e) => onChange(setVal(data, lang, "title", e.target.value))} />
          </label>
          <label className="admin-field">
            <span>Açıklama</span>
            <input type="text" className="admin-search" value={getVal(data, lang, "desc")} onChange={(e) => onChange(setVal(data, lang, "desc", e.target.value))} />
          </label>
          <div className="admin-price-row">
            <label className="admin-field">
              <span>Fiyat (TL)</span>
              <input type="number" className="admin-search" value={getVal(data, lang, "price")} onChange={(e) => onChange(setVal(data, lang, "price", e.target.value, true))} />
            </label>
            <label className="admin-field">
              <span>Birim</span>
              <input type="text" className="admin-search" placeholder="per icon, per emoji..." value={getVal(data, lang, "unit")} onChange={(e) => onChange(setVal(data, lang, "unit", e.target.value))} />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DesignProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [pending, setPending] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("design");
  const [newData, setNewData] = useState<Record<string, unknown>>(emptyProduct("design"));

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
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData({});
  }

  async function saveEdit(id: string) {
    setPending(true);
    try {
      const response = await fetch("/api/admin/design-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, data: editData }),
      });
      if (!response.ok) throw new Error("UPDATE_FAILED");
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, data: editData } : p));
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
      setNewData(emptyProduct(newCategory));
      await loadProducts();
    } catch {
      setError("Ürün eklenemedi.");
    } finally {
      setPending(false);
    }
  }

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  function getProductName(p: Product): string {
    const d = p.data;
    const tr = d.tr as Record<string, unknown> | undefined;
    return String(tr?.title || (d.en as Record<string, unknown>)?.title || "—");
  }

  function getProductPrice(p: Product): string {
    const d = p.data;
    if (p.category === "package") {
      const tr = d.tr as Record<string, unknown> | undefined;
      return tr?.basic && tr?.pro ? `${tr.basic} / ${tr.pro} TL` : "—";
    }
    const price = (d.tr as Record<string, unknown>)?.price ?? (d.en as Record<string, unknown>)?.price;
    return price ? `${price} TL` : "—";
  }

  return (
    <>
      <div className="admin-section-header">
        <h2>Tasarım Ürünleri</h2>
        <button type="button" className="admin-btn primary" onClick={() => { setShowAdd(!showAdd); setNewData(emptyProduct(newCategory)); }}>
          {showAdd ? "Kapat" : "+ Yeni Ürün"}
        </button>
      </div>

      <div className="admin-filter-row">
        <button type="button" className={`admin-btn small ${filter === "all" ? "primary" : ""}`} onClick={() => setFilter("all")}>Tümü</button>
        {CATEGORIES.map((c) => (
          <button key={c.value} type="button" className={`admin-btn small ${filter === c.value ? "primary" : ""}`} onClick={() => setFilter(c.value)}>
            {c.label} ({products.filter((p) => p.category === c.value).length})
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {showAdd && (
        <div className="admin-add-form">
          <label className="admin-field">
            <span>Kategori</span>
            <select value={newCategory} onChange={(e) => { setNewCategory(e.target.value); setNewData(emptyProduct(e.target.value)); }} className="admin-role-select">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          {newCategory === "package" ? (
            <PackageEditor data={newData} onChange={setNewData} />
          ) : (
            <SimpleEditor data={newData} onChange={setNewData} />
          )}
          <button type="button" className="admin-btn primary" disabled={pending} onClick={addProduct}>
            {pending ? "Ekleniyor..." : "Ekle"}
          </button>
        </div>
      )}

      <div className="admin-design-list">
        {filtered.map((product) => {
          const isEditing = editingId === product.id;
          const catLabel = CATEGORIES.find((c) => c.value === product.category)?.label || product.category;

          return (
            <div key={product.id} className={`admin-design-card ${!product.visible ? "admin-row-banned" : ""}`}>
              <div className="admin-design-card-header">
                <div className="admin-design-card-info">
                  <span className="admin-member-name">{getProductName(product)}</span>
                  <div className="admin-design-card-meta">
                    <span className="admin-badge">{catLabel}</span>
                    <span className="admin-design-price">{getProductPrice(product)}</span>
                    {product.slug && <span className="admin-member-ip">/{product.slug}</span>}
                  </div>
                </div>
                <div className="admin-design-card-actions">
                  <button type="button" className={`admin-btn small ${product.visible ? "primary" : "danger"}`} onClick={() => toggleVisible(product.id, product.visible)}>
                    {product.visible ? "Aktif" : "Gizli"}
                  </button>
                  {isEditing ? (
                    <>
                      <button type="button" className="admin-btn primary small" disabled={pending} onClick={() => saveEdit(product.id)}>
                        {pending ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                      <button type="button" className="admin-btn small" onClick={cancelEdit}>İptal</button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="admin-btn small" onClick={() => startEdit(product)}>Düzenle</button>
                      <button type="button" className="admin-btn danger small" onClick={() => deleteProduct(product.id)}>Sil</button>
                    </>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="admin-design-card-editor">
                  {product.category === "package" ? (
                    <PackageEditor data={editData} onChange={setEditData} />
                  ) : (
                    <SimpleEditor data={editData} onChange={setEditData} />
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="admin-empty">Ürün bulunamadı</div>
        )}
      </div>
    </>
  );
}
