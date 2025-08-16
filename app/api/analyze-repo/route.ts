import { NextRequest, NextResponse } from 'next/server';
import GitHubClient from '@/lib/github-client';

export async function POST(request: NextRequest) {
  try {
    const { repoPath, maxCommits = 500 } = await request.json();
    
    if (!repoPath) {
      return NextResponse.json(
        { error: 'Repository path is required' },
        { status: 400 }
      );
    }
    
    const [owner, repo] = repoPath.split('/');
    
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Invalid repository format. Use "owner/repo"' },
        { status: 400 }
      );
    }
    
    const client = new GitHubClient(process.env.GITHUB_TOKEN);
    const analysis = await client.analyzeRepository(owner, repo, maxCommits);
    
    // Convert Map to object for JSON serialization
    const contributorsObj = Object.fromEntries(analysis.contributors);
    const fileTreeObj = Object.fromEntries(
      Array.from(analysis.fileTree.entries()).slice(0, 100) // Limit for initial response
    );
    
    return NextResponse.json({
      repository: analysis.repository,
      commits: analysis.commits,
      totalCommits: analysis.totalCommits,
      contributors: contributorsObj,
      fileTree: fileTreeObj,
      patterns: analysis.patterns,
      rateLimit: client.getRateLimitInfo(),
    });
  } catch (error: any) {
    console.error('Repository analysis error:', error);
    
    if (error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    
    if (error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Repository not found. Please check the URL and ensure it\'s a public repository.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to analyze repository. Please try again.' },
      { status: 500 }
    );
  }
}