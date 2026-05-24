import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');

    if (error) throw error;
    return NextResponse.json({ classes });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Class name required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ class: data });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}