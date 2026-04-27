import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.json();
    const { provider } = data;

    if (!provider || !['github', 'google'].includes(provider)) {
      return new Response(
        JSON.stringify({ error: 'Invalid provider' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: oauthData, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'github' | 'google',
      options: {
        redirectTo: `${context.url.origin}/auth/callback`,
      },
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ url: oauthData.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred with OAuth' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
