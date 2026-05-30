'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['Overview', 'Students', 'Results', 'Behaviour', 'Assignments', 'Attendance'];

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    fetch('/api/teacher/me')
      .then(r => r.json())
      .then(d => { if (d.teacher) setTeacher(d.teacher); })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>N</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
              {teacher ? teacher.full_name : 'Teacher'}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              Teacher · {teacher?.unique_id}
            </div>
          </div>
        </div>
        <button onClick={logout} style={{ fontSize: 13, color: '#6B7280', background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, padding: 4, marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
              background: activeTab === tab ? '#059669' : 'transparent',
              color: activeTab === tab ? 'white' : '#6B7280',
              transition: 'all 0.2s',
            }}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Overview' && <TeacherOverview teacher={teacher} />}
        {activeTab === 'Students' && <ClassStudents teacher={teacher} />}
        {activeTab === 'Results' && <EnterResults teacher={teacher} />}
        {activeTab === 'Behaviour' && <EnterBehaviour teacher={teacher} />}
        {activeTab === 'Assignments' && <ManageAssignments teacher={teacher} />}
        {activeTab === 'Attendance' && <TakeAttendance teacher={teacher} />}
      </div>
    </main>
  );
}

function TeacherOverview({ teacher }: { teacher: any }) {
  const [stats, setStats] = useState({ students: 0, assignments: 0 });

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/stats')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats); });
  }, [teacher]);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 24 }}>
        Welcome, {teacher?.full_name}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {[
          { label: 'Students in Class', value: stats.students, color: '#059669', bg: '#ECFDF5' },
          { label: 'Assignments Created', value: stats.assignments, color: '#1a56db', bg: '#EFF6FF' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassStudents({ teacher }: { teacher: any }) {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/students')
      .then(r => r.json())
      .then(d => { if (d.students) setStudents(d.students); });
  }, [teacher]);

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>
        My Class Students ({students.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {students.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No students in your class yet.</p>}
        {students.map(s => (
          <div key={s.id} style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.full_name}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{s.unique_id}</div>
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              {s.student_profiles?.[0]?.parent_phone || '—'}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', textAlign: 'right' }}>
              {s.student_profiles?.[0]?.dismissal_method === 'alone' ? '🚶 Goes home alone' : '🚗 Parent pickup'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnterResults({ teacher }: { teacher: any }) {
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_id: '', subject_id: '', term: 'first',
    exam_score: '', test_score: '', midterm_score: '',
    classwork_score: '', assignment_score: '', note_score: '',
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/students').then(r => r.json()).then(d => { if (d.students) setStudents(d.students); });
    fetch('/api/teacher/subjects').then(r => r.json()).then(d => { if (d.subjects) setSubjects(d.subjects); });
  }, [teacher]);

  // Auto calculate total
 const total = useMemo(() => {
  return (
    Number(form.exam_score || 0) +
    Number(form.test_score || 0) +
    Number(form.midterm_score || 0) +
    Number(form.classwork_score || 0) +
    Number(form.assignment_score || 0) +
    Number(form.note_score || 0)
  );
}, [form]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/teacher/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Result saved! Total: ${data.total}/100 — Grade: ${data.grade}`);
    } else {
      setMsg(data.error);
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px',
    border: '1.5px solid #E5E7EB', borderRadius: 7,
    fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#111827',
  };

  const scoreFields = [
    { label: 'Exam Score', key: 'exam_score', max: 40 },
    { label: 'Test Score', key: 'test_score', max: 20 },
    { label: 'Mid Term Project', key: 'midterm_score', max: 10 },
    { label: 'Classwork Score', key: 'classwork_score', max: 10 },
    { label: 'Assignment Score', key: 'assignment_score', max: 10 },
    { label: 'Note Score', key: 'note_score', max: 10 },
  ];

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: 560 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Enter Student Result</h3>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Student */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Student</label>
          <select required value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} style={inputStyle}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject</label>
          <select required value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))} style={inputStyle}>
            <option value="">Select subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Term */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Term</label>
          <select value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} style={inputStyle}>
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>

        {/* Score fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {scoreFields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                {f.label} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(max {f.max})</span>
              </label>
              <input
                type="number" min="0" max={f.max}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder="0"
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Live total */}
        <div style={{
          background: total >= 70 ? '#ECFDF5' : total >= 50 ? '#EFF6FF' : total >= 40 ? '#FFFBEB' : '#FEF2F2',
          borderRadius: 8, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Total Score</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: total >= 70 ? '#059669' : total >= 50 ? '#1a56db' : total >= 40 ? '#D97706' : '#DC2626' }}>
            {total} / 100
          </span>
        </div>

        {msg && <p style={{ fontSize: 12, color: msg.includes('saved') ? '#059669' : '#DC2626' }}>{msg}</p>}

        <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Result'}
        </button>
      </form>
    </div>
  );
}

function EnterBehaviour({ teacher }: { teacher: any }) {
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({ student_id: '', term: 'first', rating: 'Good', comment: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/students').then(r => r.json()).then(d => { if (d.students) setStudents(d.students); });
  }, [teacher]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/teacher/behaviour', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(res.ok ? 'Behaviour saved!' : data.error);
    setLoading(false);
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: 500 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Grade Student Behaviour</h3>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Student</label>
          <select required value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none' }}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Term</label>
          <select value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none' }}>
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Behaviour Rating</label>
          <select value={form.rating} onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none' }}>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Comment (optional)</label>
          <textarea rows={3} value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
            placeholder="Add a comment about the student's behaviour..."
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'none' }} />
        </div>
        {msg && <p style={{ fontSize: 12, color: msg === 'Behaviour saved!' ? '#059669' : '#DC2626' }}>{msg}</p>}
        <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Behaviour'}
        </button>
      </form>
    </div>
  );
}

function ManageAssignments({ teacher }: { teacher: any }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', subject_id: '', due_date: '', term: 'first' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/assignments').then(r => r.json()).then(d => { if (d.assignments) setAssignments(d.assignments); });
    fetch('/api/teacher/subjects').then(r => r.json()).then(d => { if (d.subjects) setSubjects(d.subjects); });
    fetch('/api/teacher/students').then(r => r.json()).then(d => { if (d.students) setStudents(d.students); });
  }, [teacher]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/teacher/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, student_ids: students.map(s => s.id) }) });
    const data = await res.json();
    if (res.ok) {
      setMsg('Assignment created!');
      setAssignments(a => [...a, data.assignment]);
      setForm({ title: '', subject_id: '', due_date: '', term: 'first' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Create Assignment</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Title</label>
            <input required type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Assignment title"
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject</label>
            <select required value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none' }}>
              <option value="">Select subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Term</label>
            <select value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none' }}>
              <option value="first">First Term</option>
              <option value="second">Second Term</option>
              <option value="third">Third Term</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Due Date</label>
            <input required type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {msg && <p style={{ fontSize: 12, color: msg === 'Assignment created!' ? '#059669' : '#DC2626' }}>{msg}</p>}
          <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Assignments ({assignments.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assignments.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No assignments yet.</p>}
          {assignments.map(a => (
            <div key={a.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.title}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Due: {a.due_date} · {a.term} term</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TakeAttendance({ teacher }: { teacher: any }) {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/students').then(r => r.json()).then(d => {
      if (d.students) {
        setStudents(d.students);
        const init: Record<string, string> = {};
        d.students.forEach((s: any) => { init[s.id] = 'present'; });
        setAttendance(init);
      }
    });
  }, [teacher]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const records = Object.entries(attendance).map(([student_id, status]) => ({ student_id, status, date }));
    const res = await fetch('/api/teacher/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ records }) });
    setMsg(res.ok ? 'Attendance saved!' : 'Error saving attendance');
    setLoading(false);
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Take Attendance</h3>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {students.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No students in your class.</p>}
          {students.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{s.full_name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['present', 'absent', 'late'].map(status => (
                  <button key={status} type="button"
                    onClick={() => setAttendance(a => ({ ...a, [s.id]: status }))}
                    style={{
                      padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      background: attendance[s.id] === status
                        ? status === 'present' ? '#059669' : status === 'absent' ? '#DC2626' : '#D97706'
                        : '#E5E7EB',
                      color: attendance[s.id] === status ? 'white' : '#6B7280',
                    }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {msg && <p style={{ fontSize: 12, color: msg === 'Attendance saved!' ? '#059669' : '#DC2626', marginBottom: 12 }}>{msg}</p>}
        <button type="submit" disabled={loading || students.length === 0}
          style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Save Attendance'}
        </button>
      </form>
    </div>
  );
}