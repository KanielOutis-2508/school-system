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

    // Get subjects assigned to this teacher OR to their class
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .or(`teacher_id.eq.${payload.id},class_id.eq.${teacher?.class_id || '00000000-0000-0000-0000-000000000000'}`)
      .order('name');

    return NextResponse.json({ subjects: subjects ?? [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}