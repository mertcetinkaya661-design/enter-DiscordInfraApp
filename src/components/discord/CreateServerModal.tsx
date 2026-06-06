import { useState } from 'react';
import { X } from 'lucide-react';
import FoxLogo from './FoxLogo';

interface CreateServerModalProps {
  onClose: () => void;
  onCreate: (name: string, color: string) => Promise<void>;
  onJoin: (inviteCode: string) => Promise<void>;
}

const COLORS = ['#E8722A', '#C0522A', '#8B3A1A', '#D4611E', '#B35A14', '#5865F2', '#3BA55C', '#FAA61A'];

export default function CreateServerModal({ onClose, onCreate, onJoin }: CreateServerModalProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onCreate(name.trim(), color);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sunucu oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onJoin(inviteCode.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sunucuya katılınamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl bg-dc-sidebar p-8 shadow-2xl ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-dc-muted-fg hover:text-dc-text-primary">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex flex-col items-center gap-2">
          <FoxLogo size={40} />
          <h2 className="text-xl font-bold text-dc-text-primary">Sunucu</h2>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-xl bg-dc-surface p-1">
          {(['create', 'join'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                tab === t ? 'bg-fox-500 text-white shadow-md' : 'text-dc-muted-fg hover:text-dc-text-primary'
              }`}
            >
              {t === 'create' ? 'Sunucu Oluştur' : 'Sunucuya Katıl'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dc-muted-fg">Sunucu Adı</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="FIX Sunucusu"
                required
                className="w-full rounded-xl bg-dc-surface px-4 py-3 text-sm text-dc-text-primary placeholder:text-dc-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-fox-500/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dc-muted-fg">Renk</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dc-sidebar scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading || !name.trim()} className="rounded-xl bg-fox-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-fox-600 active:scale-[0.98] disabled:opacity-60">
              {loading ? 'Oluşturuluyor...' : 'Sunucu Oluştur'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-dc-muted-fg">Davet Kodu</label>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder="abc123def"
                required
                className="w-full rounded-xl bg-dc-surface px-4 py-3 text-sm text-dc-text-primary placeholder:text-dc-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-fox-500/50"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={loading || !inviteCode.trim()} className="rounded-xl bg-fox-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-fox-600 active:scale-[0.98] disabled:opacity-60">
              {loading ? 'Katılınıyor...' : 'Sunucuya Katıl'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
