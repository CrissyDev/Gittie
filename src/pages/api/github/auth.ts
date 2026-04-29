import type { APIRoute } from 'astro';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_SCOPES = 'read:user repo';

export const GET: APIRoute = async (context) => {
  try {
    if (!GITHUB_CLIENT_ID) {
      console.error('GITHUB_CLIENT_ID is not set in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID environment variable.',
          details: 'Create a GitHub OAuth App at https://github.com/settings/developers'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const redirectUri = `${context.url.origin}/api/github/callback`;
    const state = Math.random().toString(36).substring(7);
    
    // Store state in localStorage via redirect
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', GITHUB_SCOPES);
    authUrl.searchParams.set('state', state);

    console.log('GitHub auth URL created');

    return new Response(
      JSON.stringify({ 
        url: authUrl.toString(),
        success: true
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('GitHub auth error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to initiate GitHub auth',
        details: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
