import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || 'first';

    // Get teacher's class
    const { data: teacher } = await supabase
      .from('users')
      .select('class_id')
      .eq('id', payload.id)
      .single();

    if (!teacher?.class_id) {
      return NextResponse.json({ ranking: [] });
    }

    // Get all students in class
    const { data: students } = await supabase
      .from('users')
      .select('id, full_name, unique_id')
      .eq('class_id', teacher.class_id)
      .eq('role', 'student');

    if (!students || students.length === 0) {
      return NextResponse.json({ ranking: [] });
    }

    // Get results for each student for this term
    const ranking = await Promise.all(students.map(async student => {
      const { data: results } = await supabase
        .from('results')
        .select('score, subjects(name)')
        .eq('student_id', student.id)
        .eq('term', term);

      const totalScore = results?.reduce((sum, r) => sum + Number(r.score), 0) ?? 0;
      const subjectCount = results?.length ?? 0;
      const average = subjectCount > 0 ? totalScore / subjectCount : 0;

      return {
        id: student.id,
        full_name: student.full_name,
        unique_id: student.unique_id,
        total_score: totalScore,
        average: Math.round(average * 10) / 10,
        subject_count: subjectCount,
      };
    }));

    // Sort by total score descending and assign positions
    ranking.sort((a, b) => b.total_score - a.total_score);
    const ranked = ranking.map((s, i) => ({ ...s, position: i + 1 }));

    return NextResponse.json({ ranking: ranked });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}