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

    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false });

    // Get read status for this teacher
    const { data: reads } = await supabase
      .from('broadcast_reads')
      .select('broadcast_id')
      .eq('teacher_id', payload.id);

    const readIds = new Set(reads?.map(r => r.broadcast_id) ?? []);

    const result = (broadcasts ?? []).map(b => ({
      ...b,
      read: readIds.has(b.id),
    }));

    return NextResponse.json({ broadcasts: result });
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

    const { broadcast_id } = await request.json();

    await supabase.from('broadcast_reads').upsert({
      broadcast_id,
      teacher_id: payload.id,
    }, { onConflict: 'broadcast_id,teacher_id' });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}