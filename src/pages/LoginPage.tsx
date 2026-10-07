import { useState } from 'react';
import { Lock, User, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { login, type User as AuthUser } from '../auth/users';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Kullanıcı adı ve şifre gereklidir.');
      return;
    }
    setLoading(true);
    setError('');

    // Küçük gecikme — daha gerçekçi hissi
    await new Promise(r => setTimeout(r, 600));

    const user = login(username, password);
    setLoading(false);

    if (user) {
      onLogin(user);
    } else {
      setError('Kullanıcı adı veya şifre hatalı.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-150px', right: '-150px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-150px', left: '-150px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        animation: shake ? 'shake 0.4s ease' : 'loginFadeIn 0.5s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            <TrendingUp size={36} color="white" />
          </div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #e2e8f0, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: 0, letterSpacing: '-0.03em',
          }}>FinansPro</h1>
          <p style={{ color: 'var(--color-text-dim)', fontSize: '0.875rem', marginTop: 4 }}>
            Muhasebe & Stok Takip
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Top shine */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
          }} />

          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, marginTop: 0 }}>
            Giriş Yap
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Kullanıcı Adı</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-text-dim)',
                }} />
                <input
                  id="login-username"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  placeholder="kullanıcı adınız"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Şifre</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 13, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--color-text-dim)',
                }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: 38, paddingRight: 44 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-dim)', padding: 4, display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '10px 14px',
                color: '#f87171', fontSize: '0.85rem', fontWeight: 500,
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Giriş yapılıyor...
                </span>
              ) : 'Giriş Yap'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: 20, marginBottom: 0,
            fontSize: '0.75rem', color: 'var(--color-text-dim)',
          }}>
            🔒 Bu cihazda bir kez giriş yapın — bir daha sormaz.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loginFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-5px); }
          80%       { transform: translateX(5px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
