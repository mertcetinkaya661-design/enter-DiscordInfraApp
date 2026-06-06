import { useState } from 'react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import FoxLogo from '../components/discord/FoxLogo';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: unknown }>;
  onSignUp: (email: string, password: string, username: string, displayName: string) => Promise<{ error: unknown }>;
}

// Translate common Supabase/network errors to Turkish
function translateError(err: unknown): string {
  const raw = (err as { message?: string })?.message ?? String(err);
  if (!raw || raw === 'undefined') return 'Bir hata oluştu, tekrar deneyin.';
  if (raw.includes('Failed to fetch') || raw.includes('NetworkError') || raw.includes('network'))
    return 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';
  if (raw.includes('Invalid login credentials') || raw.includes('invalid_credentials'))
    return 'Email veya şifre hatalı.';
  if (raw.includes('Email not confirmed'))
    return 'E-posta adresinizi doğrulayın.';
  if (raw.includes('User already registered') || raw.includes('already been registered') || raw.includes('already registered'))
    return 'Bu e-posta adresi zaten kayıtlı.';
  if (raw.includes('Database error') || raw.includes('database error'))
    return 'Sunucu hatası oluştu. Lütfen tekrar deneyin.';
  if (raw.includes('Password should be at least'))
    return 'Şifre en az 6 karakter olmalıdır.';
  if (raw.includes('Unable to validate email'))
    return 'Geçersiz e-posta adresi.';
  if (raw.includes('duplicate') && raw.includes('username'))
    return 'Bu kullanıcı adı zaten alınmış.';
  return raw;
}

export default function AuthPage({ onSignIn, onSignUp }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await onSignIn(email, password);
        if (err) setError(translateError(err));
      } else {
        if (!username.trim() || !displayName.trim()) {
          setError('Tüm alanları doldurun');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Şifre en az 6 karakter olmalıdır.');
          setLoading(false);
          return;
        }
        const { error: err } = await onSignUp(email, password, username.trim(), displayName.trim());
        if (err) setError(translateError(err));
      }
    } catch (e) {
      setError(translateError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-dc-surface">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fox-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dc-sidebar shadow-xl shadow-fox-500/20 ring-1 ring-fox-500/20">
            <FoxLogo size={40} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-widest text-fox-400">FIX</h1>
            <p className="text-sm text-dc-muted-fg">Tilki temalı sohbet platformu</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-dc-sidebar p-8 shadow-2xl ring-1 ring-white/5">
          <h2 className="mb-1 text-xl font-bold text-dc-text-primary">
            {mode === 'login' ? 'Tekrar hoş geldiniz!' : 'Hesap oluşturun'}
          </h2>
          <p className="mb-6 text-sm text-dc-muted-fg">
            {mode === 'login' ? 'Sizi özledik.' : 'FIX topluluğuna katılın.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dc-muted-fg">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                    placeholder="tilki_dev"
                    required
                    className="w-full rounded-xl bg-dc-surface px-4 py-3 text-sm text-dc-text-primary placeholder:text-dc-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-fox-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dc-muted-fg">
                    Görünen Ad
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Tilki Dev"
                    required
                    className="w-full rounded-xl bg-dc-surface px-4 py-3 text-sm text-dc-text-primary placeholder:text-dc-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-fox-500/50"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dc-muted-fg">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tilki@example.com"
                required
                className="w-full rounded-xl bg-dc-surface px-4 py-3 text-sm text-dc-text-primary placeholder:text-dc-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-fox-500/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dc-muted-fg">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-dc-surface px-4 py-3 pr-12 text-sm text-dc-text-primary placeholder:text-dc-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-fox-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dc-muted-fg hover:text-dc-text-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-dc-red/10 px-4 py-3 text-sm text-red-400 ring-1 ring-dc-red/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-fox-500 py-3 text-sm font-bold text-white shadow-lg shadow-fox-500/30 transition-all hover:bg-fox-600 hover:shadow-fox-600/40 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : mode === 'login' ? (
                <><LogIn className="h-4 w-4" /> Giriş Yap</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Kayıt Ol</>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-4 text-center text-sm text-dc-muted-fg">
            {mode === 'login' ? (
              <>Hesabın yok mu?{' '}
                <button onClick={() => { setMode('register'); setError(''); }} className="font-semibold text-fox-400 hover:underline">
                  Kayıt ol
                </button>
              </>
            ) : (
              <>Zaten hesabın var mı?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="font-semibold text-fox-400 hover:underline">
                  Giriş yap
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
