import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: fees, error } = await supabase
      .from('fees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ fees });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { student_id, term, academic_year, amount_due, amount_paid, status } = await request.json();

    if (!student_id || !term || !academic_year || !amount_due) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: fee, error } = await supabase
      .from('fees')
      .upsert({
        student_id,
        term,
        academic_year,
        amount_due: Number(amount_due),
        amount_paid: Number(amount_paid || 0),
        status,
        paid_at: status === 'paid' ? new Date().toISOString() : null,
      }, { onConflict: 'student_id,term,academic_year' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ fee });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}