import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const POST: APIRoute = async (context) => {
  try {
    const { accessToken } = await context.request.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Missing GitHub access token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch repositories from GitHub
    const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch GitHub repositories' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const repos = await response.json();

    // Return simplified repo data
    const repoList = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      owner: repo.owner.login,
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        repos: repoList
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error fetching repos:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch repositories',
        success: false
      }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
