'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ unique_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.role === 'admin') router.push('/dashboard/admin');
      else if (data.role === 'teacher') router.push('/dashboard/teacher');
      else if (data.role === 'student') router.push('/dashboard/student');

    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: '#F8F9FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: '#1a56db', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>SMS</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
           School Management System
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            School Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Unique ID or Username
            </label>
            <input
              required
              type="text"
              value={form.unique_id}
              onChange={e => setForm(f => ({ ...f, unique_id: e.target.value }))}
              placeholder="ID or username"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #E5E7EB', borderRadius: 8,
                fontSize: 14, color: '#111827', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#1a56db')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter your password"
                style={{
                  width: '100%', padding: '10px 44px 10px 14px',
                  border: '1.5px solid #E5E7EB', borderRadius: 8,
                  fontSize: 14, color: '#111827', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#1a56db')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#6B7280', padding: 0,
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#DC2626',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#93C5FD' : '#1a56db',
              color: 'white', border: 'none', borderRadius: 8,
              padding: '12px', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 24 }}>
          Contact your administrator if you need access.
        </p>
      </div>
    </main>
  );
}