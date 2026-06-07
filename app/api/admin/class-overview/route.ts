import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const class_id = searchParams.get('class_id');
    const student_id = searchParams.get('student_id');

    if (!class_id) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
    }

    // Get all students in class
    const { data: students } = await supabase
      .from('users')
      .select('*, student_profiles(*)')
      .eq('class_id', class_id)
      .eq('role', 'student')
      .order('full_name');

    if (!student_id) {
      return NextResponse.json({ students: students ?? [] });
    }

    // Get full profile for specific student
    const [results, behaviour, attendance, fees, assignments] = await Promise.all([
      supabase.from('results').select('*, subjects(name)').eq('student_id', student_id).order('term'),
      supabase.from('behaviour').select('*').eq('student_id', student_id).order('term'),
      supabase.from('attendance').select('*').eq('student_id', student_id).order('date', { ascending: false }),
      supabase.from('fees').select('*').eq('student_id', student_id).order('created_at', { ascending: false }),
      supabase.from('submissions').select('*, assignments(title, due_date, term, subjects(name))').eq('student_id', student_id),
    ]);

    return NextResponse.json({
      students: students ?? [],
      studentData: {
        results: results.data ?? [],
        behaviour: behaviour.data ?? [],
        attendance: attendance.data ?? [],
        fees: fees.data ?? [],
        assignments: assignments.data ?? [],
      }
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}