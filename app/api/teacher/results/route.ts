import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function getGrade(score: number) {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { student_id, subject_id, term, score } = await request.json();

    if (!student_id || !subject_id || !term || score === '') {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const grade = getGrade(Number(score));

    // Upsert — update if exists, insert if not
    const { error } = await supabase
      .from('results')
      .upsert({ student_id, subject_id, term, score: Number(score), grade },
        { onConflict: 'student_id,subject_id,term' });

    if (error) throw error;
    return NextResponse.json({ success: true, grade });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}