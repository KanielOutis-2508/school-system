/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';

const TABS = ['Overview', 'Teachers', 'Students', 'Classes', 'Fees'];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ teachers: 0, students: 0, classes: 0 });
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats); })
      .catch(() => {});
    fetch('/api/teacher/me')
      .then(r => r.json())
      .then(d => { if (d.teacher) setAdminUser(d.teacher); });
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            userId={adminUser?.id || 'admin'}
            avatarUrl={adminUser?.avatar_url || null}
            name={adminUser?.full_name || 'Admin'}
            color="#1a56db"
            size={36}
            onUpdate={url => setAdminUser((u: any) => ({ ...u, avatar_url: url }))}
          />
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

        {activeTab === 'Overview' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 24 }}>School Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Total Teachers', value: stats.teachers, color: '#1a56db' },
                { label: 'Total Students', value: stats.students, color: '#059669' },
                { label: 'Total Classes', value: stats.classes, color: '#D97706' },
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
                {[{ label: 'Add Teacher', tab: 'Teachers' }, { label: 'Add Student', tab: 'Students' }, { label: 'Create Class', tab: 'Classes' }].map(a => (
                  <button key={a.label} onClick={() => setActiveTab(a.tab)} style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>{a.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Teachers' && <TeachersTab />}
        {activeTab === 'Students' && <StudentsTab />}
        {activeTab === 'Classes' && <ClassesTab />}
        {activeTab === 'Fees' && <FeesTab />}
      </div>
    </main>
  );
}

function TeachersTab() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({ full_name: '', username: '', email: '', class_id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      setForm({ full_name: '', username: '', email: '', class_id: '', password: '' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Add New Teacher</h3>
        <form onSubmit={addTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'e.g. Mrs. Johnson' },
            { label: 'Username', key: 'username', type: 'text', placeholder: 'e.g. mrs.johnson' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'teacher@school.com' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input required={f.key !== 'email'} type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input required type={showPassword ? 'text' : 'password'} placeholder="Set a password"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Assign Class (optional)</label>
            <select value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))} style={inputStyle}>
              <option value="">No class (subject teacher)</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {msg && <p style={{ fontSize: 12, color: msg.includes('ID:') ? '#059669' : '#DC2626' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Adding...' : 'Add Teacher'}
          </button>
        </form>
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>All Teachers ({teachers.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {teachers.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No teachers yet.</p>}
          {teachers.map(t => (
            <div key={t.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{t.full_name}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>{t.unique_id} {t.username ? `· @${t.username}` : ''}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, background: '#EFF6FF', color: '#1a56db', padding: '3px 8px', borderRadius: 4 }}>Teacher</span>
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${t.full_name}?`)) return;
                    const res = await fetch('/api/admin/teachers', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: t.id }),
                    });
                    if (res.ok) setTeachers(prev => prev.filter(x => x.id !== t.id));
                  }}
                  style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
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
  const [form, setForm] = useState({
    full_name: '', username: '', date_of_birth: '', class_id: '', password: '',
    parent_name: '', parent_phone: '', parent_email: '', dismissal_method: 'pickup', school_level: 'junior'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      setForm({ full_name: '', username: '', date_of_birth: '', class_id: '', password: '', parent_name: '', parent_phone: '', parent_email: '', dismissal_method: 'pickup', school_level: 'junior' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Add New Student</h3>
        <form onSubmit={addStudent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Student full name' },
            { label: 'Username', key: 'username', type: 'text', placeholder: 'e.g. john.doe' },
            { label: 'Date of Birth', key: 'date_of_birth', type: 'date', placeholder: '' },
            { label: 'Parent/Guardian Name', key: 'parent_name', type: 'text', placeholder: 'Parent full name' },
            { label: 'Parent Phone', key: 'parent_phone', type: 'text', placeholder: '+234...' },
            { label: 'Parent Email (optional)', key: 'parent_email', type: 'email', placeholder: 'parent@email.com' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.key !== 'parent_email'}
                style={inputStyle} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input required type={showPassword ? 'text' : 'password'} placeholder="Set a password"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>School Level</label>
            <select value={form.school_level} onChange={e => setForm(p => ({ ...p, school_level: e.target.value }))} style={inputStyle}>
              <option value="junior">Junior Secondary (JSS)</option>
              <option value="senior">Senior Secondary (SSS)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Class</label>
            <select value={form.class_id} onChange={e => setForm(p => ({ ...p, class_id: e.target.value }))} style={inputStyle}>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Dismissal</label>
            <select value={form.dismissal_method} onChange={e => setForm(p => ({ ...p, dismissal_method: e.target.value }))} style={inputStyle}>
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
                <div style={{ fontSize: 11, color: '#6B7280' }}>{s.unique_id} {s.username ? `· @${s.username}` : ''}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: 4 }}>
                  {s.school_level === 'senior' ? 'SSS' : 'JSS'}
                </span>
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${s.full_name}?`)) return;
                    const res = await fetch('/api/admin/students', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: s.id }),
                    });
                    if (res.ok) setStudents(prev => prev.filter(x => x.id !== s.id));
                  }}
                  style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
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
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827' }} />
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

function FeesTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_id: '', term: 'first', academic_year: '2024/2025',
    amount_due: '', amount_paid: '', status: 'unpaid',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/students').then(r => r.json()).then(d => { if (d.students) setStudents(d.students); });
    fetch('/api/admin/fees').then(r => r.json()).then(d => { if (d.fees) setFees(d.fees); });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('Fees record saved!');
      setFees(f => [...f, data.fee]);
      setForm({ student_id: '', term: 'first', academic_year: '2024/2025', amount_due: '', amount_paid: '', status: 'unpaid' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827',
  };

  const statusColor = (s: string) => {
    if (s === 'paid') return { bg: '#ECFDF5', color: '#059669' };
    if (s === 'partial') return { bg: '#FFFBEB', color: '#D97706' };
    return { bg: '#FEF2F2', color: '#DC2626' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Set Student Fees</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Student</label>
            <select required value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} style={inputStyle}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name} — {s.unique_id}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Term</label>
            <select value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} style={inputStyle}>
              <option value="first">First Term</option>
              <option value="second">Second Term</option>
              <option value="third">Third Term</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Academic Year</label>
            <input type="text" value={form.academic_year} onChange={e => setForm(p => ({ ...p, academic_year: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Amount Due (₦)</label>
            <input required type="number" value={form.amount_due} onChange={e => setForm(p => ({ ...p, amount_due: e.target.value }))} placeholder="e.g. 50000" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Amount Paid (₦)</label>
            <input type="number" value={form.amount_paid} onChange={e => setForm(p => ({ ...p, amount_paid: e.target.value }))} placeholder="e.g. 25000" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={inputStyle}>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {msg && <p style={{ fontSize: 12, color: msg === 'Fees record saved!' ? '#059669' : '#DC2626' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save Fees Record'}
          </button>
        </form>
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Fees Records ({fees.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {fees.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No fees records yet.</p>}
          {fees.map(f => {
            const { bg, color } = statusColor(f.status);
            return (
              <div key={f.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {students.find(s => s.id === f.student_id)?.full_name || 'Student'}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: bg, color }}>
                    {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  {f.term} term · {f.academic_year} · ₦{Number(f.amount_paid).toLocaleString()} / ₦{Number(f.amount_due).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}