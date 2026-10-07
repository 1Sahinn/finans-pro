import { useState } from 'react';
import { Plus, Pencil, Trash2, X, ChevronLeft, User, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCurrentSummary } from '../data/store';
import type { Current, CurrentType } from '../types';

const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';
const today = () => new Date().toISOString().split('T')[0];

// ===== CARİ FORMU =====
interface CurrentFormData { name: string; phone: string; type: CurrentType; }
const defaultCurrentForm = (): CurrentFormData => ({ name: '', phone: '', type: 'musteri' });

// ===== DEFTER KAYIT FORMU =====
interface EntryFormData { tarih: string; aciklama: string; miktar: string; fiyat: string; odeme: string; }
const defaultEntryForm = (): EntryFormData => ({ tarih: today(), aciklama: '', miktar: '', fiyat: '', odeme: '' });

export default function CurrentsPage() {
  const { state, addCurrent, updateCurrent, deleteCurrent, addCurrentLedgerEntry, deleteCurrentLedgerEntry } = useApp();
  const { currents, currentLedgerEntries } = state;

  const [selectedCurrentId, setSelectedCurrentId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'hepsi' | CurrentType>('hepsi');
  const [search, setSearch] = useState('');

  // Cari modal
  const [currentModal, setCurrentModal] = useState(false);
  const [currentForm, setCurrentForm] = useState<CurrentFormData>(defaultCurrentForm());
  const [editingCurrentId, setEditingCurrentId] = useState<string | null>(null);

  // Defter kayıt modalı
  const [entryModal, setEntryModal] = useState(false);
  const [entryForm, setEntryForm] = useState<EntryFormData>(defaultEntryForm());

  // Silme
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'current' | 'entry'; id: string } | null>(null);

  // ---- Cari işlemleri ----
  const openAddCurrent = () => { setCurrentForm(defaultCurrentForm()); setEditingCurrentId(null); setCurrentModal(true); };
  const openEditCurrent = (c: Current) => { setCurrentForm({ name: c.name, phone: c.phone ?? '', type: c.type }); setEditingCurrentId(c.id); setCurrentModal(true); };
  const saveCurrent = () => {
    if (!currentForm.name.trim()) return;
    if (editingCurrentId) updateCurrent(editingCurrentId, { name: currentForm.name, phone: currentForm.phone, type: currentForm.type });
    else addCurrent({ name: currentForm.name, phone: currentForm.phone, type: currentForm.type });
    setCurrentModal(false);
  };

  // ---- Defter kayıt işlemleri ----
  const openAddEntry = () => { setEntryForm(defaultEntryForm()); setEntryModal(true); };
  const saveEntry = () => {
    if (!selectedCurrentId) return;
    const miktar = parseFloat(entryForm.miktar) || 0;
    const fiyat = parseFloat(entryForm.fiyat) || 0;
    const tutar = parseFloat((miktar * fiyat).toFixed(2));
    const odeme = parseFloat(entryForm.odeme) || 0;
    addCurrentLedgerEntry({
      currentId: selectedCurrentId,
      tarih: entryForm.tarih,
      aciklama: entryForm.aciklama,
      miktar, fiyat, tutar, odeme,
    });
    setEntryModal(false);
  };

  // ---- Silme ----
  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'current') {
      deleteCurrent(deleteConfirm.id);
      if (selectedCurrentId === deleteConfirm.id) setSelectedCurrentId(null);
    } else deleteCurrentLedgerEntry(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  // ---- Filtrelenmiş cariler ----
  const filteredCurrents = currents.filter(c => {
    const matchType = filterType === 'hepsi' || c.type === filterType;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.phone ?? '').includes(search);
    return matchType && matchSearch;
  });

  // Seçili cari
  const selectedCurrent = currents.find(c => c.id === selectedCurrentId);
  const ledgerEntries = selectedCurrentId
    ? currentLedgerEntries
        .filter(e => e.currentId === selectedCurrentId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];
  const summary = selectedCurrentId ? getCurrentSummary(state, selectedCurrentId) : null;

  // ====== DEFTER GÖRÜNÜMÜ ======
  if (selectedCurrent) {
    return (
      <div className="page">
        {/* Geri butonu + başlık */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setSelectedCurrentId(null)}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selectedCurrent.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)' }}>
              {selectedCurrent.type === 'musteri' ? '👤 Müşteri' : '🏭 Tedarikçi'} · {selectedCurrent.phone}
            </div>
          </div>
          <button className="btn btn-primary" onClick={openAddEntry} style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
            <Plus size={15} /> Kayıt Ekle
          </button>
        </div>

        {/* Özet kartlar */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--color-danger)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>BORÇ</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-danger)' }}>{fmt(summary.borcTop)}</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>ÖDEME</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-success)' }}>{fmt(summary.alacakTop)}</div>
            </div>
            <div style={{
              background: summary.bakiye > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${summary.bakiye > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
              borderRadius: 14, padding: '12px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.6rem', color: summary.bakiye > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>BAKİYE</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: summary.bakiye > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>{fmt(summary.bakiye)}</div>
            </div>
          </div>
        )}

        {/* Tablo başlıkları */}
        <div style={{
          background: 'var(--color-surface-3)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px 12px 0 0',
          display: 'grid',
          gridTemplateColumns: '80px 1fr 52px 64px 72px 80px 32px',
          gap: 6, padding: '8px 12px',
        }}>
          {['TARİH', 'AÇIKLAMA', 'MİK.', 'FİYAT', 'TUTAR', 'BAKİYE', ''].map((h, i) => (
            <div key={i} style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
          ))}
        </div>

        {/* Kayıtlar */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
          {ledgerEntries.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.85rem' }}>
              Henüz kayıt yok. "Kayıt Ekle" ile başlayın.
            </div>
          ) : (
            ledgerEntries.map((entry, idx) => (
              <div key={entry.id} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 52px 64px 72px 80px 32px',
                gap: 6, padding: '9px 12px',
                borderBottom: idx < ledgerEntries.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none',
                alignItems: 'center',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(99,102,241,0.03)',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-dim)' }}>
                  {entry.tarih.slice(5).replace('-', '/')}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.aciklama || '—'}
                  {entry.odeme > 0 && entry.tutar === 0 && (
                    <span className="badge badge-success" style={{ marginLeft: 6, fontSize: '0.6rem' }}>Ödeme</span>
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                  {entry.miktar > 0 ? entry.miktar : '—'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                  {entry.fiyat > 0 ? `${entry.fiyat}₺` : (entry.odeme > 0 ? '' : '—')}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: entry.tutar > 0 ? 'var(--color-danger)' : 'var(--color-text-dim)', textAlign: 'right' }}>
                  {entry.tutar > 0 ? fmt(entry.tutar) : (entry.odeme > 0 ? <span style={{ color: 'var(--color-success)' }}>-{fmt(entry.odeme)}</span> : '—')}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: entry.bakiye > 0 ? 'var(--color-warning)' : 'var(--color-success)', textAlign: 'right' }}>
                  {fmt(entry.bakiye)}
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ width: 24, height: 24, borderRadius: 6, color: 'var(--color-danger)', padding: 0 }}
                  onClick={() => setDeleteConfirm({ type: 'entry', id: entry.id })}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* DEFTER KAYIT MODALI */}
        {entryModal && (
          <div className="modal-overlay" onClick={() => setEntryModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Kayıt Ekle — {selectedCurrent.name}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setEntryModal(false)}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tarih</label>
                    <input type="date" className="form-input" value={entryForm.tarih} onChange={e => setEntryForm(f => ({ ...f, tarih: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Açıklama</label>
                    <input className="form-input" placeholder="Mal alımı, ödeme..." value={entryForm.aciklama} onChange={e => setEntryForm(f => ({ ...f, aciklama: e.target.value }))} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Miktar</label>
                    <input type="number" className="form-input" placeholder="0" min="0" value={entryForm.miktar} onChange={e => setEntryForm(f => ({ ...f, miktar: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fiyat (₺)</label>
                    <input type="number" className="form-input" placeholder="0.00" min="0" step="0.01" value={entryForm.fiyat} onChange={e => setEntryForm(f => ({ ...f, fiyat: e.target.value }))} />
                  </div>
                </div>
                {/* Tutar önizleme */}
                {(parseFloat(entryForm.miktar) > 0 && parseFloat(entryForm.fiyat) > 0) && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Tutar: </span>
                    <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                      {fmt(parseFloat(entryForm.miktar) * parseFloat(entryForm.fiyat))}
                    </span>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Ödeme (₺)</label>
                  <input type="number" className="form-input" placeholder="0.00" min="0" step="0.01" value={entryForm.odeme} onChange={e => setEntryForm(f => ({ ...f, odeme: e.target.value }))} />
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={saveEntry}>Kaydet</button>
              </div>
            </div>
          </div>
        )}

        {/* Silme onay */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px' }}>Kaydı Sil</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>Bu kaydı silmek istediğinizden emin misiniz?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>İptal</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmDelete}>Sil</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====== CARİ LİSTESİ ======
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Cari Takip</h1>
        <button id="btn-add-current" className="btn btn-primary" onClick={openAddCurrent}>
          <Plus size={16} /> Cari Ekle
        </button>
      </div>

      {/* Filtre + Arama */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="toggle-tabs" style={{ flex: 1, minWidth: 200 }}>
          {(['hepsi', 'musteri', 'tedarikci'] as const).map(t => (
            <button key={t} className={`toggle-tab ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
              {t === 'hepsi' ? 'Hepsi' : t === 'musteri' ? '👤 Müşteri' : '🏭 Tedarikçi'}
            </button>
          ))}
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input className="search-input" placeholder="İsim veya telefon ara..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Cari kartları */}
      {filteredCurrents.length === 0 ? (
        <div className="empty-state">
          <User size={48} />
          <p>Cari bulunamadı</p>
          <button className="btn btn-primary" onClick={openAddCurrent}>Cari Ekle</button>
        </div>
      ) : (
        filteredCurrents.map(current => {
          const sum = getCurrentSummary(state, current.id);
          return (
            <div key={current.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedCurrentId(current.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: current.type === 'musteri' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  {current.type === 'musteri' ? '👤' : '🏭'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{current.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-dim)', fontSize: '0.75rem' }}>
                    <Phone size={11} /> {current.phone || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '0.95rem', fontWeight: 800,
                    color: sum.bakiye > 0 ? 'var(--color-warning)' : sum.bakiye < 0 ? 'var(--color-success)' : 'var(--color-text-muted)',
                  }}>
                    {fmt(Math.abs(sum.bakiye))}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)' }}>
                    {sum.bakiye > 0 ? 'Bakiye' : sum.bakiye < 0 ? 'Alacak' : 'Sıfır'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30, borderRadius: 8 }} onClick={e => { e.stopPropagation(); openEditCurrent(current); }}>
                    <Pencil size={13} />
                  </button>
                  <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30, borderRadius: 8, color: 'var(--color-danger)' }} onClick={e => { e.stopPropagation(); setDeleteConfirm({ type: 'current', id: current.id }); }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* CARİ MODALI */}
      {currentModal && (
        <div className="modal-overlay" onClick={() => setCurrentModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCurrentId ? 'Cariyi Düzenle' : 'Yeni Cari'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setCurrentModal(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Tür</label>
                <div className="toggle-tabs">
                  <button className={`toggle-tab ${currentForm.type === 'musteri' ? 'active' : ''}`} onClick={() => setCurrentForm(f => ({ ...f, type: 'musteri' }))}>👤 Müşteri</button>
                  <button className={`toggle-tab ${currentForm.type === 'tedarikci' ? 'active' : ''}`} onClick={() => setCurrentForm(f => ({ ...f, type: 'tedarikci' }))}>🏭 Tedarikçi</button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ad Soyad / Firma</label>
                <input className="form-input" placeholder="Ad Soyad veya Firma Adı" value={currentForm.name} onChange={e => setCurrentForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input className="form-input" type="tel" placeholder="0532 000 0000" value={currentForm.phone} onChange={e => setCurrentForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={saveCurrent}>
                {editingCurrentId ? 'Güncelle' : 'Cari Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Silme onay */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px' }}>Cariyi Sil</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
              Bu cariyi ve tüm defter kayıtlarını silmek istediğinizden emin misiniz?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>İptal</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmDelete}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
