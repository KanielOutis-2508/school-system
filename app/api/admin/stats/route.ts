import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const [teachers, students, classes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'teacher'),
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'student'),
      supabase.from('classes').select('id', { count: 'exact' }),
    ]);

    return NextResponse.json({
      stats: {
        teachers: teachers.count ?? 0,
        students: students.count ?? 0,
        classes: classes.count ?? 0,
      }
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}