'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  size?: number;
  lastModified?: string;
}

interface FileTreeProps {
  files: Record<string, any>;
  onFileSelect?: (path: string) => void;
  selectedPath?: string | null;
  commitCount?: Record<string, number>;
}

export function FileTree({ files, onFileSelect, selectedPath, commitCount = {} }: FileTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const fileTree = useMemo(() => {
    const root: FileNode = {
      name: '/',
      path: '/',
      type: 'dir',
      children: [],
    };

    // Build tree structure from flat file list
    Object.entries(files).forEach(([path, fileInfo]) => {
      const parts = path.split('/');
      let current = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');

        if (!current.children) {
          current.children = [];
        }

        let node = current.children.find(n => n.name === part);

        if (!node) {
          node = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'dir',
            size: isFile ? fileInfo.size : undefined,
          };
          current.children.push(node);
        }

        if (!isFile) {
          current = node;
        }
      });
    });

    // Sort children: directories first, then alphabetically
    const sortChildren = (node: FileNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'dir' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortChildren);
      }
    };

    sortChildren(root);
    return root.children || [];
  }, [files]);

  const filteredTree = useMemo(() => {
    if (!searchQuery) return fileTree;

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.reduce((acc: FileNode[], node) => {
        const matches = node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const filteredChildren = node.children ? filterNodes(node.children) : [];

        if (matches || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children,
          });
        }

        return acc;
      }, []);
    };

    return filterNodes(fileTree);
  }, [fileTree, searchQuery]);

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  };

  const getLanguageColor = (extension: string): string => {
    const colors: Record<string, string> = {
      js: 'bg-yellow-500',
      jsx: 'bg-yellow-500',
      ts: 'bg-blue-500',
      tsx: 'bg-blue-500',
      py: 'bg-green-500',
      java: 'bg-red-500',
      cpp: 'bg-pink-500',
      c: 'bg-gray-500',
      go: 'bg-cyan-500',
      rs: 'bg-orange-500',
      html: 'bg-orange-400',
      css: 'bg-blue-400',
      json: 'bg-gray-400',
      md: 'bg-gray-600',
    };
    return colors[extension] || 'bg-gray-400';
  };

  const renderNode = (node: FileNode, level: number = 0): JSX.Element => {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedPath === node.path;
    const hasCommits = commitCount[node.path] > 0;
    const extension = node.type === 'file' ? getFileExtension(node.name) : '';

    return (
      <div key={node.path}>
        <div
          className={cn(
            'flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-accent rounded-sm transition-colors',
            isSelected && 'bg-accent',
            level > 0 && 'ml-4'
          )}
          onClick={() => {
            if (node.type === 'dir') {
              toggleExpand(node.path);
            } else {
              onFileSelect?.(node.path);
            }
          }}
        >
          {node.type === 'dir' && (
            <button
              className="p-0.5 hover:bg-accent-foreground/10 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.path);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          
          {node.type === 'dir' ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )
          ) : (
            <File className="h-4 w-4 text-gray-500" />
          )}
          
          <span className="text-sm flex-1">{node.name}</span>
          
          {extension && (
            <div className={cn('w-1 h-4 rounded-full', getLanguageColor(extension))} />
          )}
          
          {hasCommits && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {commitCount[node.path]}
            </Badge>
          )}
          
          {node.size && (
            <span className="text-xs text-muted-foreground">
              {(node.size / 1024).toFixed(1)}kb
            </span>
          )}
        </div>
        
        {node.type === 'dir' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Repository Files</CardTitle>
        <Input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2"
        />
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[500px]">
          {filteredTree.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No files found' : 'No files in repository'}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredTree.map(node => renderNode(node))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}