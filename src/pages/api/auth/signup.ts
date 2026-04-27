import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.json();
    const { email, password, fullName } = data;

    // Validate inputs
    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sign up user with Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
      },
      email_confirm: true,
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user profile in database
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          email,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Sign up successful',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during sign up' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
