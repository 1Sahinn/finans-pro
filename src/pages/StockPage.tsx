import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ProductTur, Room, Product } from '../types';

const TUR_OPTIONS: ProductTur[] = ['Alt', 'Takım', 'Üst', 'Diğer'];

const TUR_COLORS: Record<ProductTur, string> = {
  'Alt':   'badge-accent',
  'Takım': 'badge-primary',
  'Üst':   'badge-success',
  'Diğer': 'badge-warning',
};

// ===== ODA FORMU =====
interface RoomFormData { name: string; }
const defaultRoomForm = (): RoomFormData => ({ name: '' });

// ===== ÜRÜN FORMU =====
interface ProductFormData {
  roomId: string; barkod: string; tur: ProductTur; name: string; fiyat: string;
}
const defaultProductForm = (roomId = ''): ProductFormData => ({ roomId, barkod: '', tur: 'Alt', name: '', fiyat: '' });

export default function StockPage() {
  const { state, addRoom, updateRoom, deleteRoom, addProduct, updateProduct, deleteProduct } = useApp();
  const { rooms, products } = state;

  // Açık/kapalı odalar
  const [openRooms, setOpenRooms] = useState<Record<string, boolean>>({});
  const toggleRoom = (id: string) => setOpenRooms(p => ({ ...p, [id]: !p[id] }));

  // Oda modalı
  const [roomModal, setRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState<RoomFormData>(defaultRoomForm());
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  // Ürün modalı
  const [productModal, setProductModal] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormData>(defaultProductForm());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Silme onay
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'room' | 'product'; id: string } | null>(null);

  // Arama
  const [search, setSearch] = useState('');

  // ---- Oda işlemleri ----
  const openAddRoom = () => { setRoomForm(defaultRoomForm()); setEditingRoomId(null); setRoomModal(true); };
  const openEditRoom = (r: Room) => { setRoomForm({ name: r.name }); setEditingRoomId(r.id); setRoomModal(true); };
  const saveRoom = () => {
    if (!roomForm.name.trim()) return;
    if (editingRoomId) updateRoom(editingRoomId, { name: roomForm.name });
    else { addRoom({ name: roomForm.name }); }
    setRoomModal(false);
  };

  // ---- Ürün işlemleri ----
  const openAddProduct = (roomId: string) => { setProductForm(defaultProductForm(roomId)); setEditingProductId(null); setProductModal(true); };
  const openEditProduct = (p: Product) => { setProductForm({ roomId: p.roomId, barkod: p.barkod, tur: p.tur, name: p.name, fiyat: p.fiyat }); setEditingProductId(p.id); setProductModal(true); };
  const saveProduct = () => {
    if (!productForm.name.trim()) return;
    if (editingProductId) updateProduct(editingProductId, { ...productForm });
    else addProduct({ ...productForm });
    setProductModal(false);
  };

  // ---- Silme ----
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'room') deleteRoom(deleteConfirm.id);
    else deleteProduct(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  // ---- Filtrelenmiş ürünler ----
  const filterProducts = (roomId: string) => {
    const q = search.toLowerCase();
    return products.filter(p => p.roomId === roomId && (
      !q || p.name.toLowerCase().includes(q) || p.barkod.includes(q) || p.tur.toLowerCase().includes(q)
    ));
  };

  const totalProducts = products.length;

  return (
    <div className="page">
      {/* Başlık */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stok Takibi</h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: 2 }}>
            {rooms.length} oda · {totalProducts} ürün
          </div>
        </div>
        <button id="btn-add-room" className="btn btn-primary" onClick={openAddRoom}>
          <Home size={16} /> Oda Ekle
        </button>
      </div>

      {/* Arama */}
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          className="search-input"
          placeholder="Barkod veya ürün adı ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Odalar */}
      {rooms.length === 0 ? (
        <div className="empty-state">
          <Home size={48} />
          <p>Henüz oda eklenmedi</p>
          <button className="btn btn-primary" onClick={openAddRoom}>İlk Odayı Ekle</button>
        </div>
      ) : (
        rooms.map(room => {
          const roomProducts = filterProducts(room.id);
          const isOpen = openRooms[room.id] !== false; // varsayılan açık
          return (
            <div key={room.id} style={{ marginBottom: 12 }}>
              {/* Oda başlığı */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1e35 0%, #1a1a2e 100%)',
                border: '1px solid var(--color-border)',
                borderRadius: isOpen ? '16px 16px 0 0' : 16,
                padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }} onClick={() => toggleRoom(room.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.3))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Home size={16} color="var(--color-primary-light)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{room.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
                      {products.filter(p => p.roomId === room.id).length} ürün
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className="btn btn-ghost btn-icon" onClick={e => { e.stopPropagation(); openEditRoom(room); }} title="Düzenle">
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--color-danger)' }} onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'room', id: room.id }); }} title="Sil">
                    <Trash2 size={14} />
                  </button>
                  {isOpen ? <ChevronUp size={16} color="var(--color-text-dim)" /> : <ChevronDown size={16} color="var(--color-text-dim)" />}
                </div>
              </div>

              {/* Oda içeriği */}
              {isOpen && (
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderTop: 'none',
                  borderRadius: '0 0 16px 16px',
                  overflow: 'hidden',
                }}>
                  {/* Tablo başlıkları */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 80px 1fr 90px 64px',
                    gap: 8, padding: '8px 14px',
                    background: 'var(--color-surface-3)',
                    borderBottom: '1px solid var(--color-border)',
                  }}>
                    {['Barkod', 'Tür', 'Ürün Adı', 'Fiyat', ''].map((h, i) => (
                      <div key={i} style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                    ))}
                  </div>

                  {/* Ürün satırları */}
                  {roomProducts.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>
                      {search ? 'Arama sonucu bulunamadı' : 'Bu odada ürün yok'}
                    </div>
                  ) : (
                    roomProducts.map((product, idx) => (
                      <div key={product.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 80px 1fr 90px 64px',
                        gap: 8, padding: '10px 14px',
                        borderBottom: idx < roomProducts.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none',
                        alignItems: 'center',
                        transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                          {product.barkod || '—'}
                        </div>
                        <div>
                          <span className={`badge ${TUR_COLORS[product.tur]}`} style={{ fontSize: '0.65rem' }}>
                            {product.tur}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{product.name}</div>
                        <div style={{ fontSize: '0.88rem', color: product.fiyat ? 'var(--color-success)' : 'var(--color-text-dim)', fontWeight: 600 }}>
                          {product.fiyat ? `${product.fiyat} ₺` : '—'}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, borderRadius: 8 }} onClick={() => openEditProduct(product)}>
                            <Pencil size={12} />
                          </button>
                          <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, borderRadius: 8, color: 'var(--color-danger)' }} onClick={() => setDeleteConfirm({ type: 'product', id: product.id })}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Ürün ekle butonu */}
                  <div style={{ padding: '10px 14px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      id={`btn-add-product-${room.id}`}
                      className="btn btn-ghost"
                      style={{ width: '100%', fontSize: '0.8rem', gap: 6, justifyContent: 'center' }}
                      onClick={() => openAddProduct(room.id)}
                    >
                      <Plus size={14} /> Bu Odaya Mal Ekle
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ODA MODALI */}
      {roomModal && (
        <div className="modal-overlay" onClick={() => setRoomModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingRoomId ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setRoomModal(false)}><X size={18} /></button>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Oda / Bölge Adı</label>
              <input className="form-input" placeholder="örn. Dükkan-Sol, Depo-Oda1" value={roomForm.name} onChange={e => setRoomForm({ name: e.target.value })} autoFocus />
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={saveRoom}>
              {editingRoomId ? 'Güncelle' : 'Oda Ekle'}
            </button>
          </div>
        </div>
      )}

      {/* ÜRÜN MODALI */}
      {productModal && (
        <div className="modal-overlay" onClick={() => setProductModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProductId ? 'Malı Düzenle' : 'Yeni Mal Ekle'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setProductModal(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Oda seçimi */}
              <div className="form-group">
                <label className="form-label">Oda</label>
                <select className="form-select" value={productForm.roomId} onChange={e => setProductForm(f => ({ ...f, roomId: e.target.value }))}>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Barkod</label>
                  <input className="form-input" placeholder="örn. 1004" value={productForm.barkod} onChange={e => setProductForm(f => ({ ...f, barkod: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tür</label>
                  <select className="form-select" value={productForm.tur} onChange={e => setProductForm(f => ({ ...f, tur: e.target.value as ProductTur }))}>
                    {TUR_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ürün Adı</label>
                <input className="form-input" placeholder="örn. Dalgıç Şardon Battal Düz Paça" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Fiyat (₺)</label>
                <input className="form-input" placeholder="örn. 260 veya 225-230" value={productForm.fiyat} onChange={e => setProductForm(f => ({ ...f, fiyat: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={saveProduct}>
                {editingProductId ? 'Güncelle' : 'Mal Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SİLME ONAY MODALI */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, marginTop: 0 }}>
              {deleteConfirm.type === 'room' ? 'Odayı Sil' : 'Malı Sil'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              {deleteConfirm.type === 'room'
                ? 'Bu odayı ve içindeki TÜM malları silmek istediğinizden emin misiniz?'
                : 'Bu malı silmek istediğinizden emin misiniz?'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>İptal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmDelete}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
