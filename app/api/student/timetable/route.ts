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

    const { data: student } = await supabase
      .from('users')
      .select('class_id')
      .eq('id', payload.id)
      .single();

    if (!student?.class_id) {
      return NextResponse.json({ timetable: [] });
    }

    const { data: timetable } = await supabase
      .from('timetable')
      .select('*')
      .eq('class_id', student.class_id)
      .order('day')
      .order('period');

    return NextResponse.json({ timetable: timetable ?? [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}