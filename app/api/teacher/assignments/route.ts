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

    const { data: assignments } = await supabase
      .from('assignments')
      .select('*, subjects(name)')
      .order('created_at', { ascending: false });

    return NextResponse.json({ assignments: assignments ?? [] });
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

    const { title, subject_id, due_date, term, student_ids } = await request.json();

    if (!title || !subject_id || !due_date || !term) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    // Create assignment
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({ title, subject_id, due_date, term })
      .select()
      .single();

    if (error) throw error;

    // Create submission records for all students
    if (student_ids?.length > 0) {
      await supabase.from('submissions').insert(
        student_ids.map((sid: string) => ({
          assignment_id: assignment.id,
          student_id: sid,
          submitted: false,
        }))
      );
    }

    return NextResponse.json({ assignment });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}