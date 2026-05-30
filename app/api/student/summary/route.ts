import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [results, behaviour, submissions, attendance] = await Promise.all([
      supabase.from('results').select('score').eq('student_id', payload.id),
      supabase.from('behaviour').select('rating').eq('student_id', payload.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('submissions').select('submitted').eq('student_id', payload.id).eq('submitted', false),
      supabase.from('attendance').select('status').eq('student_id', payload.id),
    ]);

    const scores = results.data ?? [];
    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, r) => a + Number(r.score), 0) / scores.length)
      : 0;

    const attendanceData = attendance.data ?? [];
    const present = attendanceData.filter(a => a.status === 'present').length;
    const attendanceRate = attendanceData.length > 0
      ? Math.round((present / attendanceData.length) * 100)
      : 0;

    return NextResponse.json({
      summary: {
        avg,
        behaviour: behaviour.data?.[0]?.rating ?? '—',
        pending: submissions.data?.length ?? 0,
        attendance: attendanceRate,
      }
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}