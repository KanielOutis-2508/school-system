import { NextRequest, NextResponse } from 'next/server';
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

    const { data: submissions } = await supabase
      .from('result_submissions')
      .select('*, subjects(name), users!result_submissions_student_id_fkey(full_name), users!result_submissions_from_teacher_id_fkey(full_name)')
      .eq('to_teacher_id', payload.id)
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

    const { id, action, note } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action required' }, { status: 400 });
    }

    if (action === 'approve') {
      // Get the submission
      const { data: submission } = await supabase
        .from('result_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

      // Save to actual results
      await supabase.from('results').upsert({
        student_id: submission.student_id,
        subject_id: submission.subject_id,
        term: submission.term,
        school_level: submission.school_level,
        exam_score: submission.exam_score,
        test_score: submission.test_score,
        midterm_score: submission.midterm_score,
        classwork_score: submission.classwork_score,
        assignment_score: submission.assignment_score,
        note_score: submission.note_score,
        score: submission.total,
        grade: submission.grade,
      }, { onConflict: 'student_id,subject_id,term' });

      // Update submission status
      await supabase.from('result_submissions')
        .update({ status: 'approved', note })
        .eq('id', id);

    } else if (action === 'reject') {
      await supabase.from('result_submissions')
        .update({ status: 'rejected', note })
        .eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}