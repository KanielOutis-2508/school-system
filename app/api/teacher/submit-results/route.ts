import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function getGrade(total: number, isSenior: boolean) {
  if (isSenior) {
    if (total >= 75) return 'A1';
    if (total >= 70) return 'B2';
    if (total >= 65) return 'B3';
    if (total >= 60) return 'C4';
    if (total >= 55) return 'C5';
    if (total >= 50) return 'C6';
    if (total >= 45) return 'D7';
    if (total >= 40) return 'E8';
    return 'F9';
  }
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: submissions } = await supabase
      .from('result_submissions')
      .select('*, subjects(name), users!result_submissions_student_id_fkey(full_name), users!result_submissions_to_teacher_id_fkey(full_name)')
      .eq('from_teacher_id', payload.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ submissions: submissions ?? [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      student_id, subject_id, term, school_level,
      to_teacher_id, exam_score, test_score,
      midterm_score, classwork_score, assignment_score, note_score,
    } = await request.json();

    if (!student_id || !subject_id || !term || !to_teacher_id) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const isSenior = school_level === 'senior';
    const total = isSenior
      ? Number(exam_score || 0) + Number(test_score || 0) + Number(midterm_score || 0) + Number(note_score || 0)
      : Number(exam_score || 0) + Number(test_score || 0) + Number(midterm_score || 0) + Number(classwork_score || 0) + Number(assignment_score || 0) + Number(note_score || 0);

    const grade = getGrade(total, isSenior);

    const { data: submission, error } = await supabase
      .from('result_submissions')
      .insert({
        from_teacher_id: payload.id,
        to_teacher_id,
        student_id,
        subject_id,
        term,
        school_level: school_level || 'junior',
        exam_score: Number(exam_score || 0),
        test_score: Number(test_score || 0),
        midterm_score: Number(midterm_score || 0),
        classwork_score: isSenior ? 0 : Number(classwork_score || 0),
        assignment_score: isSenior ? 0 : Number(assignment_score || 0),
        note_score: Number(note_score || 0),
        total,
        grade,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      id, school_level, exam_score, test_score,
      midterm_score, classwork_score, assignment_score, note_score,
    } = await request.json();

    const isSenior = school_level === 'senior';
    const total = isSenior
      ? Number(exam_score || 0) + Number(test_score || 0) + Number(midterm_score || 0) + Number(note_score || 0)
      : Number(exam_score || 0) + Number(test_score || 0) + Number(midterm_score || 0) + Number(classwork_score || 0) + Number(assignment_score || 0) + Number(note_score || 0);

    const grade = getGrade(total, isSenior);

    const { data: submission, error } = await supabase
      .from('result_submissions')
      .update({
        exam_score: Number(exam_score || 0),
        test_score: Number(test_score || 0),
        midterm_score: Number(midterm_score || 0),
        classwork_score: isSenior ? 0 : Number(classwork_score || 0),
        assignment_score: isSenior ? 0 : Number(assignment_score || 0),
        note_score: Number(note_score || 0),
        total,
        grade,
        status: 'pending',
      })
      .eq('id', id)
      .eq('from_teacher_id', payload.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// getGrade handles both senior and junior grading schemes
