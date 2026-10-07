import { useState, useMemo } from 'react';
import {
  Plus, Search, Package, Edit2, Trash2, X, ChevronUp, ChevronDown, Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types';

interface ProductFormData {
  name: string;
  barcode: string;
  category: string;
  purchasePrice: string;
  salePrice: string;
  vatRate: string;
  stock: string;
  criticalStock: string;
}

const emptyForm: ProductFormData = {
  name: '', barcode: '', category: '',
  purchasePrice: '', salePrice: '', vatRate: '20',
  stock: '', criticalStock: '5',
};

const CATEGORIES = ['Bilgisayar', 'Aksesuar', 'Mobilya', 'Elektronik', 'Gıda', 'Kırtasiye', 'Diğer'];

export default function StockPage() {
  const { state, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [filterCritical, setFilterCritical] = useState(false);

  const products = useMemo(() => {
    let list = state.products;
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search));
    if (filterCat) list = list.filter(p => p.category === filterCat);
    if (filterCritical) list = list.filter(p => p.stock <= p.criticalStock);
    return list;
  }, [state.products, search, filterCat, filterCritical]);

  const categories = useMemo(() => {
    const cats = new Set(state.products.map(p => p.category).filter(Boolean));
    return [...CATEGORIES.filter(c => cats.has(c)), ...Array.from(cats).filter(c => !CATEGORIES.includes(c))];
  }, [state.products]);

  function openAdd() {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name, barcode: p.barcode, category: p.category,
      purchasePrice: String(p.purchasePrice), salePrice: String(p.salePrice),
      vatRate: String(p.vatRate), stock: String(p.stock), criticalStock: String(p.criticalStock),
    });
    setEditId(p.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const data = {
      name: form.name.trim(),
      barcode: form.barcode.trim(),
      category: form.category,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      salePrice: parseFloat(form.salePrice) || 0,
      vatRate: parseFloat(form.vatRate) || 0,
      stock: parseInt(form.stock) || 0,
      criticalStock: parseInt(form.criticalStock) || 0,
    };
    if (editId) {
      updateProduct(editId, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
  }

  function handleAdjust(productId: string, delta: number) {
    const p = state.products.find(x => x.id === productId);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    updateProduct(productId, { stock: newStock });
  }

  function handleAdjustManual() {
    if (!adjustId) return;
    const p = state.products.find(x => x.id === adjustId);
    if (!p) return;
    const qty = parseInt(adjustQty);
    if (isNaN(qty)) return;
    updateProduct(adjustId, { stock: Math.max(0, p.stock + qty) });
    setAdjustId(null);
    setAdjustQty('');
  }

  const criticalCount = state.products.filter(p => p.stock <= p.criticalStock).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Stok</h1>
        <button className="btn btn-primary" id="add-product-btn" onClick={openAdd}>
          <Plus size={16} /> Ekle
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} />
        <input
          id="stock-search"
          className="search-input"
          placeholder="Ürün adı veya barkod ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          id="filter-critical-btn"
          className={`btn btn-ghost ${filterCritical ? 'btn-warning' : ''}`}
          style={{ padding: '6px 12px', fontSize: '0.75rem', gap: 4, ...(filterCritical ? { background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)', borderColor: 'rgba(245,158,11,0.3)' } : {}) }}
          onClick={() => setFilterCritical(f => !f)}
        >
          <Filter size={12} />
          Kritik ({criticalCount})
        </button>
        <select
          id="category-filter"
          className="form-select"
          style={{ padding: '6px 32px 6px 10px', fontSize: '0.75rem', flex: '1', minWidth: 100, maxWidth: 160 }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <p>Ürün bulunamadı</p>
          <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: 12 }}>
            <Plus size={16} /> İlk Ürünü Ekle
          </button>
        </div>
      ) : (
        products.map(p => {
          const stockPct = Math.min(100, p.criticalStock > 0 ? (p.stock / (p.criticalStock * 4)) * 100 : 100);
          const isCritical = p.stock <= p.criticalStock;
          const isSoldOut = p.stock === 0;

          return (
            <div key={p.id} className="list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                    {isSoldOut && <span className="badge badge-danger">Tükendi</span>}
                    {!isSoldOut && isCritical && <span className="badge badge-warning">Kritik</span>}
                  </div>
                  {p.barcode && <div className="text-dim" style={{ fontSize: '0.7rem', marginTop: 2 }}>#{p.barcode}</div>}
                  {p.category && <span className="badge badge-primary" style={{ marginTop: 4, fontSize: '0.65rem' }}>{p.category}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-icon" id={`edit-product-${p.id}`} onClick={() => openEdit(p)} title="Düzenle">
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon" id={`delete-product-${p.id}`} onClick={() => { if(confirm('Silmek istiyor musunuz?')) deleteProduct(p.id); }} title="Sil" style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="divider" style={{ margin: '10px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 2 }}>Alış</div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{formatCurrency(p.purchasePrice)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 2 }}>Satış</div>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-success)' }}>{formatCurrency(p.salePrice)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginBottom: 2 }}>Kâr</div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>{formatCurrency(p.salePrice - p.purchasePrice)}</div>
                </div>
              </div>

              {/* Stock bar */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Stok: <strong style={{ color: isCritical ? 'var(--color-warning)' : 'var(--color-text)' }}>{p.stock}</strong> adet
                    <span className="text-dim"> / Eşik: {p.criticalStock}</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>KDV %{p.vatRate}</span>
                </div>
                <div className="stock-bar">
                  <div className="stock-bar-fill" style={{
                    width: `${stockPct}%`,
                    background: isSoldOut ? 'var(--color-danger)' : isCritical ? 'var(--color-warning)' : 'var(--color-success)'
                  }} />
                </div>
              </div>

              {/* Stock adjust */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
                <button className="btn btn-ghost btn-icon" id={`stock-down-${p.id}`} onClick={() => handleAdjust(p.id, -1)} title="-1">
                  <ChevronDown size={16} />
                </button>
                <button className="btn btn-ghost btn-icon" id={`stock-up-${p.id}`} onClick={() => handleAdjust(p.id, 1)} title="+1">
                  <ChevronUp size={16} />
                </button>
                {adjustId === p.id ? (
                  <>
                    <input
                      type="number"
                      className="form-input"
                      style={{ padding: '6px 10px', width: 80, fontSize: '0.8rem' }}
                      placeholder="±adet"
                      value={adjustQty}
                      onChange={e => setAdjustQty(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdjustManual()}
                      autoFocus
                    />
                    <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={handleAdjustManual}>Uygula</button>
                    <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => { setAdjustId(null); setAdjustQty(''); }}>İptal</button>
                  </>
                ) : (
                  <button
                    className="btn btn-ghost"
                    id={`stock-adjust-${p.id}`}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => setAdjustId(p.id)}
                  >
                    Manuel Giriş
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Ürün Düzenle' : 'Yeni Ürün'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Ürün Adı *</label>
                <input id="product-name" className="form-input" placeholder="Ürün adı" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Barkod</label>
                  <input id="product-barcode" className="form-input" placeholder="Barkod" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select id="product-category" className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Seçiniz</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Alış Fiyatı (₺)</label>
                  <input id="product-purchase-price" type="number" className="form-input" placeholder="0,00" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Satış Fiyatı (₺)</label>
                  <input id="product-sale-price" type="number" className="form-input" placeholder="0,00" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} />
                </div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">KDV (%)</label>
                  <select id="product-vat" className="form-select" value={form.vatRate} onChange={e => setForm(f => ({ ...f, vatRate: e.target.value }))}>
                    <option value="0">%0</option>
                    <option value="1">%1</option>
                    <option value="8">%8</option>
                    <option value="10">%10</option>
                    <option value="20">%20</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Stok Miktarı</label>
                  <input id="product-stock" type="number" className="form-input" placeholder="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Kritik Eşik</label>
                  <input id="product-critical" type="number" className="form-input" placeholder="5" value={form.criticalStock} onChange={e => setForm(f => ({ ...f, criticalStock: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: 4 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowModal(false)}>İptal</button>
                <button id="save-product-btn" className="btn btn-primary btn-full" onClick={handleSave}>
                  {editId ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
