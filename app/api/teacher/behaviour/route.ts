import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { student_id, term, rating, comment } = await request.json();

    if (!student_id || !term || !rating) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('behaviour')
      .upsert({ student_id, teacher_id: payload.id, term, rating, comment },
        { onConflict: 'student_id,term' });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}