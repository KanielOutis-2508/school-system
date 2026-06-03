import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ broadcasts: broadcasts ?? [] });
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

    const { title, message } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message required' }, { status: 400 });
    }

    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .insert({ admin_id: payload.id, title, message })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ broadcast });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await supabase.from('broadcasts').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}