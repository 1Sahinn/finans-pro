import { useState } from 'react';
import { LayoutDashboard, Package, Wallet, Users, ShoppingCart, LogOut } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import StockPage from './pages/StockPage';
import CashPage from './pages/CashPage';
import CurrentsPage from './pages/CurrentsPage';
import SalePage from './pages/SalePage';
import LoginPage from './pages/LoginPage';
import { getSession, logout, type User } from './auth/users';

type Page = 'dashboard' | 'stock' | 'cash' | 'currents' | 'sale';

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'stock',     label: 'Stok',    icon: Package },
  { id: 'sale',      label: 'Satış',   icon: ShoppingCart },
  { id: 'cash',      label: 'Kasa',    icon: Wallet },
  { id: 'currents',  label: 'Cariler', icon: Users },
  { id: 'dashboard', label: 'Özet',    icon: LayoutDashboard },
];


function AppShell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [page, setPage] = useState<Page>('stock');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'stock': return <StockPage />;
      case 'cash': return <CashPage />;
      case 'currents': return <CurrentsPage />;
      case 'sale': return <SalePage />;
    }
  };

  const pageTitle: Record<Page, string> = {
    dashboard: 'FinansPro',
    stock: 'Stok Yönetimi',
    cash: 'Kasa & Nakit Akışı',
    currents: 'Cari Takip',
    sale: 'Hızlı Satış',
  };

  return (
    <div className="app-wrapper">
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            }}>
              <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 800 }}>F</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                {pageTitle[page]}
              </div>
              {page === 'dashboard' && (
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-dim)', lineHeight: 1 }}>
                  Muhasebe & Stok Takip
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Kullanıcı adı */}
            <div style={{
              padding: '4px 10px', borderRadius: 100,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary-light)',
            }}>
              👤 {user.displayName}
            </div>
            {/* Çıkış butonu */}
            <button
              id="btn-logout"
              onClick={onLogout}
              title="Çıkış Yap"
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 100, padding: '5px 8px', cursor: 'pointer',
                color: '#f87171', display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.65rem', fontWeight: 700,
              }}
            >
              <LogOut size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderPage()}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = page === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.id === 'sale' ? (
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: isActive
                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}>
                  <Icon size={22} color="white" />
                </div>
              ) : (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="nav-label">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => getSession());

  const handleLogin = (u: User) => setUser(u);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppProvider>
      <AppShell user={user} onLogout={handleLogout} />
    </AppProvider>
  );
}

