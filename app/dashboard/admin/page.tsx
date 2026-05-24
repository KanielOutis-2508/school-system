'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* eslint-disable @typescript-eslint/no-explicit-any */
const TABS = ['Overview', 'Teachers', 'Students', 'Classes'];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ teachers: 0, students: 0, classes: 0 });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats); })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>

      {/* Top navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>N</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Nazareth School</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Admin Dashboard</div>
          </div>
        </div>
        <button onClick={logout} style={{ fontSize: 13, color: '#6B7280', background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, padding: 4, marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: activeTab === tab ? '#1a56db' : 'transparent',
              color: activeTab === tab ? 'white' : '#6B7280',
              transition: 'all 0.2s',
            }}>{tab}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 24 }}>School Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Total Teachers', value: stats.teachers, color: '#1a56db', bg: '#EFF6FF' },
                { label: 'Total Students', value: stats.students, color: '#059669', bg: '#ECFDF5' },
                { label: 'Total Classes', value: stats.classes, color: '#D97706', bg: '#FFFBEB' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Add Teacher', tab: 'Teachers' },
                  { label: 'Add Student', tab: 'Students' },
                  { label: 'Create Class', tab: 'Classes' },
                ].map(a => (
                  <button key={a.label} onClick={() => setActiveTab(a.tab)} style={{
                    padding: '10px 20px', background: '#F3F4F6', border: 'none',
                    borderRadius: 8, fontSize: 13, fontWeight: 500,
                    color: '#374151', cursor: 'pointer',
                  }}>{a.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'Teachers' && <TeachersTab />}

        {/* Students Tab */}
        {activeTab === 'Students' && <StudentsTab />}

        {/* Classes Tab */}
        {activeTab === 'Classes' && <ClassesTab />}

      </div>
    </main>
  );
}

function TeachersTab() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({ full_name: '', email: '', class_id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/teachers').then(r => r.json()).then(d => { if (d.teachers) setTeachers(d.teachers); });
    fetch('/api/admin/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
  }, []);

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Teacher added! ID: ${data.unique_id}`);
      setTeachers(t => [...t, data.teacher]);
      setForm({ full_name: '', email: '', class_id: '', password: '' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Add teacher form */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Add New Teacher</h3>
        <form onSubmit={addTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'e.g. Mrs. Johnson' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'teacher@school.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Set a password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input required type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Assign Class</label>
            <select value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {msg && <p style={{ fontSize: 12, color: msg.includes('ID:') ? '#059669' : '#DC2626' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Adding...' : 'Add Teacher'}
          </button>
        </form>
      </div>

      {/* Teachers list */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>All Teachers ({teachers.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {teachers.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No teachers yet.</p>}
          {teachers.map(t => (
            <div key={t.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{t.full_name}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{t.unique_id}</div>
              </div>
              <span style={{ fontSize: 11, background: '#EFF6FF', color: '#1a56db', padding: '3px 8px', borderRadius: 4 }}>Teacher</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentsTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', class_id: '', password: '', parent_name: '', parent_phone: '', parent_email: '', dismissal_method: 'pickup' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(d => { if (d.students) setStudents(d.students); });
    fetch('/api/admin/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
  }, []);

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Student added! ID: ${data.unique_id}`);
      setStudents(s => [...s, data.student]);
      setForm({ full_name: '', date_of_birth: '', class_id: '', password: '', parent_name: '', parent_phone: '', parent_email: '', dismissal_method: 'pickup' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Add New Student</h3>
        <form onSubmit={addStudent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Student full name' },
            { label: 'Date of Birth', key: 'date_of_birth', type: 'date', placeholder: '' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Set a password' },
            { label: 'Parent/Guardian Name', key: 'parent_name', type: 'text', placeholder: 'Parent full name' },
            { label: 'Parent Phone', key: 'parent_phone', type: 'text', placeholder: '+234...' },
            { label: 'Parent Email (optional)', key: 'parent_email', type: 'email', placeholder: 'parent@email.com' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.key !== 'parent_email'}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Class</label>
            <select value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Dismissal</label>
            <select value={form.dismissal_method} onChange={e => setForm(p => ({ ...p, dismissal_method: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}>
              <option value="pickup">Picked up by parent</option>
              <option value="alone">Goes home alone</option>
            </select>
          </div>
          {msg && <p style={{ fontSize: 12, color: msg.includes('ID:') ? '#059669' : '#DC2626' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>All Students ({students.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {students.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No students yet.</p>}
          {students.map(s => (
            <div key={s.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.full_name}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{s.unique_id}</div>
              </div>
              <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: 4 }}>Student</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassesTab() {
  const [classes, setClasses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
  }, []);

  const addClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/classes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (res.ok) {
      setClasses(c => [...c, data.class]);
      setName('');
      setMsg('Class created!');
    } else { setMsg(data.error); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Create New Class</h3>
        <form onSubmit={addClass} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Class Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. JSS 1A"
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
          </div>
          {msg && <p style={{ fontSize: 12, color: '#059669' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>All Classes ({classes.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {classes.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No classes yet.</p>}
          {classes.map(c => (
            <div key={c.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}