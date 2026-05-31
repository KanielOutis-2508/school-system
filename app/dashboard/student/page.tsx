/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['Overview', 'Results', 'Behaviour', 'Assignments', 'Attendance', 'Fees', 'Timetable'];

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    fetch('/api/student/me')
      .then(r => r.json())
      .then(d => { if (d.student) setStudent(d.student); })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F3F4F6', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>N</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
              {student ? student.full_name : 'Student'}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              Student · {student?.unique_id}
            </div>
          </div>
        </div>
        <button onClick={logout} style={{ fontSize: 13, color: '#6B7280', background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 10, padding: 4, marginBottom: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
              background: activeTab === tab ? '#7C3AED' : 'transparent',
              color: activeTab === tab ? 'white' : '#6B7280',
              transition: 'all 0.2s',
            }}>{tab}</button>
          ))}
        </div>

        {activeTab === 'Overview' && <StudentOverview student={student} />}
        {activeTab === 'Results' && <StudentResults />}
        {activeTab === 'Behaviour' && <StudentBehaviour />}
        {activeTab === 'Assignments' && <StudentAssignments />}
        {activeTab === 'Attendance' && <StudentAttendance />}
        {activeTab === 'Fees' && <StudentFees />}
        {activeTab === 'Timetable' && <StudentTimetable />}
      </div>
    </main>
  );
}

