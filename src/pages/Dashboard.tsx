import { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  Package, Wallet, CreditCard, Banknote, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, paymentMethodLabels, categoryLabels } from '../utils/format';
import {
  getTodayStats, getMonthStats, getTotalCashBalance, getCriticalStockProducts
} from '../data/store';

export default function Dashboard() {
  const { state } = useApp();

  const monthStats = useMemo(() => getMonthStats(state), [state]);
  const todayStats = useMemo(() => getTodayStats(state), [state]);
  const balances = useMemo(() => getTotalCashBalance(state), [state]);
  const criticalProducts = useMemo(() => getCriticalStockProducts(state), [state]);
  const recentTx = useMemo(() => state.transactions.slice(0, 8), [state.transactions]);

  return (
    <div className="page">
      {/* KPI Cards */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card-stat">
          <div className="stat-icon bg-primary-soft">
            <Banknote size={22} className="text-primary" />
          </div>
          <div className="stat-value text-primary">{formatCurrency(balances.cash)}</div>
          <div className="stat-label">Nakit Kasa</div>
        </div>
        <div className="card-stat">
          <div className="stat-icon bg-accent-soft">
            <CreditCard size={22} className="text-accent" />
          </div>
          <div className="stat-value text-accent">{formatCurrency(balances.bank)}</div>
          <div className="stat-label">Banka / Kart</div>
        </div>
      </div>

      {/* Toplam Bakiye */}
      <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)', borderColor: 'rgba(99,102,241,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Toplam Bakiye</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#e2e8f0' }}>
              {formatCurrency(balances.total)}
            </div>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={26} className="text-primary" />
          </div>
        </div>
      </div>

      {/* Bu Ay */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card-stat">
          <div className="stat-icon bg-success-soft">
            <TrendingUp size={20} className="text-success" />
          </div>
          <div className="stat-value text-success">{formatCurrency(monthStats.income)}</div>
          <div className="stat-label">Bu Ay Gelir</div>
        </div>
        <div className="card-stat">
          <div className="stat-icon bg-danger-soft">
            <TrendingDown size={20} className="text-danger" />
          </div>
          <div className="stat-value text-danger">{formatCurrency(monthStats.expense)}</div>
          <div className="stat-label">Bu Ay Gider</div>
        </div>
      </div>

      {/* Net Kâr */}
      <div className="card" style={{ marginBottom: 16, background: monthStats.net >= 0 ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)', borderColor: monthStats.net >= 0 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Bu Ay Net Kâr / Zarar</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: monthStats.net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {monthStats.net >= 0 ? '+' : ''}{formatCurrency(monthStats.net)}
            </div>
          </div>
          {monthStats.net >= 0
            ? <ArrowUpRight size={32} className="text-success" style={{ opacity: 0.7 }} />
            : <ArrowDownRight size={32} className="text-danger" style={{ opacity: 0.7 }} />
          }
        </div>
      </div>

      {/* Bugün */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Bugün</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(16,185,129,0.08)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(todayStats.income)}</div>
            <div className="text-dim" style={{ fontSize: '0.7rem', marginTop: 2 }}>Gelir</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(239,68,68,0.08)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-danger)' }}>{formatCurrency(todayStats.expense)}</div>
            <div className="text-dim" style={{ fontSize: '0.7rem', marginTop: 2 }}>Gider</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(99,102,241,0.08)', borderRadius: 10 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: todayStats.net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {todayStats.net >= 0 ? '+' : ''}{formatCurrency(todayStats.net)}
            </div>
            <div className="text-dim" style={{ fontSize: '0.7rem', marginTop: 2 }}>Net</div>
          </div>
        </div>
      </div>

      {/* Kritik Stok Uyarıları */}
      {criticalProducts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 10, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} />
            KRİTİK STOK UYARILARI ({criticalProducts.length})
          </div>
          {criticalProducts.map(p => (
            <div key={p.id} className="alert-card alert-warning">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={18} className="text-warning" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 1 }}>
                  Stok: <span className="text-warning">{p.stock}</span> / Eşik: {p.criticalStock}
                </div>
              </div>
              <div style={{ padding: '3px 8px', background: p.stock === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, color: p.stock === 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                {p.stock === 0 ? 'TÜKENDİ' : 'DÜŞÜK'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Son İşlemler */}
      <div>
        <div className="section-title" style={{ marginBottom: 10 }}>SON İŞLEMLER</div>
        {recentTx.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={40} />
            <p>Henüz işlem yok</p>
          </div>
        ) : (
          recentTx.map(tx => (
            <div key={tx.id} className="list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: tx.type === 'gelir' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                    {tx.type === 'gelir'
                      ? <ArrowUpRight size={18} className="text-success" />
                      : <ArrowDownRight size={18} className="text-danger" />
                    }
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{categoryLabels[tx.category]}</span>
                      <span className="text-dim" style={{ fontSize: '0.7rem', alignSelf: 'center' }}>{paymentMethodLabels[tx.paymentMethod]}</span>
                      <span className="text-dim" style={{ fontSize: '0.7rem', alignSelf: 'center' }}>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: tx.type === 'gelir' ? 'var(--color-success)' : 'var(--color-danger)', flexShrink: 0, marginLeft: 8 }}>
                  {tx.type === 'gelir' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
