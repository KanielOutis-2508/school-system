import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

function generateStudentId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `NAZ-STD-${num}`;
}

export async function GET() {
  try {
    const { data: students, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ students });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      full_name, password, class_id, username,
      date_of_birth, parent_name, parent_phone,
      parent_email, dismissal_method,
    } = await request.json();

    if (!full_name || !password || !parent_phone || !username) {
      return NextResponse.json({ error: 'Name, username, password and parent phone required' }, { status: 400 });
    }

    // Check username not taken
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    let unique_id = generateStudentId();
    let exists = true;
    while (exists) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('unique_id', unique_id)
        .single();
      if (!data) exists = false;
      else unique_id = generateStudentId();
    }

    const { data: student, error: userError } = await supabase
      .from('users')
      .insert({
        full_name,
        password_hash,
        role: 'student',
        unique_id,
        username: username.toLowerCase(),
        class_id: class_id || null,
      })
      .select()
      .single();

    if (userError) throw userError;

    await supabase.from('student_profiles').insert({
      user_id: student.id,
      date_of_birth: date_of_birth || null,
      parent_name: parent_name || null,
      parent_phone,
      parent_email: parent_email || null,
      dismissal_method: dismissal_method || 'pickup',
    });

    return NextResponse.json({ student, unique_id });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('role', 'student');

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}