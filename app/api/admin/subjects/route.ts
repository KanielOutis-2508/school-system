import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) throw error;
    return NextResponse.json({ subjects });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, teacher_id, class_ids } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Subject name required' }, { status: 400 });
    }

    // Create one subject entry per class selected
    const inserts = class_ids?.length > 0
      ? class_ids.map((class_id: string) => ({
          name,
          teacher_id: teacher_id || null,
          class_id,
        }))
      : [{ name, teacher_id: teacher_id || null, class_id: null }];

    const { data: subjects, error } = await supabase
      .from('subjects')
      .insert(inserts)
      .select();

    if (error) throw error;
    return NextResponse.json({ subjects });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await supabase.from('subjects').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}