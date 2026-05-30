import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .order('name');

    console.log('Classes fetch:', classes, error);

    if (error) throw error;
    return NextResponse.json({ classes });
  } catch (err) {
    console.error('Classes GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating class:', body);

    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Class name required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({ name })
      .select()
      .single();

    console.log('Class created:', data, 'Error:', error);

    if (error) throw error;
    return NextResponse.json({ class: data });
  } catch (err) {
    console.error('Classes POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}