function StudentOverview({ student }: { student: any }) {
  const [summary, setSummary] = useState({ avg: 0, behaviour: '—', pending: 0, attendance: 0 });

  useEffect(() => {
    if (!student) return;
    fetch('/api/student/summary')
      .then(r => r.json())
      .then(d => { if (d.summary) setSummary(d.summary); });
  }, [student]);

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Welcome, {student?.full_name}
      </h2>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>ID: {student?.unique_id}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>
        {[
          { label: 'Average Score', value: `${summary.avg}%`, color: '#7C3AED' },
          { label: 'Behaviour', value: summary.behaviour, color: '#059669' },
          { label: 'Pending Assignments', value: summary.pending, color: '#D97706' },
          { label: 'Attendance Rate', value: `${summary.attendance}%`, color: '#1a56db' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {student?.student_profiles?.[0] && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>My Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Parent/Guardian', value: student.student_profiles[0].parent_name },
              { label: 'Parent Phone', value: student.student_profiles[0].parent_phone },
              { label: 'Parent Email', value: student.student_profiles[0].parent_email || '—' },
              { label: 'Dismissal', value: student.student_profiles[0].dismissal_method === 'alone' ? 'Goes home alone' : 'Parent pickup' },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentResults() {
  const [results, setResults] = useState<any[]>([]);
  const [term, setTerm] = useState('first');

  useEffect(() => {
    fetch(`/api/student/results?term=${term}`)
      .then(r => r.json())
      .then(d => { if (d.results) setResults(d.results); });
  }, [term]);

  const gradeColor = (grade: string) => {
    if (grade === 'A') return '#059669';
    if (grade === 'B') return '#1a56db';
    if (grade === 'C') return '#D97706';
    if (grade === 'D') return '#EA580C';
    return '#DC2626';
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>My Results</h3>
        <select value={term} onChange={e => setTerm(e.target.value)}
          style={{ padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 13, color: '#111827', outline: 'none' }}>
          <option value="first">First Term</option>
          <option value="second">Second Term</option>
          <option value="third">Third Term</option>
        </select>
      </div>

      {results.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No results for this term yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map(r => (
            <div key={r.id} style={{ background: '#F9FAFB', borderRadius: 8, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{r.subjects?.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: gradeColor(r.grade) }}>{r.grade}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{r.score}/100</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Exam', value: r.exam_score, max: 40 },
                  { label: 'Test', value: r.test_score, max: 20 },
                  { label: 'Mid Term', value: r.midterm_score, max: 10 },
                  { label: 'Classwork', value: r.classwork_score, max: 10 },
                  { label: 'Assignment', value: r.assignment_score, max: 10 },
                  { label: 'Note', value: r.note_score, max: 10 },
                ].map(s => (
                  <div key={s.label} style={{ background: 'white', borderRadius: 6, padding: '6px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.value ?? 0}/{s.max}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '12px 16px', background: '#F3F0FF', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED' }}>Average</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>
              {results.length > 0 ? (results.reduce((a, r) => a + Number(r.score), 0) / results.length).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentBehaviour() {
  const [behaviour, setBehaviour] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/student/behaviour')
      .then(r => r.json())
      .then(d => { if (d.behaviour) setBehaviour(d.behaviour); });
  }, []);

  const ratingColor = (r: string) => {
    if (r === 'Excellent') return '#059669';
    if (r === 'Good') return '#1a56db';
    if (r === 'Fair') return '#D97706';
    return '#DC2626';
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>My Behaviour</h3>
      {behaviour.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No behaviour records yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {behaviour.map(b => (
            <div key={b.id} style={{ padding: '16px', background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>{b.term} Term</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: ratingColor(b.rating) }}>{b.rating}</span>
              </div>
              {b.comment && <p style={{ fontSize: 13, color: '#374151' }}>{b.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/student/assignments')
      .then(r => r.json())
      .then(d => { if (d.assignments) setAssignments(d.assignments); });
  }, []);

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>My Assignments</h3>
      {assignments.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No assignments yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assignments.map(a => (
            <div key={a.id} style={{ padding: '14px 16px', background: '#F9FAFB', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{a.assignments?.title}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                  {a.assignments?.subjects?.name} · Due: {a.assignments?.due_date}
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                background: a.submitted ? '#ECFDF5' : '#FEF3C7',
                color: a.submitted ? '#059669' : '#D97706',
              }}>
                {a.submitted ? 'Submitted' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentAttendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => {
    fetch('/api/student/attendance')
      .then(r => r.json())
      .then(d => {
        if (d.attendance) {
          setAttendance(d.attendance);
          const present = d.attendance.filter((a: any) => a.status === 'present').length;
          const absent = d.attendance.filter((a: any) => a.status === 'absent').length;
          const late = d.attendance.filter((a: any) => a.status === 'late').length;
          setStats({ present, absent, late, total: d.attendance.length });
        }
      });
  }, []);

  const statusColor = (s: string) => {
    if (s === 'present') return { bg: '#ECFDF5', color: '#059669' };
    if (s === 'absent') return { bg: '#FEF2F2', color: '#DC2626' };
    return { bg: '#FFFBEB', color: '#D97706' };
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Present', value: stats.present, color: '#059669' },
          { label: 'Absent', value: stats.absent, color: '#DC2626' },
          { label: 'Late', value: stats.late, color: '#D97706' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>
          Attendance Record ({stats.total} days)
        </h3>
        {attendance.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>No attendance records yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {attendance.map(a => {
              const { bg, color } = statusColor(a.status);
              return (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F9FAFB', borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{a.date}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: bg, color }}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentFees() {
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/student/fees')
      .then(r => r.json())
      .then(d => { if (d.fees) setFees(d.fees); });
  }, []);

  const statusColor = (s: string) => {
    if (s === 'paid') return { bg: '#ECFDF5', color: '#059669' };
    if (s === 'partial') return { bg: '#FFFBEB', color: '#D97706' };
    return { bg: '#FEF2F2', color: '#DC2626' };
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>School Fees</h3>
      {fees.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No fees records yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {fees.map(f => {
            const { bg, color } = statusColor(f.status);
            const balance = Number(f.amount_due) - Number(f.amount_paid);
            return (
              <div key={f.id} style={{ padding: '16px', background: '#F9FAFB', borderRadius: 8, border: `1px solid ${bg}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                      {f.term.charAt(0).toUpperCase() + f.term.slice(1)} Term
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{f.academic_year}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: bg, color }}>
                    {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Amount Due', value: `₦${Number(f.amount_due).toLocaleString()}`, color: '#111827' },
                    { label: 'Amount Paid', value: `₦${Number(f.amount_paid).toLocaleString()}`, color: '#059669' },
                    { label: 'Balance', value: `₦${balance.toLocaleString()}`, color: balance > 0 ? '#DC2626' : '#059669' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '10px', background: 'white', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudentTimetable() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    fetch('/api/student/timetable')
      .then(r => r.json())
      .then(d => { if (d.timetable) setTimetable(d.timetable); });
  }, []);

  const groupByDay = (entries: any[]) => {
    return DAYS.reduce((acc, day) => {
      acc[day] = entries.filter(e => e.day === day).sort((a, b) => a.period - b.period);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const grouped = groupByDay(timetable);

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 }}>My Class Timetable</h3>
      {timetable.length === 0 ? (
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No timetable set for your class yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {DAYS.map(day => grouped[day]?.length > 0 ? (
            <div key={day}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{day}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {grouped[day].map(p => (
                  <div key={p.id} style={{ padding: '12px 14px', background: '#F9FAFB', borderRadius: 8, borderLeft: '3px solid #7C3AED' }}>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>Period {p.period} · {p.start_time} – {p.end_time}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{p.subject}</div>
                    {p.teacher_name && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{p.teacher_name}</div>}
                  </div>
                ))}
              </div>
            </div>
          ) : null)}
        </div>
      )}
    </div>
  );
}