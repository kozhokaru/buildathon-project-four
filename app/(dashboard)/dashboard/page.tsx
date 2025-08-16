'use client';

import { useState } from 'react';
import { RepoInput } from '@/components/repo-input';
import { TimelineView } from '@/components/timeline-view';
import { FileTree } from '@/components/file-tree';
import { OwnershipChart } from '@/components/ownership-chart';
import { QueryInterface } from '@/components/query-interface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitBranch, GitCommit, Users, Calendar, Code, TrendingUp, AlertCircle } from 'lucide-react';

interface RepoData {
  repository: any;
  commits: any[];
  totalCommits: number;
  contributors: Record<string, number>;
  fileTree: Record<string, any>;
  patterns: {
    auth: string[];
    api: string[];
    state: string[];
    testing: string[];
  };
  rateLimit?: {
    remaining: number;
    resetTime: string;
  };
}

export default function DashboardPage() {
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleAnalyzeRepo = async (repoPath: string) => {
    setIsLoading(true);
    setError(null);
    setRepoData(null);
    setSelectedCommit(null);
    setSelectedFile(null);

    try {
      const response = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoPath, maxCommits: 500 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze repository');
      }

      const data = await response.json();
      setRepoData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitSelect = (commit: any) => {
    setSelectedCommit(commit);
  };

  const handleFileSelect = (path: string) => {
    setSelectedFile(path);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Repository Input */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Codebase Time Machine</h1>
          <p className="text-muted-foreground">
            Analyze any public GitHub repository to understand its evolution
          </p>
        </div>
        <RepoInput 
          onAnalyze={handleAnalyzeRepo} 
          isLoading={isLoading}
          error={error}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px]" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Repository Data */}
      {repoData && !isLoading && (
        <div className="space-y-6">
          {/* Repository Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <GitBranch className="h-6 w-6" />
                    {repoData.repository.full_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {repoData.repository.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {repoData.repository.language}
                  </Badge>
                  <Badge variant="outline">
                    ⭐ {repoData.repository.stargazers_count.toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitCommit className="h-4 w-4" />
                    <span>Commits</span>
                  </div>
                  <p className="text-2xl font-bold">{repoData.totalCommits}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Contributors</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {Object.keys(repoData.contributors).length}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Code className="h-4 w-4" />
                    <span>Files</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {Object.keys(repoData.fileTree).length}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {new Date(repoData.repository.created_at).getFullYear()}
                  </p>
                </div>
              </div>
              
              {/* Pattern Detection Summary */}
              {(repoData.patterns.auth.length > 0 || 
                repoData.patterns.api.length > 0 ||
                repoData.patterns.state.length > 0 ||
                repoData.patterns.testing.length > 0) && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Detected Patterns:</p>
                  <div className="flex flex-wrap gap-2">
                    {repoData.patterns.auth.length > 0 && (
                      <Badge variant="outline">
                        🔐 Auth ({repoData.patterns.auth.length})
                      </Badge>
                    )}
                    {repoData.patterns.api.length > 0 && (
                      <Badge variant="outline">
                        🌐 API ({repoData.patterns.api.length})
                      </Badge>
                    )}
                    {repoData.patterns.state.length > 0 && (
                      <Badge variant="outline">
                        📦 State ({repoData.patterns.state.length})
                      </Badge>
                    )}
                    {repoData.patterns.testing.length > 0 && (
                      <Badge variant="outline">
                        🧪 Testing ({repoData.patterns.testing.length})
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Timeline and Ownership */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="timeline" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="ownership">Ownership</TabsTrigger>
                </TabsList>
                <TabsContent value="timeline" className="mt-4">
                  <TimelineView
                    commits={repoData.commits}
                    onCommitSelect={handleCommitSelect}
                    selectedCommit={selectedCommit}
                  />
                </TabsContent>
                <TabsContent value="ownership" className="mt-4">
                  <OwnershipChart
                    contributors={repoData.contributors}
                    fileOwnership={{}}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - File Tree and Details */}
            <div className="space-y-6">
              <FileTree
                files={repoData.fileTree}
                onFileSelect={handleFileSelect}
                selectedPath={selectedFile}
              />
              
              {selectedCommit && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Selected Commit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">SHA</p>
                      <code className="text-sm">{selectedCommit.sha.substring(0, 7)}</code>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Message</p>
                      <p className="text-sm">{selectedCommit.commit.message.split('\n')[0]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Author</p>
                      <p className="text-sm">
                        {selectedCommit.author?.login || selectedCommit.commit.author.name}
                      </p>
                    </div>
                    {selectedCommit.stats && (
                      <div className="flex gap-2 pt-2">
                        <Badge variant="secondary" className="text-xs">
                          +{selectedCommit.stats.additions}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          -{selectedCommit.stats.deletions}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* AI Query Interface */}
          <div className="h-[600px]">
            <QueryInterface repoData={repoData} />
          </div>

          {/* Rate Limit Warning */}
          {repoData.rateLimit && repoData.rateLimit.remaining < 10 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                GitHub API rate limit warning: {repoData.rateLimit.remaining} requests remaining.
                Resets at {repoData.rateLimit.resetTime}.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}