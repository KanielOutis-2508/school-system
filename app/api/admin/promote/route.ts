import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: classes } = await supabase
      .from('classes')
      .select('*, users!users_class_id_fkey(id, full_name, unique_id, school_level)')
      .order('name');

    return NextResponse.json({ classes: classes ?? [] });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { promotions, academic_year } = await request.json();

    if (!promotions || !academic_year) {
      return NextResponse.json({ error: 'Promotions and academic year required' }, { status: 400 });
    }

    for (const p of promotions) {
      const { student_id, from_class_id, to_class_id, status } = p;

      // Record promotion
      await supabase.from('promotions').insert({
        student_id,
        from_class_id,
        to_class_id: to_class_id || null,
        academic_year,
        status,
      });

      if (status === 'graduated') {
        // Mark as alumni — remove from class
        await supabase.from('users')
          .update({ class_id: null, role: 'student' })
          .eq('id', student_id);
      } else if (status === 'promoted' && to_class_id) {
        // Move to new class
        await supabase.from('users')
          .update({ class_id: to_class_id })
          .eq('id', student_id);
      }
      // If repeated — stay in same class, no update needed
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}