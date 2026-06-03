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

    const { data: teacher } = await supabase
      .from('users')
      .select('class_id')
      .eq('id', payload.id)
      .single();

    let studentCount = 0;
    if (teacher?.class_id) {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('class_id', teacher.class_id)
        .eq('role', 'student');
      studentCount = count ?? 0;
    }

    const { count: assignmentCount } = await supabase
      .from('assignments')
      .select('id', { count: 'exact' });

    return NextResponse.json({
      stats: {
        students: studentCount,
        assignments: assignmentCount ?? 0,
      }
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}