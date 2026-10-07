import { useState, useMemo } from 'react';
import {
  Plus, X, Wallet, TrendingUp, TrendingDown, Filter, Trash2, Banknote, CreditCard, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, paymentMethodLabels, categoryLabels, incomeCategories, expenseCategories, getTodayDate } from '../utils/format';
import type { TransactionType, PaymentMethod, TransactionCategory } from '../types';

interface TxForm {
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: string;
  paymentMethod: PaymentMethod;
  currentId: string;
  date: string;
}

const emptyForm = (type: TransactionType = 'gelir'): TxForm => ({
  type,
  category: type === 'gelir' ? 'satis' : 'kira',
  description: '',
  amount: '',
  paymentMethod: 'nakit',
  currentId: '',
  date: getTodayDate(),
});

export default function CashPage() {
  const { state, addTransaction, deleteTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TxForm>(emptyForm());
  const [filterType, setFilterType] = useState<'all' | 'gelir' | 'gider'>('all');
  const [filterPayment, setFilterPayment] = useState<string>('');

  const transactions = useMemo(() => {
    let list = [...state.transactions];
    if (filterType !== 'all') list = list.filter(t => t.type === filterType);
    if (filterPayment) list = list.filter(t => t.paymentMethod === filterPayment);
    return list;
  }, [state.transactions, filterType, filterPayment]);

  const monthIncome = useMemo(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return state.transactions.filter(t => t.type === 'gelir' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
  }, [state.transactions]);

  const monthExpense = useMemo(() => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return state.transactions.filter(t => t.type === 'gider' && t.date.startsWith(month)).reduce((s, t) => s + t.amount, 0);
  }, [state.transactions]);

  const cashTotal = useMemo(() =>
    state.transactions.filter(t => t.paymentMethod === 'nakit').reduce((s, t) => t.type === 'gelir' ? s + t.amount : s - t.amount, 0),
    [state.transactions]);

  const bankTotal = useMemo(() =>
    state.transactions.filter(t => t.paymentMethod !== 'nakit').reduce((s, t) => t.type === 'gelir' ? s + t.amount : s - t.amount, 0),
    [state.transactions]);

  function handleTypeChange(type: TransactionType) {
    setForm({ ...emptyForm(type) });
  }

  function handleSave() {
    if (!form.description.trim() || !form.amount) return;
    addTransaction({
      type: form.type,
      category: form.category,
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      paymentMethod: form.paymentMethod,
      currentId: form.currentId || undefined,
      date: form.date,
    });
    setShowModal(false);
  }

  const currentCategories = form.type === 'gelir' ? incomeCategories : expenseCategories;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Kasa</h1>
        <button className="btn btn-primary" id="add-transaction-btn" onClick={() => { setForm(emptyForm()); setShowModal(true); }}>
          <Plus size={16} /> İşlem
        </button>
      </div>

      {/* Bakiyeler */}
      <div className="grid-2" style={{ marginBottom: 12 }}>
        <div className="card-stat">
          <div className="stat-icon bg-primary-soft" style={{ width: 40, height: 40, borderRadius: 12 }}>
            <Banknote size={20} className="text-primary" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cashTotal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {formatCurrency(cashTotal)}
          </div>
          <div className="stat-label">Nakit</div>
        </div>
        <div className="card-stat">
          <div className="stat-icon bg-accent-soft" style={{ width: 40, height: 40, borderRadius: 12 }}>
            <CreditCard size={20} className="text-accent" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: bankTotal >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {formatCurrency(bankTotal)}
          </div>
          <div className="stat-label">Banka / Kart</div>
        </div>
      </div>

      {/* Bu Ay Özet */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 0 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRight: '1px solid var(--color-border)' }}>
          <TrendingUp size={18} className="text-success" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '1rem' }}>{formatCurrency(monthIncome)}</div>
          <div className="text-dim" style={{ fontSize: '0.7rem' }}>Bu Ay Gelir</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRight: '1px solid var(--color-border)' }}>
          <TrendingDown size={18} className="text-danger" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '1rem' }}>{formatCurrency(monthExpense)}</div>
          <div className="text-dim" style={{ fontSize: '0.7rem' }}>Bu Ay Gider</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
          <Wallet size={18} className="text-primary" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontWeight: 700, color: monthIncome - monthExpense >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '1rem' }}>
            {formatCurrency(monthIncome - monthExpense)}
          </div>
          <div className="text-dim" style={{ fontSize: '0.7rem' }}>Net Kâr</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="toggle-tabs" style={{ flex: 1 }}>
          <button className={`toggle-tab ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Tümü</button>
          <button className={`toggle-tab ${filterType === 'gelir' ? 'active' : ''}`} onClick={() => setFilterType('gelir')}>Gelir</button>
          <button className={`toggle-tab ${filterType === 'gider' ? 'active' : ''}`} onClick={() => setFilterType('gider')}>Gider</button>
        </div>
        <select
          className="form-select"
          style={{ padding: '6px 32px 6px 10px', fontSize: '0.75rem', minWidth: 120, maxWidth: 160 }}
          value={filterPayment}
          onChange={e => setFilterPayment(e.target.value)}
        >
          <option value="">Tüm Ödeme</option>
          <option value="nakit">Nakit</option>
          <option value="kredi_karti">K. Kartı</option>
          <option value="havale_eft">Havale/EFT</option>
        </select>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="empty-state">
          <Wallet size={48} />
          <p>İşlem bulunamadı</p>
        </div>
      ) : (
        transactions.map(tx => (
          <div key={tx.id} className="list-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: tx.type === 'gelir' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                  {tx.type === 'gelir'
                    ? <ArrowUpRight size={18} className="text-success" />
                    : <ArrowDownRight size={18} className="text-danger" />
                  }
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>{categoryLabels[tx.category]}</span>
                    <span className="text-dim" style={{ fontSize: '0.7rem' }}>{paymentMethodLabels[tx.paymentMethod]}</span>
                    <span className="text-dim" style={{ fontSize: '0.7rem' }}>{formatDate(tx.date)}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: tx.type === 'gelir' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {tx.type === 'gelir' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
                <button
                  className="btn btn-ghost btn-icon"
                  id={`delete-tx-${tx.id}`}
                  style={{ color: 'var(--color-danger)', width: 30, height: 30 }}
                  onClick={() => { if (confirm('Bu işlemi silmek istiyor musunuz?')) deleteTransaction(tx.id); }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Yeni İşlem</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Gelir / Gider */}
              <div className="toggle-tabs">
                <button
                  id="tx-type-gelir"
                  className={`toggle-tab ${form.type === 'gelir' ? 'active' : ''}`}
                  style={form.type === 'gelir' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
                  onClick={() => handleTypeChange('gelir')}
                >
                  ↑ Gelir
                </button>
                <button
                  id="tx-type-gider"
                  className={`toggle-tab ${form.type === 'gider' ? 'active' : ''}`}
                  style={form.type === 'gider' ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)' } : {}}
                  onClick={() => handleTypeChange('gider')}
                >
                  ↓ Gider
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select id="tx-category" className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TransactionCategory }))}>
                    {currentCategories.map(cat => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ödeme Yöntemi</label>
                  <select id="tx-payment" className="form-select" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}>
                    <option value="nakit">Nakit</option>
                    <option value="kredi_karti">Kredi Kartı</option>
                    <option value="havale_eft">Havale / EFT</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Açıklama *</label>
                <input id="tx-description" className="form-input" placeholder="İşlem açıklaması" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Tutar (₺) *</label>
                  <input id="tx-amount" type="number" step="0.01" className="form-input" placeholder="0,00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tarih</label>
                  <input id="tx-date" type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cari (Opsiyonel)</label>
                <select id="tx-current" className="form-select" value={form.currentId} onChange={e => setForm(f => ({ ...f, currentId: e.target.value }))}>
                  <option value="">Cari seçme</option>
                  {state.currents.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type === 'musteri' ? 'Müşteri' : 'Tedarikçi'})</option>)}
                </select>
              </div>

              <div className="grid-2" style={{ marginTop: 4 }}>
                <button className="btn btn-ghost btn-full" onClick={() => setShowModal(false)}>İptal</button>
                <button id="save-transaction-btn" className="btn btn-primary btn-full" onClick={handleSave}>Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
