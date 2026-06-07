/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';

const TABS = ['Overview', 'Teachers', 'Students', 'Classes', 'Subjects', 'Fees', 'Broadcast', 'Promotion', 'Class Overview'];

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
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>School Management System</div>
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
        {activeTab === 'Broadcast' && <BroadcastTab />}
        {activeTab === 'Subjects' && <SubjectsTab />}
        {activeTab === 'Promotion' && <PromotionTab />}
        {activeTab === 'Class Overview' && <ClassOverviewTab />}
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
function BroadcastTab() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/broadcast')
      .then(r => r.json())
      .then(d => { if (d.broadcasts) setBroadcasts(d.broadcasts); });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('Message sent!');
      setBroadcasts(b => [data.broadcast, ...b]);
      setForm({ title: '', message: '' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const deleteBroadcast = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await fetch('/api/admin/broadcast', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setBroadcasts(b => b.filter(x => x.id !== id));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Send Broadcast Message</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Title</label>
            <input required type="text" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Staff Meeting Tomorrow"
              style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Message</label>
            <textarea required rows={5} value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="Type your message to all teachers..."
              style={{ ...inputStyle, resize: 'none' }} />
          </div>
          {msg && <p style={{ fontSize: 12, color: msg === 'Message sent!' ? '#059669' : '#DC2626' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Sending...' : '📢 Send to All Teachers'}
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Sent Messages ({broadcasts.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {broadcasts.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No messages sent yet.</p>}
          {broadcasts.map(b => (
            <div key={b.id} style={{ padding: '14px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{b.title}</div>
                <button onClick={() => deleteBroadcast(b.id)}
                  style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
                  Delete
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{b.message}</p>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 8 }}>
                {new Date(b.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function SubjectsTab() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', teacher_id: '' });
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/subjects').then(r => r.json()).then(d => { if (d.subjects) setSubjects(d.subjects); });
    fetch('/api/admin/teachers').then(r => r.json()).then(d => { if (d.teachers) setTeachers(d.teachers); });
    fetch('/api/admin/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
  }, []);

  const toggleClass = (id: string) => {
    setSelectedClasses(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, class_ids: selectedClasses }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Subject created for ${selectedClasses.length || 'all'} class(es)!`);
      setSubjects(s => [...s, ...(data.subjects || [])]);
      setForm({ name: '', teacher_id: '' });
      setSelectedClasses([]);
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    await fetch('/api/admin/subjects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSubjects(s => s.filter(x => x.id !== id));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827',
  };

  // Group subjects by name and teacher
  const grouped = subjects.reduce((acc: any, s) => {
    const key = `${s.name}__${s.teacher_id}`;
    if (!acc[key]) acc[key] = { ...s, class_ids: [] };
    if (s.class_id) acc[key].class_ids.push(s.class_id);
    return acc;
  }, {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Create Subject</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject Name</label>
            <input required type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Mathematics"
              style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Assign Teacher</label>
            <select value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))} style={inputStyle}>
              <option value="">Select teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
              Assign Classes <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({selectedClasses.length} selected)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {classes.map(c => (
                <button key={c.id} type="button" onClick={() => toggleClass(c.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    borderColor: selectedClasses.includes(c.id) ? '#1a56db' : '#E5E7EB',
                    background: selectedClasses.includes(c.id) ? '#EFF6FF' : 'white',
                    color: selectedClasses.includes(c.id) ? '#1a56db' : '#6B7280',
                  }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          {msg && <p style={{ fontSize: 12, color: msg.includes('created') ? '#059669' : '#DC2626' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create Subject'}
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>All Subjects ({Object.keys(grouped).length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.keys(grouped).length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No subjects yet.</p>}
          {Object.values(grouped).map((s: any) => (
            <div key={s.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.name}</div>
                <button onClick={() => {
                  // Delete all entries for this subject+teacher combo
                  subjects.filter(x => x.name === s.name && x.teacher_id === s.teacher_id)
                    .forEach(x => deleteSubject(x.id));
                }}
                  style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                {teachers.find(t => t.id === s.teacher_id)?.full_name || 'No teacher'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {s.class_ids.map((cid: string) => (
                  <span key={cid} style={{ fontSize: 10, background: '#EFF6FF', color: '#1a56db', padding: '2px 8px', borderRadius: 20 }}>
                    {classes.find(c => c.id === cid)?.name || cid}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function PromotionTab() {
  const [classes, setClasses] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<Record<string, { status: string; to_class_id: string }>>({});
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/promote').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
    fetch('/api/admin/classes').then(r => r.json()).then(d => { if (d.classes) setAllClasses(d.classes); });
  }, []);

  const setDecision = (studentId: string, field: string, value: string) => {
    setDecisions(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const submit = async () => {
    setLoading(true);
    const promotions = Object.entries(decisions).map(([student_id, d]) => ({
      student_id,
      from_class_id: classes.find(c => c.users?.find((u: any) => u.id === student_id))?.id,
      to_class_id: d.to_class_id || null,
      status: d.status || 'promoted',
    }));

    const res = await fetch('/api/admin/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promotions, academic_year: academicYear }),
    });

    if (res.ok) {
      setMsg('Promotions applied successfully!');
      // Refresh classes
      fetch('/api/admin/promote').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
    } else {
      setMsg('Error applying promotions');
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', border: '1px solid #E5E7EB',
    borderRadius: 6, fontSize: 12, outline: 'none', color: '#111827',
  };

  return (
    <div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>End of Session Promotion</h3>
            <p style={{ fontSize: 12, color: '#6B7280' }}>Set promotion status for each student. Promoted students will move to their new class.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Academic Year</label>
              <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ ...inputStyle, width: 120 }} />
            </div>
            <button onClick={submit} disabled={loading || Object.keys(decisions).length === 0}
              style={{ background: '#1a56db', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 20 }}>
              {loading ? 'Applying...' : 'Apply Promotions'}
            </button>
          </div>
        </div>
        {msg && <p style={{ fontSize: 12, color: msg.includes('successfully') ? '#059669' : '#DC2626', marginTop: 12 }}>{msg}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {classes.map(cls => (
          cls.users?.filter((u: any) => u.id).length > 0 ? (
            <div key={cls.id} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
                {cls.name} <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>({cls.users?.length} students)</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cls.users?.map((student: any) => (
                  <div key={student.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{student.full_name}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{student.unique_id}</div>
                    </div>
                    <select
                      value={decisions[student.id]?.status || ''}
                      onChange={e => setDecision(student.id, 'status', e.target.value)}
                      style={inputStyle}>
                      <option value="">Select action</option>
                      <option value="promoted">Promote</option>
                      <option value="repeated">Repeat Class</option>
                      <option value="graduated">Graduate (SS3)</option>
                    </select>
                    {decisions[student.id]?.status === 'promoted' && (
                      <select
                        value={decisions[student.id]?.to_class_id || ''}
                        onChange={e => setDecision(student.id, 'to_class_id', e.target.value)}
                        style={inputStyle}>
                        <option value="">Move to class...</option>
                        {allClasses.filter(c => c.id !== cls.id).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                    {decisions[student.id]?.status === 'graduated' && (
                      <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>🎓 Will graduate</span>
                    )}
                    {decisions[student.id]?.status === 'repeated' && (
                      <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600 }}>🔄 Will repeat</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}function ClassOverviewTab() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('Results');
  const [term, setTerm] = useState('first');

  useEffect(() => {
    fetch('/api/admin/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
  }, []);

 useEffect(() => {
  const fetchStudents = async () => {
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudent(null);
      setStudentData(null);
      return;
    }
    const res = await fetch(`/api/admin/class-overview?class_id=${selectedClass}`);
    const d = await res.json();
    if (d.students) setStudents(d.students);
  };
  fetchStudents();
}, [selectedClass]);

  const selectStudent = async (student: any) => {
    setSelectedStudent(student);
    const res = await fetch(`/api/admin/class-overview?class_id=${selectedClass}&student_id=${student.id}`);
    const d = await res.json();
    if (d.studentData) setStudentData(d.studentData);
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.unique_id.toLowerCase().includes(search.toLowerCase())
  );

  const gradeColor = (grade: string) => {
    if (grade?.startsWith('A')) return '#059669';
    if (grade?.startsWith('B')) return '#1a56db';
    if (grade?.startsWith('C')) return '#D97706';
    return '#DC2626';
  };

  const statusColor = (s: string) => {
    if (s === 'present') return { bg: '#ECFDF5', color: '#059669' };
    if (s === 'absent') return { bg: '#FEF2F2', color: '#DC2626' };
    return { bg: '#FFFBEB', color: '#D97706' };
  };

  const SECTIONS = ['Results', 'Behaviour', 'Attendance', 'Fees', 'Assignments', 'Profile'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
      {/* Left panel — class and student picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Select Class</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent(null); setSearch(''); }}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none', color: '#111827' }}>
            <option value="">Pick a class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {students.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: 12 }}>
              <input type="text" placeholder="Search student..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none', color: '#111827', boxSizing: 'border-box' }} />
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 8 }}>{filteredStudents.length} students</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {filteredStudents.map(s => (
                <div key={s.id} onClick={() => selectStudent(s)}
                  style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    background: selectedStudent?.id === s.id ? '#EFF6FF' : '#F9FAFB',
                    border: selectedStudent?.id === s.id ? '1.5px solid #1a56db' : '1.5px solid transparent',
                  }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{s.full_name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{s.unique_id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel — student data */}
      {!selectedStudent ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
            Select a class and student to view their full profile
          </p>
        </div>
      ) : (
        <div>
          {/* Student header */}
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{selectedStudent.full_name}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{selectedStudent.unique_id} · {classes.find(c => c.id === selectedClass)?.name}</div>
            </div>
            <span style={{ fontSize: 12, background: selectedStudent.school_level === 'senior' ? '#EFF6FF' : '#ECFDF5', color: selectedStudent.school_level === 'senior' ? '#1a56db' : '#059669', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
              {selectedStudent.school_level === 'senior' ? 'SSS' : 'JSS'}
            </span>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, padding: 4, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setActiveSection(s)} style={{
                padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                background: activeSection === s ? '#1a56db' : 'transparent',
                color: activeSection === s ? 'white' : '#6B7280',
              }}>{s}</button>
            ))}
          </div>

          {/* Results */}
          {activeSection === 'Results' && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Results</h3>
                <select value={term} onChange={e => setTerm(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, color: '#111827', outline: 'none' }}>
                  <option value="first">First Term</option>
                  <option value="second">Second Term</option>
                  <option value="third">Third Term</option>
                </select>
              </div>
              {studentData?.results?.filter((r: any) => r.term === term).length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>No results for this term.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {studentData?.results?.filter((r: any) => r.term === term).map((r: any) => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{r.subjects?.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: gradeColor(r.grade) }}>{r.grade}</span>
                        <span style={{ fontSize: 13, color: '#6B7280' }}>{r.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Behaviour */}
          {activeSection === 'Behaviour' && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Behaviour</h3>
              {studentData?.behaviour?.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>No behaviour records.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {studentData?.behaviour?.map((b: any) => (
                    <div key={b.id} style={{ padding: '14px', background: '#F9FAFB', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.term} Term</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: b.rating === 'Excellent' ? '#059669' : b.rating === 'Good' ? '#1a56db' : b.rating === 'Fair' ? '#D97706' : '#DC2626' }}>{b.rating}</span>
                      </div>
                      {b.comment && <p style={{ fontSize: 13, color: '#374151' }}>{b.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attendance */}
          {activeSection === 'Attendance' && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Attendance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {['present', 'absent', 'late'].map(status => {
                  const count = studentData?.attendance?.filter((a: any) => a.status === status).length ?? 0;
                  const { bg, color } = statusColor(status);
                  return (
                    <div key={status} style={{ textAlign: 'center', padding: '12px', background: bg, borderRadius: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color }}>{count}</div>
                      <div style={{ fontSize: 11, color, textTransform: 'capitalize' }}>{status}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {studentData?.attendance?.map((a: any) => {
                  const { bg, color } = statusColor(a.status);
                  return (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#F9FAFB', borderRadius: 6 }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{a.date}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: bg, color }}>{a.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fees */}
          {activeSection === 'Fees' && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Fees</h3>
              {studentData?.fees?.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>No fees records.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {studentData?.fees?.map((f: any) => {
                    const balance = Number(f.amount_due) - Number(f.amount_paid);
                    const isPaid = f.status === 'paid';
                    return (
                      <div key={f.id} style={{ padding: '14px', background: '#F9FAFB', borderRadius: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.term} Term · {f.academic_year}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isPaid ? '#ECFDF5' : '#FEF2F2', color: isPaid ? '#059669' : '#DC2626' }}>
                            {f.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6B7280' }}>
                          <span>Due: ₦{Number(f.amount_due).toLocaleString()}</span>
                          <span>Paid: ₦{Number(f.amount_paid).toLocaleString()}</span>
                          <span style={{ color: balance > 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>Balance: ₦{balance.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Assignments */}
          {activeSection === 'Assignments' && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Assignments</h3>
              {studentData?.assignments?.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>No assignments.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {studentData?.assignments?.map((a: any) => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{a.assignments?.title}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{a.assignments?.subjects?.name} · Due: {a.assignments?.due_date}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: a.submitted ? '#ECFDF5' : '#FEF3C7', color: a.submitted ? '#059669' : '#D97706' }}>
                        {a.submitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeSection === 'Profile' && selectedStudent?.student_profiles?.[0] && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Full Name', value: selectedStudent.full_name },
                  { label: 'Student ID', value: selectedStudent.unique_id },
                  { label: 'Username', value: selectedStudent.username || '—' },
                  { label: 'Date of Birth', value: selectedStudent.student_profiles[0].date_of_birth || '—' },
                  { label: 'Parent/Guardian', value: selectedStudent.student_profiles[0].parent_name || '—' },
                  { label: 'Parent Phone', value: selectedStudent.student_profiles[0].parent_phone },
                  { label: 'Parent Email', value: selectedStudent.student_profiles[0].parent_email || '—' },
                  { label: 'Dismissal', value: selectedStudent.student_profiles[0].dismissal_method === 'alone' ? 'Goes home alone' : 'Parent pickup' },
                ].map(f => (
                  <div key={f.label} style={{ padding: '12px', background: '#F9FAFB', borderRadius: 8 }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}