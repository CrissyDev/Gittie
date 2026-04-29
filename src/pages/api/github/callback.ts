import type { APIRoute } from 'astro';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export const GET: APIRoute = async (context) => {
  try {
    const code = context.url.searchParams.get('code');
    const state = context.url.searchParams.get('state');

    if (!code) {
      return new Response(
        'Authorization failed: no code provided',
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: `${context.url.origin}/api/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(
        `Authorization failed: ${tokenData.error}`,
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // Redirect back to create page with access token
    return context.redirect(`/create?githubToken=${accessToken}`);
  } catch (error: any) {
    console.error('GitHub callback error:', error);
    return new Response(
      'Authorization failed',
      { status: 500 }
    );
  }
};
