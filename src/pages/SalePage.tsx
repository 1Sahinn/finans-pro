import { useState, useMemo } from 'react';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle, X, Receipt, Package
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getTodayDate, paymentMethodLabels } from '../utils/format';
import type { PaymentMethod, SaleItem } from '../types';

export default function SalePage() {
  const { state, processSale } = useApp();
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('nakit');
  const [currentId, setCurrentId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return state.products.filter(p =>
      p.name.toLowerCase().includes(q) || p.barkod.includes(search)
    );
  }, [state.products, search]);

  function addToCart(productId: string) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    // Fiyatı parse et (ör: "260" veya "225-230" → ilk sayıyı al)
    const parsedPrice = parseFloat(product.fiyat.split('-')[0]) || 0;

    setCartItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: parsedPrice,
        total: parsedPrice,
      }];
    });
    setSearch('');
  }

  function removeFromCart(productId: string) {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  }

  function changeQty(productId: string, delta: number) {
    setCartItems(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return i;
      return { ...i, quantity: newQty, total: newQty * i.unitPrice };
    }));
  }

  function setUnitPrice(productId: string, price: number) {
    setCartItems(prev => prev.map(i =>
      i.productId === productId
        ? { ...i, unitPrice: price, total: i.quantity * price }
        : i
    ));
  }

  const total = cartItems.reduce((s, i) => s + i.total, 0);

  function handleSale() {
    if (cartItems.length === 0) return;
    const today = getTodayDate();
    processSale({
      items: cartItems,
      total,
      paymentMethod,
      currentId: currentId || undefined,
      date: today,
    });
    setCartItems([]);
    setCurrentId('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Hızlı Satış</h1>
        {cartItems.length > 0 && (
          <button className="btn btn-ghost btn-icon" onClick={() => setCartItems([])} title="Sepeti temizle">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Ürün Arama */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div className="search-bar" style={{ marginBottom: 0 }}>
          <Search size={16} />
          <input
            id="sale-product-search"
            className="search-input"
            placeholder="Ürün adı veya barkod ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)' }}
              onClick={() => setSearch('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Sonuçlar */}
        {search && filteredProducts.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
            borderRadius: '0 0 14px 14px', borderTop: 'none', maxHeight: 280, overflowY: 'auto',
          }}>
            {filteredProducts.map(p => (
              <div
                key={p.id}
                id={`sale-add-${p.id}`}
                onClick={() => addToCart(p.id)}
                style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.background = 'var(--color-surface-3)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.name}</div>
                  <div className="text-dim" style={{ fontSize: '0.7rem' }}>
                    Barkod: {p.barkod || '—'} · {p.tur}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {p.fiyat && <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '0.875rem' }}>{p.fiyat} ₺</span>}
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} className="text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {search && filteredProducts.length === 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '0 0 14px 14px', padding: '16px', textAlign: 'center' }}>
            <span className="text-dim" style={{ fontSize: '0.8rem' }}>Ürün bulunamadı</span>
          </div>
        )}
      </div>

      {/* Sepet Boş */}
      {cartItems.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 24px' }}>
          <ShoppingCart size={48} />
          <p style={{ marginTop: 12 }}>Sepet boş</p>
          <span className="text-dim" style={{ fontSize: '0.8rem' }}>Yukarıdan ürün arayın</span>
        </div>
      ) : (
        <>
          {/* Sepet Ürünleri */}
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 10 }}>SEPET ({cartItems.length} ÜRÜN)</div>
            {cartItems.map(item => (
              <div key={item.productId} className="sale-item">
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={18} className="text-primary" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <input
                      type="number"
                      style={{ width: 70, background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: 6, padding: '3px 6px', color: 'var(--color-text)', fontSize: '0.78rem', fontFamily: 'inherit' }}
                      value={item.unitPrice}
                      onChange={e => setUnitPrice(item.productId, parseFloat(e.target.value) || 0)}
                      placeholder="Fiyat"
                    />
                    <span className="text-dim" style={{ fontSize: '0.7rem' }}>₺ × {item.quantity}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon" id={`cart-minus-${item.productId}`} style={{ width: 28, height: 28, borderRadius: 8 }} onClick={() => changeQty(item.productId, -1)}>
                    <Minus size={12} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn btn-ghost btn-icon" id={`cart-plus-${item.productId}`} style={{ width: 28, height: 28, borderRadius: 8 }} onClick={() => changeQty(item.productId, 1)}>
                    <Plus size={12} />
                  </button>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-success)', minWidth: 72, textAlign: 'right' }}>
                    {formatCurrency(item.total)}
                  </div>
                  <button className="btn btn-ghost btn-icon" id={`cart-remove-${item.productId}`} style={{ width: 26, height: 26, color: 'var(--color-danger)', borderRadius: 8 }} onClick={() => removeFromCart(item.productId)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Toplam */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Toplam</span>
              <span style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--color-success)' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Ödeme Yöntemi */}
          <div style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>ÖDEME YÖNTEMİ</div>
            <div className="grid-3">
              {(['nakit', 'kredi_karti', 'havale_eft'] as PaymentMethod[]).map(pm => (
                <button
                  key={pm}
                  id={`payment-${pm}`}
                  className={`btn ${paymentMethod === pm ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '10px 8px', flexDirection: 'column', gap: 4, height: 52 }}
                  onClick={() => setPaymentMethod(pm)}
                >
                  {paymentMethodLabels[pm]}
                </button>
              ))}
            </div>
          </div>

          {/* Cari Seç */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Cari (Opsiyonel)</label>
            <select id="sale-current" className="form-select" value={currentId} onChange={e => setCurrentId(e.target.value)}>
              <option value="">Cari seçme</option>
              {state.currents.filter(c => c.type === 'musteri').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Satış Yap */}
          <button id="complete-sale-btn" className="btn btn-success btn-full btn-lg" onClick={handleSale}>
            <Receipt size={20} />
            Satışı Tamamla — {formatCurrency(total)}
          </button>
        </>
      )}

      {/* Başarı Toast */}
      {showSuccess && (
        <div className="toast" style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: 'var(--color-success)' }}>
          <CheckCircle size={16} style={{ display: 'inline', marginRight: 6 }} />
          Satış tamamlandı!
        </div>
      )}
    </div>
  );
}
