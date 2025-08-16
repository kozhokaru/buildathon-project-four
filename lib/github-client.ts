export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author?: {
    login: string;
    avatar_url: string;
  };
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  default_branch: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface RepoAnalysis {
  repository: GitHubRepo;
  commits: GitHubCommit[];
  totalCommits: number;
  contributors: Map<string, number>;
  fileTree: Map<string, GitHubFile>;
  patterns: {
    auth: string[];
    api: string[];
    state: string[];
    testing: string[];
  };
}

class GitHubClient {
  private baseUrl = 'https://api.github.com';
  private headers: HeadersInit;
  private rateLimit = {
    remaining: 60,
    reset: 0,
  };

  constructor(token?: string) {
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Codebase-Time-Machine',
    };
    
    if (token) {
      this.headers['Authorization'] = `token ${token}`;
    }
  }

  private async fetchWithRateLimit(url: string): Promise<Response> {
    const response = await fetch(url, { headers: this.headers });
    
    // Update rate limit info
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (remaining) this.rateLimit.remaining = parseInt(remaining);
    if (reset) this.rateLimit.reset = parseInt(reset) * 1000;
    
    if (response.status === 403 && this.rateLimit.remaining === 0) {
      const resetDate = new Date(this.rateLimit.reset);
      throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate.toLocaleTimeString()}`);
    }
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    return response;
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}`;
    const response = await this.fetchWithRateLimit(url);
    return response.json();
  }

  async getCommits(
    owner: string, 
    repo: string, 
    options: { 
      page?: number; 
      perPage?: number; 
      since?: string;
      until?: string;
      path?: string;
    } = {}
  ): Promise<GitHubCommit[]> {
    const { page = 1, perPage = 100, since, until, path } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (since) params.append('since', since);
    if (until) params.append('until', until);
    if (path) params.append('path', path);
    
    const url = `${this.baseUrl}/repos/${owner}/${repo}/commits?${params}`;
    const response = await this.fetchWithRateLimit(url);
    return response.json();
  }

  async getCommitDetails(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`;
    const response = await this.fetchWithRateLimit(url);
    return response.json();
  }

  async getFileContent(
    owner: string, 
    repo: string, 
    path: string, 
    ref?: string
  ): Promise<GitHubFile> {
    const params = ref ? `?ref=${ref}` : '';
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}${params}`;
    const response = await this.fetchWithRateLimit(url);
    return response.json();
  }

  async getFileTree(
    owner: string, 
    repo: string, 
    treeSha: string = 'HEAD'
  ): Promise<GitHubFile[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`;
    const response = await this.fetchWithRateLimit(url);
    const data = await response.json();
    return data.tree || [];
  }

  async getContributors(owner: string, repo: string): Promise<Array<{
    login: string;
    avatar_url: string;
    contributions: number;
  }>> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contributors?per_page=100`;
    const response = await this.fetchWithRateLimit(url);
    return response.json();
  }

  async analyzeRepository(owner: string, repo: string, maxCommits: number = 500): Promise<RepoAnalysis> {
    try {
      // Fetch repository info
      const repository = await this.getRepository(owner, repo);
      
      // Fetch commits (with pagination if needed)
      const commits: GitHubCommit[] = [];
      let page = 1;
      const perPage = 100;
      
      while (commits.length < maxCommits) {
        const batch = await this.getCommits(owner, repo, { page, perPage });
        if (batch.length === 0) break;
        
        commits.push(...batch);
        if (batch.length < perPage) break;
        page++;
      }
      
      // Analyze contributors
      const contributors = new Map<string, number>();
      commits.forEach(commit => {
        const author = commit.author?.login || commit.commit.author.name;
        contributors.set(author, (contributors.get(author) || 0) + 1);
      });
      
      // Get file tree (latest)
      const fileTree = new Map<string, GitHubFile>();
      try {
        const tree = await this.getFileTree(owner, repo, repository.default_branch);
        tree.forEach(file => {
          if (file.type === 'blob') {
            fileTree.set(file.path, file as GitHubFile);
          }
        });
      } catch (error) {
        console.warn('Could not fetch file tree:', error);
      }
      
      // Detect patterns in commit messages and file names
      const patterns = this.detectPatterns(commits, Array.from(fileTree.keys()));
      
      return {
        repository,
        commits: commits.slice(0, maxCommits),
        totalCommits: commits.length,
        contributors,
        fileTree,
        patterns,
      };
    } catch (error) {
      console.error('Repository analysis failed:', error);
      throw error;
    }
  }

  private detectPatterns(commits: GitHubCommit[], filePaths: string[]): RepoAnalysis['patterns'] {
    const patterns = {
      auth: [] as string[],
      api: [] as string[],
      state: [] as string[],
      testing: [] as string[],
    };
    
    const authKeywords = ['auth', 'login', 'signin', 'signup', 'token', 'session', 'oauth'];
    const apiKeywords = ['api', 'endpoint', 'route', 'rest', 'graphql', 'fetch'];
    const stateKeywords = ['redux', 'context', 'store', 'state', 'zustand', 'mobx'];
    const testingKeywords = ['test', 'spec', 'jest', 'vitest', 'cypress', 'playwright'];
    
    // Check commit messages
    commits.forEach(commit => {
      const message = commit.commit.message.toLowerCase();
      
      if (authKeywords.some(kw => message.includes(kw))) {
        patterns.auth.push(`Commit: ${commit.sha.substring(0, 7)} - ${commit.commit.message.split('\n')[0]}`);
      }
      if (apiKeywords.some(kw => message.includes(kw))) {
        patterns.api.push(`Commit: ${commit.sha.substring(0, 7)} - ${commit.commit.message.split('\n')[0]}`);
      }
      if (stateKeywords.some(kw => message.includes(kw))) {
        patterns.state.push(`Commit: ${commit.sha.substring(0, 7)} - ${commit.commit.message.split('\n')[0]}`);
      }
      if (testingKeywords.some(kw => message.includes(kw))) {
        patterns.testing.push(`Commit: ${commit.sha.substring(0, 7)} - ${commit.commit.message.split('\n')[0]}`);
      }
    });
    
    // Check file paths
    filePaths.forEach(path => {
      const pathLower = path.toLowerCase();
      
      if (authKeywords.some(kw => pathLower.includes(kw))) {
        patterns.auth.push(`File: ${path}`);
      }
      if (apiKeywords.some(kw => pathLower.includes(kw)) || pathLower.includes('/api/')) {
        patterns.api.push(`File: ${path}`);
      }
      if (stateKeywords.some(kw => pathLower.includes(kw))) {
        patterns.state.push(`File: ${path}`);
      }
      if (testingKeywords.some(kw => pathLower.includes(kw)) || path.includes('.test.') || path.includes('.spec.')) {
        patterns.testing.push(`File: ${path}`);
      }
    });
    
    // Limit to unique entries
    Object.keys(patterns).forEach(key => {
      patterns[key as keyof typeof patterns] = [...new Set(patterns[key as keyof typeof patterns])].slice(0, 10);
    });
    
    return patterns;
  }

  getRateLimitInfo() {
    return {
      remaining: this.rateLimit.remaining,
      resetTime: new Date(this.rateLimit.reset).toLocaleTimeString(),
    };
  }
}

export const githubClient = new GitHubClient(process.env.GITHUB_TOKEN);
export default GitHubClient;