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

    const { records, date } = await request.json();

    if (!records || !date) {
      return NextResponse.json({ error: 'Records and date required' }, { status: 400 });
    }

    // Upsert attendance records
    const { error } = await supabase
      .from('attendance')
      .upsert(
        records.map((r: { student_id: string; status: string }) => ({
          student_id: r.student_id,
          teacher_id: payload.id,
          date,
          status: r.status,
        })),
        { onConflict: 'student_id,date' }
      );

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}