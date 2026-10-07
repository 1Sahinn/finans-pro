import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMonthStats, getTotalCashBalance } from '../data/store';

const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
               'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function Dashboard() {
  const { state } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const gun = GUNLER[now.getDay()];
  const gun_no = now.getDate();
  const ay = AYLAR[now.getMonth()];
  const yil = now.getFullYear();
  const saat = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const monthStats = getMonthStats(state);
  const cashBalance = getTotalCashBalance(state);
  const fmt = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';

  return (
    <div className="page">
      {/* Ana saat ve tarih kartı */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1e35 0%, #12121f 100%)',
        border: '1px solid var(--color-border)',
        borderRadius: 24,
        padding: '32px 24px',
        textAlign: 'center',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Arka plan ışıltısı */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 200,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          {gun}
        </div>

        {/* Büyük saat */}
        <div style={{
          fontSize: 'clamp(3rem, 15vw, 5.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #e2e8f0 0%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 12,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {saat}
        </div>

        {/* Tarih */}
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '-0.01em' }}>
          {gun_no} {ay} {yil}
        </div>
      </div>

      {/* Kısa istatistikler */}
      <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
        <div className="card-stat">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <span style={{ fontSize: '1.3rem' }}>💰</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{fmt(cashBalance.total)}</div>
          <div className="stat-label">Toplam Kasa</div>
        </div>
        <div className="card-stat">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <span style={{ fontSize: '1.3rem' }}>📈</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.1rem', color: monthStats.net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {fmt(monthStats.net)}
          </div>
          <div className="stat-label">Bu Ay Net</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 12 }}>
        <div className="card-stat">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <span style={{ fontSize: '1.3rem' }}>⬆️</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.1rem', color: 'var(--color-success)' }}>{fmt(monthStats.income)}</div>
          <div className="stat-label">Bu Ay Gelir</div>
        </div>
        <div className="card-stat">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <span style={{ fontSize: '1.3rem' }}>⬇️</span>
          </div>
          <div className="stat-value" style={{ fontSize: '1.1rem', color: 'var(--color-danger)' }}>{fmt(monthStats.expense)}</div>
          <div className="stat-label">Bu Ay Gider</div>
        </div>
      </div>
    </div>
  );
}
