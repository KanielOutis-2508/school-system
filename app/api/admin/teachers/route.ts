import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

function generateTeacherId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `NAZ-TCH-${num}`;
}

export async function GET() {
  try {
    const { data: teachers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'teacher')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ teachers });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { full_name, email, password, class_id } = await request.json();

    if (!full_name || !password) {
      return NextResponse.json({ error: 'Name and password required' }, { status: 400 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate unique ID
    let unique_id = generateTeacherId();

    // Make sure ID is unique
    let exists = true;
    while (exists) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('unique_id', unique_id)
        .single();
      if (!data) exists = false;
      else unique_id = generateTeacherId();
    }

    const { data: teacher, error } = await supabase
      .from('users')
      .insert({
        full_name,
        email: email || null,
        password_hash,
        role: 'teacher',
        unique_id,
        class_id: class_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ teacher, unique_id });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}