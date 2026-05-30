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

    // Try finding by unique_id first, then by username
    let user = null;

    const { data: byId } = await supabase
      .from('users')
      .select('*')
      .eq('unique_id', unique_id.toUpperCase())
      .single();

    if (byId) {
      user = byId;
    } else {
      const { data: byUsername } = await supabase
        .from('users')
        .select('*')
        .eq('username', unique_id.toLowerCase())
        .single();
      if (byUsername) user = byUsername;
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid ID or password' }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid ID or password' }, { status: 401 });
    }

    const token = signToken({ id: user.id, role: user.role, unique_id: user.unique_id });

    const response = NextResponse.json({
      success: true,
      role: user.role,
      name: user.full_name,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
    });

    return response;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}