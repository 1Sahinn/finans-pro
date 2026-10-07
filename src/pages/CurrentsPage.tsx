import { useState, useMemo } from 'react';
import { Plus, X, User, Building2, Search, Edit2, Trash2, Phone, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/format';
import type { CurrentType, Current } from '../types';

interface CurrentForm {
  type: CurrentType;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: string;
}

const emptyForm = (type: CurrentType = 'musteri'): CurrentForm => ({
  type, name: '', phone: '', email: '', address: '', balance: '0',
});

export default function CurrentsPage() {
  const { state, addCurrent, updateCurrent, deleteCurrent } = useApp();
  const [tab, setTab] = useState<'all' | 'musteri' | 'tedarikci'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CurrentForm>(emptyForm());

  const currents = useMemo(() => {
    let list = state.currents;
    if (tab !== 'all') list = list.filter(c => c.type === tab);
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
    return list;
  }, [state.currents, tab, search]);

  const totalReceivable = useMemo(() =>
    state.currents.filter(c => c.balance > 0).reduce((s, c) => s + c.balance, 0), [state.currents]);

  const totalPayable = useMemo(() =>
    state.currents.filter(c => c.balance < 0).reduce((s, c) => s + Math.abs(c.balance), 0), [state.currents]);

  function openAdd(type: CurrentType = 'musteri') {
    setForm(emptyForm(type));
    setEditId(null);
    setShowModal(true);
  }

  function openEdit(c: Current) {
    setForm({ type: c.type, name: c.name, phone: c.phone, email: c.email || '', address: c.address || '', balance: String(c.balance) });
    setEditId(c.id);
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const data = {
      type: form.type,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      balance: parseFloat(form.balance) || 0,
    };
    if (editId) {
      updateCurrent(editId, data);
    } else {
      addCurrent(data);
    }
    setShowModal(false);
  }

  function getCurrrentTxHistory(currentId: string) {
    return state.transactions.filter(t => t.currentId === currentId).slice(0, 3);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Cariler</h1>
        <button className="btn btn-primary" id="add-current-btn" onClick={() => openAdd()}>
          <Plus size={16} /> Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card-stat">
          <div className="stat-icon bg-success-soft" style={{ width: 40, height: 40, borderRadius: 12 }}>
            <TrendingUp size={18} className="text-success" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-success)' }}>{formatCurrency(totalReceivable)}</div>
          <div className="stat-label">Toplam Alacak</div>
        </div>
        <div className="card-stat">
          <div className="stat-icon bg-danger-soft" style={{ width: 40, height: 40, borderRadius: 12 }}>
            <TrendingDown size={18} className="text-danger" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-danger)' }}>{formatCurrency(totalPayable)}</div>
          <div className="stat-label">Toplam Borç</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={16} />
        <input
          id="current-search"
          className="search-input"
          placeholder="İsim veya telefon ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="toggle-tabs" style={{ marginBottom: 16 }}>
        <button className={`toggle-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>Tümü</button>
        <button className={`toggle-tab ${tab === 'musteri' ? 'active' : ''}`} onClick={() => setTab('musteri')}>Müşteriler</button>
        <button className={`toggle-tab ${tab === 'tedarikci' ? 'active' : ''}`} onClick={() => setTab('tedarikci')}>Tedarikçiler</button>
      </div>

      {/* List */}
      {currents.length === 0 ? (
        <div className="empty-state">
          <User size={48} />
          <p>Cari bulunamadı</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-primary" onClick={() => openAdd('musteri')}>
              <User size={16} /> Müşteri Ekle
            </button>
            <button className="btn btn-ghost" onClick={() => openAdd('tedarikci')}>
              <Building2 size={16} /> Tedarikçi Ekle
            </button>
          </div>
        </div>
      ) : (
        currents.map(c => {
          const recentTx = getCurrrentTxHistory(c.id);
          return (
            <div key={c.id} className="list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: c.type === 'musteri' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)' }}>
                    {c.type === 'musteri'
                      ? <User size={20} className="text-primary" />
                      : <Building2 size={20} className="text-accent" />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</div>
                    {c.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Phone size={11} className="text-dim" />
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{c.phone}</span>
                      </div>
                    )}
                    <span className={`badge ${c.type === 'musteri' ? 'badge-primary' : 'badge-accent'}`} style={{ marginTop: 4, fontSize: '0.62rem' }}>
                      {c.type === 'musteri' ? 'Müşteri' : 'Tedarikçi'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: c.balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {c.balance >= 0 ? '+' : ''}{formatCurrency(c.balance)}
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.65rem' }}>
                    {c.balance >= 0 ? 'Alacak' : 'Borç'}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon" id={`edit-current-${c.id}`} onClick={() => openEdit(c)} style={{ width: 30, height: 30 }}>
                      <Edit2 size={13} />
                    </button>
                    <button className="btn btn-ghost btn-icon" id={`delete-current-${c.id}`} onClick={() => { if (confirm('Silmek istiyor musunuz?')) deleteCurrent(c.id); }} style={{ width: 30, height: 30, color: 'var(--color-danger)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Son İşlemler */}
              {recentTx.length > 0 && (
                <div style={{ marginTop: 10, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                  <div className="text-dim" style={{ fontSize: '0.65rem', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Son İşlemler</div>
                  {recentTx.map(tx => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 3 }}>
                      <span className="text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tx.description}</span>
                      <span style={{ color: tx.type === 'gelir' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600, marginLeft: 8, flexShrink: 0 }}>
                        {tx.type === 'gelir' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Cari Düzenle' : 'Yeni Cari'}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="toggle-tabs">
                <button className={`toggle-tab ${form.type === 'musteri' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'musteri' }))}>
                  Müşteri
                </button>
                <button className={`toggle-tab ${form.type === 'tedarikci' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'tedarikci' }))}>
                  Tedarikçi
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">İsim / Firma Adı *</label>
                <input id="current-name" className="form-input" placeholder="Ad Soyad veya Firma Adı" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input id="current-phone" className="form-input" placeholder="05xx xxx xx xx" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-posta</label>
                  <input id="current-email" className="form-input" placeholder="email@example.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Başlangıç Bakiyesi (₺)</label>
                <input id="current-balance" type="number" step="0.01" className="form-input" placeholder="0,00 (negatif = borç)" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
                <span className="text-dim" style={{ fontSize: '0.7rem' }}>Pozitif = Alacak, Negatif = Borç</span>
              </div>
              <div className="form-group">
                <label className="form-label">Adres</label>
                <input id="current-address" className="form-input" placeholder="Adres (opsiyonel)" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid-2" style={{ marginTop: 4 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowModal(false)}>İptal</button>
                <button id="save-current-btn" className="btn btn-primary btn-full" onClick={handleSave}>
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
