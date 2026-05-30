import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function getGrade(total: number) {
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      student_id, subject_id, term,
      exam_score, test_score, midterm_score,
      classwork_score, assignment_score, note_score,
    } = await request.json();

    if (!student_id || !subject_id || !term) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    // Validate max scores
    if (Number(exam_score) > 40) return NextResponse.json({ error: 'Exam max is 40' }, { status: 400 });
    if (Number(test_score) > 20) return NextResponse.json({ error: 'Test max is 20' }, { status: 400 });
    if (Number(midterm_score) > 10) return NextResponse.json({ error: 'Midterm max is 10' }, { status: 400 });
    if (Number(classwork_score) > 10) return NextResponse.json({ error: 'Classwork max is 10' }, { status: 400 });
    if (Number(assignment_score) > 10) return NextResponse.json({ error: 'Assignment max is 10' }, { status: 400 });
    if (Number(note_score) > 10) return NextResponse.json({ error: 'Note max is 10' }, { status: 400 });

    // Calculate total
    const total = 
      Number(exam_score || 0) +
      Number(test_score || 0) +
      Number(midterm_score || 0) +
      Number(classwork_score || 0) +
      Number(assignment_score || 0) +
      Number(note_score || 0);

    const grade = getGrade(total);

    const { error } = await supabase
      .from('results')
      .upsert({
        student_id, subject_id, term,
        exam_score: Number(exam_score || 0),
        test_score: Number(test_score || 0),
        midterm_score: Number(midterm_score || 0),
        classwork_score: Number(classwork_score || 0),
        assignment_score: Number(assignment_score || 0),
        note_score: Number(note_score || 0),
        score: total,
        grade,
      }, { onConflict: 'student_id,subject_id,term' });

    if (error) throw error;
    return NextResponse.json({ success: true, total, grade });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}