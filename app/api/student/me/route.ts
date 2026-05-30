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
      .select('*, student_profiles(*)')
      .eq('id', payload.id)
      .single();

    return NextResponse.json({ student });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}