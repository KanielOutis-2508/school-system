'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import Avatar from '@/components/Avatar';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['Overview', 'Students', 'Add Student', 'Results', 'Behaviour', 'Assignments', 'Attendance', 'Timetable'];

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
         <Avatar
          userId={teacher?.id || 'teacher'}
          avatarUrl={teacher?.avatar_url || null}
          name={teacher?.full_name || 'Teacher'}
          color="#059669"
          size={36}
          onUpdate={url => setTeacher((t: any) => ({ ...t, avatar_url: url }))}
/>
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
        {activeTab === 'Add Student' && <AddStudentTab teacher={teacher} />}
        {activeTab === 'Timetable' && <TimetableTab teacher={teacher} />}
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
          <div key={s.id} style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'center' }}>
         <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.full_name}</div>
           <div style={{ fontSize: 11, color: '#6B7280' }}>{s.unique_id}</div>
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
       {s.student_profiles?.[0]?.parent_phone || '—'}
          </div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>
      {s.student_profiles?.[0]?.dismissal_method === 'alone' ? '🚶 Goes home alone' : '🚗 Parent pickup'}
    </div>
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
            style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>
           Remove
          </button>
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
function AddStudentTab({ teacher }: { teacher: any }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [form, setForm] = useState({
    full_name: '', username: '', date_of_birth: '', class_id: '',
    password: '', parent_name: '', parent_phone: '',
    parent_email: '', dismissal_method: 'pickup',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch('/api/admin/classes').then(r => r.json()).then(d => {
      if (d.classes) {
        setClasses(d.classes);
        // Pre-select teacher's class
        if (teacher?.class_id) setForm(f => ({ ...f, class_id: teacher.class_id }));
      }
    });
  }, [teacher]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Student added! ID: ${data.unique_id}`);
      setForm({
        full_name: '', username: '', date_of_birth: '', class_id: teacher?.class_id || '',
        password: '', parent_name: '', parent_phone: '',
        parent_email: '', dismissal_method: 'pickup',
      });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827',
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: 560 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Add New Student</h3>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

        {/* Password with toggle */}
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
        <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Adding...' : 'Add Student'}
        </button>
      </form>
    </div>
  );
}
function TimetableTab({ teacher }: { teacher: any }) {
  const [classTimetable, setClassTimetable] = useState<any[]>([]);
  const [teacherTimetable, setTeacherTimetable] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'class' | 'personal'>('class');
  const [classForm, setClassForm] = useState({ day: 'Monday', period: '1', subject: '', teacher_name: '', start_time: '', end_time: '' });
  const [personalForm, setPersonalForm] = useState({ day: 'Monday', class_name: '', subject: '', start_time: '', end_time: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/timetable')
      .then(r => r.json())
      .then(d => {
        if (d.classTimetable) setClassTimetable(d.classTimetable);
        if (d.teacherTimetable) setTeacherTimetable(d.teacherTimetable);
      });
  }, [teacher]);

  const submitClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/teacher/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'class', ...classForm, period: Number(classForm.period) }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('Class timetable updated!');
      setClassTimetable(prev => {
        const exists = prev.findIndex(t => t.day === classForm.day && t.period === Number(classForm.period));
        if (exists >= 0) { const updated = [...prev]; updated[exists] = data.entry; return updated; }
        return [...prev, data.entry];
      });
      setClassForm({ day: 'Monday', period: '1', subject: '', teacher_name: '', start_time: '', end_time: '' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const submitPersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/teacher/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'personal', ...personalForm }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('Personal timetable updated!');
      setTeacherTimetable(prev => [...prev, data.entry]);
      setPersonalForm({ day: 'Monday', class_name: '', subject: '', start_time: '', end_time: '' });
    } else { setMsg(data.error); }
    setLoading(false);
  };

  const deleteEntry = async (id: string, type: string) => {
    const res = await fetch('/api/teacher/timetable', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type }),
    });
    if (res.ok) {
      if (type === 'class') setClassTimetable(prev => prev.filter(t => t.id !== id));
      else setTeacherTimetable(prev => prev.filter(t => t.id !== id));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827',
  };

  const groupByDay = (entries: any[]) => {
    return DAYS.reduce((acc, day) => {
      acc[day] = entries.filter(e => e.day === day).sort((a, b) => (a.period || a.start_time) - (b.period || b.start_time));
      return acc;
    }, {} as Record<string, any[]>);
  };

  return (
    <div>
      {/* Section toggle */}
      <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, padding: 4, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content' }}>
        {[{ key: 'class', label: 'Class Timetable' }, { key: 'personal', label: 'My Schedule' }].map(s => (
          <button key={s.key} onClick={() => { setActiveSection(s.key as any); setMsg(''); }} style={{
            padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
            background: activeSection === s.key ? '#059669' : 'transparent',
            color: activeSection === s.key ? 'white' : '#6B7280',
          }}>{s.label}</button>
        ))}
      </div>

      {activeSection === 'class' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
          {/* Add class period */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Add Class Period</h3>
            <form onSubmit={submitClass} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Day</label>
                <select value={classForm.day} onChange={e => setClassForm(p => ({ ...p, day: e.target.value }))} style={inputStyle}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Period</label>
                <select value={classForm.period} onChange={e => setClassForm(p => ({ ...p, period: e.target.value }))} style={inputStyle}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Period {n}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject</label>
                <input required type="text" value={classForm.subject} onChange={e => setClassForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Teacher Name</label>
                <input type="text" value={classForm.teacher_name} onChange={e => setClassForm(p => ({ ...p, teacher_name: e.target.value }))} placeholder="e.g. Mr. Smith" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Start Time</label>
                  <input required type="time" value={classForm.start_time} onChange={e => setClassForm(p => ({ ...p, start_time: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>End Time</label>
                  <input required type="time" value={classForm.end_time} onChange={e => setClassForm(p => ({ ...p, end_time: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              {msg && <p style={{ fontSize: 12, color: msg.includes('updated') ? '#059669' : '#DC2626' }}>{msg}</p>}
              <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Save Period'}
              </button>
            </form>
          </div>

          {/* Class timetable view */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Class Timetable</h3>
            {classTimetable.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>No periods added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(groupByDay(classTimetable)).map(([day, periods]) => periods.length === 0 ? null : (
                  <div key={day}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{day}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {periods.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                          <div>
                            <span style={{ fontSize: 11, color: '#9CA3AF', marginRight: 8 }}>P{p.period}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{p.subject}</span>
                            {p.teacher_name && <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 8 }}>· {p.teacher_name}</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#6B7280' }}>{p.start_time} – {p.end_time}</span>
                            <button onClick={() => deleteEntry(p.id, 'class')} style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'personal' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
          {/* Add personal entry */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Add to My Schedule</h3>
            <form onSubmit={submitPersonal} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Day</label>
                <select value={personalForm.day} onChange={e => setPersonalForm(p => ({ ...p, day: e.target.value }))} style={inputStyle}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Class</label>
                <input required type="text" value={personalForm.class_name} onChange={e => setPersonalForm(p => ({ ...p, class_name: e.target.value }))} placeholder="e.g. JSS 1A" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject</label>
                <input required type="text" value={personalForm.subject} onChange={e => setPersonalForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Start Time</label>
                  <input required type="time" value={personalForm.start_time} onChange={e => setPersonalForm(p => ({ ...p, start_time: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>End Time</label>
                  <input required type="time" value={personalForm.end_time} onChange={e => setPersonalForm(p => ({ ...p, end_time: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              {msg && <p style={{ fontSize: 12, color: msg.includes('updated') ? '#059669' : '#DC2626' }}>{msg}</p>}
              <button type="submit" disabled={loading} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Add to Schedule'}
              </button>
            </form>
          </div>

          {/* Personal timetable view */}
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>My Schedule</h3>
            {teacherTimetable.length === 0 ? (
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>No schedule added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(groupByDay(teacherTimetable)).map(([day, entries]) => entries.length === 0 ? null : (
                  <div key={day}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{day}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {entries.map(e => (
                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#F9FAFB', borderRadius: 8 }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{e.subject}</span>
                            <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 8 }}>· {e.class_name}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, color: '#6B7280' }}>{e.start_time} – {e.end_time}</span>
                            <button onClick={() => deleteEntry(e.id, 'personal')} style={{ fontSize: 11, background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}