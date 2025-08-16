'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, GitBranch, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DEMO_REPOS = [
  { value: 'facebook/react', label: 'React - A JavaScript library for building user interfaces' },
  { value: 'vercel/next.js', label: 'Next.js - The React Framework' },
  { value: 'supabase/supabase', label: 'Supabase - Open source Firebase alternative' },
  { value: 'microsoft/vscode', label: 'VS Code - Code editor' },
  { value: 'tailwindlabs/tailwindcss', label: 'Tailwind CSS - Utility-first CSS framework' },
];

interface RepoInputProps {
  onAnalyze: (repoUrl: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function RepoInput({ onAnalyze, isLoading = false, error }: RepoInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const validateGitHubUrl = (url: string): boolean => {
    // Accept formats: owner/repo or full GitHub URL
    const patterns = [
      /^[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_\.]+$/,
      /^https?:\/\/github\.com\/[a-zA-Z0-9\-_]+\/[a-zA-Z0-9\-_\.]+/,
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  const extractRepoPath = (url: string): string => {
    // Extract owner/repo from various formats
    if (url.includes('github.com')) {
      const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
      if (match) {
        return match[1].replace(/\.git$/, '');
      }
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    
    if (!inputValue.trim()) {
      setInputError('Please enter a repository URL or select a demo');
      return;
    }
    
    if (!validateGitHubUrl(inputValue)) {
      setInputError('Invalid format. Use "owner/repo" or a GitHub URL');
      return;
    }
    
    const repoPath = extractRepoPath(inputValue);
    await onAnalyze(repoPath);
  };

  const handleDemoSelect = async (value: string) => {
    if (value && value !== 'placeholder') {
      setInputValue(value);
      setInputError(null);
      await onAnalyze(value);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputError(null);
            }}
            placeholder="Enter GitHub URL (e.g., facebook/react)"
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Repository'
          )}
        </Button>
      </form>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Or try a demo:</span>
        <Select onValueChange={handleDemoSelect} disabled={isLoading}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a demo repository" />
          </SelectTrigger>
          <SelectContent>
            {DEMO_REPOS.map((repo) => (
              <SelectItem key={repo.value} value={repo.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{repo.value}</span>
                  <span className="text-xs text-muted-foreground">{repo.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(inputError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{inputError || error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}