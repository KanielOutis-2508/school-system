import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { unique_id, password } = await request.json();

    if (!unique_id || !password) {
      return NextResponse.json({ error: 'ID and password required' }, { status: 400 });
    }

    // Find user by unique ID
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('unique_id', unique_id.toUpperCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid ID or password' }, { status: 401 });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid ID or password' }, { status: 401 });
    }

    // Sign JWT token
    const token = signToken({ id: user.id, role: user.role, unique_id: user.unique_id });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      role: user.role,
      name: user.full_name,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}