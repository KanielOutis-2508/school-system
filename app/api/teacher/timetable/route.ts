/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const { data: teacher } = await supabase
      .from('users')
      .select('class_id')
      .eq('id', payload.id)
      .single();

    let classTimetable: any[] = [];
    if (teacher?.class_id) {
      const { data } = await supabase
        .from('timetable')
        .select('*')
        .eq('class_id', teacher.class_id)
        .order('day')
        .order('period');
      classTimetable = data ?? [];
    }

    const { data: teacherTimetable } = await supabase
      .from('teacher_timetable')
      .select('*')
      .eq('teacher_id', payload.id)
      .order('day')
      .order('start_time');

    console.log('Timetable fetched successfully');

    return NextResponse.json({
      classTimetable,
      teacherTimetable: teacherTimetable ?? [],
    });
  } catch (err) {
    console.error('Timetable GET error:', err);
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

    const body = await request.json();
    console.log('Timetable POST body:', body);

    const { type, ...data } = body;

    if (type === 'class') {
      const { data: teacher } = await supabase
        .from('users')
        .select('class_id')
        .eq('id', payload.id)
        .single();

      if (!teacher?.class_id) {
        return NextResponse.json({ error: 'No class assigned to you' }, { status: 400 });
      }

      const { data: entry, error } = await supabase
        .from('timetable')
        .upsert({
          class_id: teacher.class_id,
          day: data.day,
          period: data.period,
          subject: data.subject,
          teacher_name: data.teacher_name,
          start_time: data.start_time,
          end_time: data.end_time,
        }, { onConflict: 'class_id,day,period' })
        .select()
        .single();

      console.log('Class timetable entry:', entry, 'Error:', error);
      if (error) throw error;
      return NextResponse.json({ entry });
    }

    if (type === 'personal') {
      const { data: entry, error } = await supabase
        .from('teacher_timetable')
        .insert({
          teacher_id: payload.id,
          day: data.day,
          class_name: data.class_name,
          subject: data.subject,
          start_time: data.start_time,
          end_time: data.end_time,
        })
        .select()
        .single();

      console.log('Personal timetable entry:', entry, 'Error:', error);
      if (error) throw error;
      return NextResponse.json({ entry });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('Timetable POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, type } = await request.json();

    if (type === 'class') {
      await supabase.from('timetable').delete().eq('id', id);
    } else {
      await supabase.from('teacher_timetable').delete().eq('id', id).eq('teacher_id', payload.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Timetable DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}