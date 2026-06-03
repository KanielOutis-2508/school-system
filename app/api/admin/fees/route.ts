import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: fees, error } = await supabase
      .from('fees')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Fees data:', fees, 'Error:', error);

    if (error) throw error;
    return NextResponse.json({ fees });
  } catch (err) {
    console.error('Fees GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { student_id, term, academic_year, amount_due, amount_paid, status } = await request.json();

    console.log('Creating fee:', { student_id, term, academic_year, amount_due, amount_paid, status });

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

    console.log('Fee created:', fee, 'Error:', error);

    if (error) throw error;
    return NextResponse.json({ fee });
  } catch (err) {
    console.error('Fees POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
      .from('fees')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Fees DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}