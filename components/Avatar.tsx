'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AvatarProps {
  userId: string;
  avatarUrl: string | null;
  name: string;
  color: string;
  size?: number;
  onUpdate?: (url: string | null) => void;
}

export default function Avatar({ userId, avatarUrl, name, color, size = 36, onUpdate }: AvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl;
      await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      });
      setPreview(url);
      if (onUpdate) onUpdate(url);
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  };

  const remove = async () => {
    if (!confirm('Remove profile picture?')) return;
    try {
      await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: null }),
      });
      setPreview(null);
      if (onUpdate) onUpdate(null);
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: preview ? 'transparent' : color,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', position: 'relative',
      }}>
        {preview ? (
          <img src={preview} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'white', fontWeight: 700, fontSize: size * 0.38 }}>{initials}</span>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 4,
          opacity: 0, transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
        >
          {/* Upload button */}
          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: size * 0.28 }}>
              {uploading ? '...' : '📷'}
            </span>
            <input type="file" accept="image/*" onChange={upload} style={{ display: 'none' }} />
          </label>

          {/* Remove button — only show if has photo */}
          {preview && (
            <span onClick={remove} style={{ color: '#FCA5A5', fontSize: size * 0.22, cursor: 'pointer' }}>✕</span>
          )}
        </div>
      </div>
    </div>
  );
}