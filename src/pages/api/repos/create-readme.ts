import type { APIRoute } from 'astro';

async function fetchGitHubRepo(username: string, repoName: string) {
  const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
  
  if (!response.ok) {
    throw new Error('Repository not found on GitHub');
  }

  return await response.json();
}

function generateReadme(repoData: any, description: string): string {
  const name = repoData.name || '';
  const ghDescription = repoData.description || description || '';
  const homepage = repoData.homepage || '';
  const topics = repoData.topics || [];
  const language = repoData.language || '';
  const cloneUrl = repoData.clone_url || '';

  const topicsSection = topics.length > 0 
    ? `\n## Topics\n\n${topics.map((t: string) => `\`${t}\``).join(', ')}\n`
    : '';

  const languageSection = language
    ? `\n## Built With\n\n- **${language}**\n`
    : '';

  let readme = `# ${name}\n\n`;
  
  if (ghDescription) {
    readme += `${ghDescription}\n\n`;
  }

  readme += `## Getting Started\n\n`;
  
  readme += `### Prerequisites\n\n`;
  readme += `- Node.js (v14 or higher)\n`;
  readme += `- npm or yarn\n\n`;

  readme += `### Installation\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `# Clone the repository\n`;
  readme += `git clone ${cloneUrl}\n`;
  readme += `cd ${name}\n\n`;
  readme += `# Install dependencies\n`;
  readme += `npm install\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Usage\n\n`;
  readme += `\`\`\`bash\n`;
  readme += `npm start\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Features\n\n`;
  readme += `- Feature 1\n`;
  readme += `- Feature 2\n`;
  readme += `- Feature 3\n`;

  readme += languageSection;

  readme += `## Project Structure\n\n`;
  readme += `\`\`\`\n`;
  readme += `.\n`;
  readme += `├── src/\n`;
  readme += `├── public/\n`;
  readme += `├── package.json\n`;
  readme += `└── README.md\n`;
  readme += `\`\`\`\n\n`;

  readme += `## Contributing\n\n`;
  readme += `Contributions are welcome! Please feel free to submit a Pull Request.\n\n`;

  readme += `## License\n\n`;
  readme += `This project is licensed under the MIT License - see the LICENSE file for details.\n\n`;

  readme += `## Contact\n\n`;
  readme += `For more information, visit [GitHub Profile](https://github.com/${repoData.owner?.login || 'username'})\n`;

  if (homepage) {
    readme += `\nWebsite: [${homepage}](${homepage})\n`;
  }

  readme += topicsSection;

  return readme;
}

export const POST: APIRoute = async (context) => {
  try {
    const data = await context.request.json();
    const { githubUsername, repoName, description } = data;

    // Validate inputs
    if (!githubUsername || !repoName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: githubUsername and repoName' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch repo from GitHub
    const repoData = await fetchGitHubRepo(githubUsername, repoName);

    // Generate README
    const readme = generateReadme(repoData, description || '');

    return new Response(
      JSON.stringify({ 
        success: true,
        readme: readme,
        repoInfo: {
          name: repoData.name,
          url: repoData.html_url,
          description: repoData.description,
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to generate README';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};
