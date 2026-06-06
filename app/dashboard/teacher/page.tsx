'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import Avatar from '@/components/Avatar';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['Overview', 'Students', 'Add Student', 'Results', 'Send Results', 'Incoming Results', 'Behaviour', 'Assignments', 'Attendance', 'Timetable', 'Ranking', 'Messages'];
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
        {activeTab === 'Ranking' && <ClassRanking teacher={teacher} />}
        {activeTab === 'Messages' && <TeacherMessages teacher={teacher} />}
        {activeTab === 'Send Results' && <SendResults teacher={teacher} />}
        {activeTab === 'Incoming Results' && <IncomingResults teacher={teacher} />}
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
    student_id: '', subject_id: '', term: 'first', school_level: 'junior',
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

  const isSenior = form.school_level === 'senior';

  const total = isSenior
    ? Number(form.exam_score || 0) + Number(form.test_score || 0) + Number(form.midterm_score || 0) + Number(form.note_score || 0)
    : Number(form.exam_score || 0) + Number(form.test_score || 0) + Number(form.midterm_score || 0) + Number(form.classwork_score || 0) + Number(form.assignment_score || 0) + Number(form.note_score || 0);

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

  const juniorFields = [
    { label: 'Exam Score', key: 'exam_score', max: 40 },
    { label: 'Test Score', key: 'test_score', max: 20 },
    { label: 'Mid Term Project', key: 'midterm_score', max: 10 },
    { label: 'Classwork Score', key: 'classwork_score', max: 10 },
    { label: 'Assignment Score', key: 'assignment_score', max: 10 },
    { label: 'Note Score', key: 'note_score', max: 10 },
  ];

  const seniorFields = [
    { label: 'Exam Score', key: 'exam_score', max: 60 },
    { label: 'Test Score', key: 'test_score', max: 20 },
    { label: 'Mid Term Project', key: 'midterm_score', max: 10 },
    { label: 'Note Score', key: 'note_score', max: 10 },
  ];

  const scoreFields = isSenior ? seniorFields : juniorFields;

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: 560 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Enter Student Result</h3>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* School Level Toggle */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>School Level</label>
          <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 4 }}>
            {[{ value: 'junior', label: 'Junior (JSS)' }, { value: 'senior', label: 'Senior (SSS)' }].map(l => (
              <button key={l.value} type="button"
                onClick={() => setForm(p => ({ ...p, school_level: l.value, exam_score: '', test_score: '', midterm_score: '', classwork_score: '', assignment_score: '', note_score: '' }))}
                style={{
                  flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: form.school_level === l.value ? '#059669' : 'transparent',
                  color: form.school_level === l.value ? 'white' : '#6B7280',
                }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

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
}function ClassRanking({ teacher }: { teacher: any }) {
  const [ranking, setRanking] = useState<any[]>([]);
  const [term, setTerm] = useState('first');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!teacher) return;
  const fetchRanking = async () => {
    setLoading(true);
    const res = await fetch(`/api/teacher/ranking?term=${term}`);
    const d = await res.json();
    if (d.ranking) setRanking(d.ranking);
    setLoading(false);
  };
  fetchRanking();
}, [teacher, term]);
  const positionColor = (pos: number) => {
    if (pos === 1) return { color: '#D97706', bg: '#FFFBEB' };
    if (pos === 2) return { color: '#6B7280', bg: '#F9FAFB' };
    if (pos === 3) return { color: '#B45309', bg: '#FEF3C7' };
    return { color: '#374151', bg: '#F9FAFB' };
  };

  const positionLabel = (pos: number) => {
    if (pos === 1) return '🥇 1st';
    if (pos === 2) return '🥈 2nd';
    if (pos === 3) return '🥉 3rd';
    return `${pos}th`;
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Class Ranking</h3>
        <select value={term} onChange={e => setTerm(e.target.value)}
          style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, color: '#111827', outline: 'none' }}>
          <option value="first">First Term</option>
          <option value="second">Second Term</option>
          <option value="third">Third Term</option>
        </select>
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading...</p>
      ) : ranking.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No results recorded for this term yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranking.map(s => {
            const { color, bg } = positionColor(s.position);
            return (
              <div key={s.id} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr auto',
                alignItems: 'center', gap: 16,
                padding: '12px 16px', background: bg, borderRadius: 8,
                border: s.position <= 3 ? `1px solid ${color}22` : 'none',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color }}>{positionLabel(s.position)}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.full_name}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>{s.unique_id} · {s.subject_count} subjects</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{s.total_score}</div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>avg: {s.average}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function TeacherMessages({ teacher }: { teacher: any }) {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/broadcast')
      .then(r => r.json())
      .then(d => { if (d.broadcasts) setBroadcasts(d.broadcasts); });
  }, [teacher]);

  const markRead = async (id: string) => {
    await fetch('/api/teacher/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broadcast_id: id }),
    });
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, read: true } : b));
  };

  const unreadCount = broadcasts.filter(b => !b.read).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Messages from Admin</h3>
        {unreadCount > 0 && (
          <span style={{ background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      {broadcasts.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>No messages yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {broadcasts.map(b => (
            <div key={b.id} style={{
              background: 'white', borderRadius: 12, padding: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              borderLeft: b.read ? '3px solid #E5E7EB' : '3px solid #1a56db',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{b.title}</div>
                  {!b.read && (
                    <span style={{ background: '#EFF6FF', color: '#1a56db', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>NEW</span>
                  )}
                </div>
                {!b.read && (
                  <button onClick={() => markRead(b.id)}
                    style={{ fontSize: 11, background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', flexShrink: 0 }}>
                    Mark as read
                  </button>
                )}
              </div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, margin: 0 }}>{b.message}</p>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 10 }}>
                {new Date(b.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function SendResults({ teacher }: { teacher: any }) {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    student_id: '', subject_id: '', term: 'first', school_level: 'junior',
    to_teacher_id: '', exam_score: '', test_score: '', midterm_score: '',
    classwork_score: '', assignment_score: '', note_score: '',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/admin/classes').then(r => r.json()).then(d => { if (d.classes) setClasses(d.classes); });
    fetch('/api/admin/subjects').then(r => r.json()).then(d => { if (d.subjects) setSubjects(d.subjects); });
    fetch('/api/admin/teachers').then(r => r.json()).then(d => { if (d.teachers) setTeachers(d.teachers.filter((t: any) => t.id !== teacher?.id)); });
    fetch('/api/teacher/submit-results').then(r => r.json()).then(d => { if (d.submissions) setSubmissions(d.submissions); });
  }, [teacher]);

  useEffect(() => {
  const fetchStudents = async () => {
    if (!selectedClass) {
      setAllStudents([]);
      return;
    }
    const res = await fetch(`/api/admin/students?class_id=${selectedClass}`);
    const d = await res.json();
    if (d.students) setAllStudents(d.students);
  };
  fetchStudents();
}, [selectedClass]);

  const isSenior = form.school_level === 'senior';

  const total = isSenior
    ? Number(form.exam_score || 0) + Number(form.test_score || 0) + Number(form.midterm_score || 0) + Number(form.note_score || 0)
    : Number(form.exam_score || 0) + Number(form.test_score || 0) + Number(form.midterm_score || 0) + Number(form.classwork_score || 0) + Number(form.assignment_score || 0) + Number(form.note_score || 0);

  // Students who already have a pending/approved submission for selected subject+term
  const doneStudentIds = new Set(
    submissions
      .filter(s => s.subject_id === form.subject_id && s.term === form.term)
      .map(s => s.student_id)
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      // Update existing submission
      const res = await fetch('/api/teacher/submit-results', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Result updated!');
        setSubmissions(prev => prev.map(s => s.id === editingId ? { ...s, ...data.submission } : s));
        setEditingId(null);
        setForm({ student_id: '', subject_id: form.subject_id, term: form.term, school_level: form.school_level, to_teacher_id: form.to_teacher_id, exam_score: '', test_score: '', midterm_score: '', classwork_score: '', assignment_score: '', note_score: '' });
      } else { setMsg(data.error); }
    } else {
      const res = await fetch('/api/teacher/submit-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`✓ Result saved for student!`);
        setSubmissions(s => [data.submission, ...s]);
        setForm(p => ({ ...p, student_id: '', exam_score: '', test_score: '', midterm_score: '', classwork_score: '', assignment_score: '', note_score: '' }));
      } else { setMsg(data.error); }
    }
    setLoading(false);
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      student_id: s.student_id,
      subject_id: s.subject_id,
      term: s.term,
      school_level: s.school_level || 'junior',
      to_teacher_id: s.to_teacher_id,
      exam_score: s.exam_score?.toString() || '',
      test_score: s.test_score?.toString() || '',
      midterm_score: s.midterm_score?.toString() || '',
      classwork_score: s.classwork_score?.toString() || '',
      assignment_score: s.assignment_score?.toString() || '',
      note_score: s.note_score?.toString() || '',
    });
    setMsg('Editing result — make changes and save.');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ student_id: '', subject_id: form.subject_id, term: form.term, school_level: form.school_level, to_teacher_id: form.to_teacher_id, exam_score: '', test_score: '', midterm_score: '', classwork_score: '', assignment_score: '', note_score: '' });
    setMsg('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: 7, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: '#111827',
  };

  const scoreFields = isSenior ? [
    { label: 'Exam Score', key: 'exam_score', max: 60 },
    { label: 'Test Score', key: 'test_score', max: 20 },
    { label: 'Mid Term Project', key: 'midterm_score', max: 10 },
    { label: 'Note Score', key: 'note_score', max: 10 },
  ] : [
    { label: 'Exam Score', key: 'exam_score', max: 40 },
    { label: 'Test Score', key: 'test_score', max: 20 },
    { label: 'Mid Term Project', key: 'midterm_score', max: 10 },
    { label: 'Classwork Score', key: 'classwork_score', max: 10 },
    { label: 'Assignment Score', key: 'assignment_score', max: 10 },
    { label: 'Note Score', key: 'note_score', max: 10 },
  ];

  const statusColor = (s: string) => {
    if (s === 'approved') return { bg: '#ECFDF5', color: '#059669' };
    if (s === 'rejected') return { bg: '#FEF2F2', color: '#DC2626' };
    return { bg: '#FFFBEB', color: '#D97706' };
  };

  // Filter subjects by selected class
  const filteredSubjects = selectedClass
    ? subjects.filter(s => s.class_id === selectedClass || !s.class_id)
    : subjects;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
            {editingId ? '✏️ Edit Result' : 'Send Results to Form Teacher'}
          </h3>
          {editingId && (
            <button onClick={cancelEdit} style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* School Level Toggle */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>School Level</label>
            <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 8, padding: 4 }}>
              {[{ value: 'junior', label: 'Junior (JSS)' }, { value: 'senior', label: 'Senior (SSS)' }].map(l => (
                <button key={l.value} type="button"
                  onClick={() => setForm(p => ({ ...p, school_level: l.value, exam_score: '', test_score: '', midterm_score: '', classwork_score: '', assignment_score: '', note_score: '' }))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: form.school_level === l.value ? '#059669' : 'transparent',
                    color: form.school_level === l.value ? 'white' : '#6B7280',
                  }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Class picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Class</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setForm(p => ({ ...p, student_id: '' })); }} style={inputStyle}>
              <option value="">Select class first</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Student picker with done indicators */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
              Student {allStudents.length > 0 && <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({doneStudentIds.size}/{allStudents.length} done)</span>}
            </label>
            {allStudents.length === 0 ? (
              <div style={{ padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: 13, color: '#9CA3AF' }}>
                Select a class first
              </div>
            ) : (
              <div style={{ border: '1.5px solid #E5E7EB', borderRadius: 7, overflow: 'hidden', maxHeight: 180, overflowY: 'auto' }}>
                {allStudents.map(s => {
                  const isDone = doneStudentIds.has(s.id);
                  const isSelected = form.student_id === s.id;
                  return (
                    <div key={s.id}
                      onClick={() => setForm(p => ({ ...p, student_id: s.id }))}
                      style={{
                        padding: '10px 12px', cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        background: isSelected ? '#EFF6FF' : 'white',
                        borderBottom: '1px solid #F3F4F6',
                      }}>
                      <span style={{ fontSize: 13, color: '#111827', fontWeight: isSelected ? 600 : 400 }}>{s.full_name}</span>
                      {isDone && <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>✓ Done</span>}
                      {isSelected && !isDone && <span style={{ fontSize: 11, color: '#1a56db' }}>Selected</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Subject</label>
            <select required value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))} style={inputStyle}>
              <option value="">Select subject</option>
              {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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

          {/* Send to Form Teacher */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Send to Form Teacher</label>
            <select required value={form.to_teacher_id} onChange={e => setForm(p => ({ ...p, to_teacher_id: e.target.value }))} style={inputStyle}>
              <option value="">Select form teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>

          {/* Score fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {scoreFields.map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
                  {f.label} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(max {f.max})</span>
                </label>
                <input type="number" min="0" max={f.max}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder="0" style={inputStyle} />
              </div>
            ))}
          </div>

          {/* Live total */}
          <div style={{
            background: total >= 70 ? '#ECFDF5' : total >= 50 ? '#EFF6FF' : '#FEF2F2',
            borderRadius: 8, padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Total</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: total >= 70 ? '#059669' : total >= 50 ? '#1a56db' : '#DC2626' }}>{total} / 100</span>
          </div>

          {msg && <p style={{ fontSize: 12, color: msg.includes('✓') || msg.includes('updated') ? '#059669' : msg.includes('Editing') ? '#D97706' : '#DC2626' }}>{msg}</p>}

          <button type="submit" disabled={loading || !form.student_id}
            style={{ background: editingId ? '#D97706' : '#059669', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !form.student_id ? 0.5 : 1 }}>
            {loading ? 'Saving...' : editingId ? 'Update Result' : 'Send Result'}
          </button>
        </form>
      </div>

      {/* Sent results with edit option */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Sent Results ({submissions.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 600, overflowY: 'auto' }}>
          {submissions.length === 0 && <p style={{ fontSize: 13, color: '#9CA3AF' }}>No results sent yet.</p>}
          {submissions.map(s => {
            const { bg, color } = statusColor(s.status);
            return (
              <div key={s.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, border: editingId === s.id ? '2px solid #D97706' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.subjects?.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: bg, color }}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                    {s.status === 'pending' && (
                      <button onClick={() => startEdit(s)}
                        style={{ fontSize: 11, background: '#FFFBEB', color: '#D97706', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>Total: {s.total}/100 · Grade: {s.grade} · {s.term} term</div>
                {s.note && <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>Note: {s.note}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


function IncomingResults({ teacher }: { teacher: any }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!teacher) return;
    fetch('/api/teacher/incoming-results')
      .then(r => r.json())
      .then(d => { if (d.submissions) setSubmissions(d.submissions); });
  }, [teacher]);

  const handle = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch('/api/teacher/incoming-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, note: note[id] || '' }),
    });
    if (res.ok) {
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: action === 'approve' ? 'approved' : 'rejected' } : s));
    }
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const processed = submissions.filter(s => s.status !== 'pending');

  const statusColor = (s: string) => {
    if (s === 'approved') return { bg: '#ECFDF5', color: '#059669' };
    if (s === 'rejected') return { bg: '#FEF2F2', color: '#DC2626' };
    return { bg: '#FFFBEB', color: '#D97706' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Pending */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Pending Results</h3>
          {pending.length > 0 && (
            <span style={{ background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>No pending results.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map(s => (
              <div key={s.id} style={{ padding: '16px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.subjects?.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Total: {s.total}/100 · Grade: {s.grade} · {s.term} term</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', textAlign: 'right' }}>
                    From: {s['users!result_submissions_from_teacher_id_fkey']?.full_name}
                  </div>
                </div>
                <input type="text" placeholder="Add note (optional)"
                  value={note[s.id] || ''}
                  onChange={e => setNote(n => ({ ...n, [s.id]: e.target.value }))}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 12, outline: 'none', color: '#111827', boxSizing: 'border-box', marginBottom: 10 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handle(s.id, 'approve')}
                    style={{ flex: 1, padding: '8px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => handle(s.id, 'reject')}
                    style={{ flex: 1, padding: '8px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed */}
      {processed.length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Processed Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {processed.map(s => {
              const { bg, color } = statusColor(s.status);
              return (
                <div key={s.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.subjects?.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>Total: {s.total}/100 · Grade: {s.grade}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: bg, color }}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}