import { useState, useRef } from 'react';
import { X, Upload, Check, User } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  custom_status: string | null;
}

interface ProfileSettingsModalProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'status' | 'custom_status'>>) => Promise<{ error: unknown }>;
}

const STATUS_OPTIONS = [
  { value: 'online', label: 'Çevrimiçi', color: 'bg-green-500' },
  { value: 'idle', label: 'Uzakta', color: 'bg-yellow-500' },
  { value: 'dnd', label: 'Rahatsız Etme', color: 'bg-red-500' },
  { value: 'offline', label: 'Görünmez', color: 'bg-dc-muted-fg' },
];

export default function ProfileSettingsModal({ profile, onClose, onUpdate }: ProfileSettingsModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [customStatus, setCustomStatus] = useState(profile.custom_status ?? '');
  const [status, setStatus] = useState(profile.status);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}/avatar.${ext}?v=${Date.now()}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(
        `${profile.id}/avatar.${ext}`,
        file,
        { upsert: true, contentType: file.type }
      );
      if (upErr) { setError('Yükleme başarısız: ' + upErr.message); return; }
      const { data } = supabase.storage.from('avatars').getPublicUrl(`${profile.id}/avatar.${ext}`);
      // Add cache-busting param
      const url = data.publicUrl + `?v=${Date.now()}`;
      setAvatarUrl(url);
      void path;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const { error: err } = await onUpdate({
      display_name: displayName.trim() || profile.display_name,
      avatar_url: avatarUrl,
      status,
      custom_status: customStatus.trim() || null,
    });
    setSaving(false);
    if (err) { setError('Kaydedilemedi'); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-dc-sidebar shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-base font-bold text-dc-text-primary">Profil Ayarları</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg hover:text-dc-text-primary hover:bg-white/10 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" crossOrigin="anonymous" className="h-20 w-20 rounded-full object-cover ring-2 ring-fox-500/30" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fox-500 to-fox-700 text-2xl font-bold text-white">
                  {profile.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-fox-500 shadow-lg hover:bg-fox-600 transition-all disabled:opacity-50"
              >
                {uploading ? <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" /> : <Upload className="h-3.5 w-3.5 text-white" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-dc-text-primary">{profile.display_name}</span>
              <span className="text-xs text-dc-muted-fg">@{profile.username}</span>
              <button onClick={() => fileRef.current?.click()} className="mt-1.5 text-xs text-fox-400 hover:text-fox-300 transition-colors">
                Fotoğraf değiştir
              </button>
            </div>
          </div>

          {/* Display name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg">Görünen Ad</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={32}
              className="rounded-xl bg-dc-surface px-3 py-2.5 text-sm text-dc-text-primary outline-none ring-1 ring-transparent focus:ring-fox-500/50 transition-all"
            />
          </div>

          {/* Custom status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg">Özel Durum</label>
            <div className="flex items-center gap-2 rounded-xl bg-dc-surface px-3 py-2.5 ring-1 ring-transparent focus-within:ring-fox-500/50 transition-all">
              <User className="h-3.5 w-3.5 flex-shrink-0 text-dc-muted-fg" />
              <input
                value={customStatus}
                onChange={e => setCustomStatus(e.target.value)}
                placeholder="Bir şey yazın..."
                maxLength={128}
                className="flex-1 bg-transparent text-sm text-dc-text-primary outline-none placeholder:text-dc-muted-fg/50"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg">Durum</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${status === opt.value ? 'bg-fox-500/20 text-fox-300 ring-1 ring-fox-500/40' : 'bg-dc-surface text-dc-text-secondary hover:bg-dc-channel-hover'}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${opt.color}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl border border-dc-surface bg-transparent py-2.5 text-sm font-semibold text-dc-text-secondary hover:bg-dc-channel-hover transition-all">
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-fox-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-fox-500/25 hover:bg-fox-600 disabled:opacity-70 transition-all"
            >
              {saved ? <><Check className="h-4 w-4" /> Kaydedildi</> : saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
