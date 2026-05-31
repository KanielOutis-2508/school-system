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

    // Get class timetable (for form teachers)
    const { data: teacher } = await supabase
      .from('users')
      .select('class_id')
      .eq('id', payload.id)
      .single();

    const [classTimetable, teacherTimetable] = await Promise.all([
      teacher?.class_id
        ? supabase.from('timetable').select('*').eq('class_id', teacher.class_id).order('day').order('period')
        : { data: [] },
      supabase.from('teacher_timetable').select('*').eq('teacher_id', payload.id).order('day').order('start_time'),
    ]);

    return NextResponse.json({
      classTimetable: classTimetable.data ?? [],
      teacherTimetable: teacherTimetable.data ?? [],
    });
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

    const { type, ...data } = await request.json();

    if (type === 'class') {
      const { data: teacher } = await supabase
        .from('users')
        .select('class_id')
        .eq('id', payload.id)
        .single();

      if (!teacher?.class_id) {
        return NextResponse.json({ error: 'No class assigned' }, { status: 400 });
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

      if (error) throw error;
      return NextResponse.json({ entry });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch {
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
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}