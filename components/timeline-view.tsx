'use client';

import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts';
import { format, parseISO, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { GitHubCommit } from '@/lib/github-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, GitCommit, User } from 'lucide-react';

interface TimelineViewProps {
  commits: GitHubCommit[];
  onCommitSelect?: (commit: GitHubCommit) => void;
  selectedCommit?: GitHubCommit | null;
}

type GroupBy = 'day' | 'week' | 'month';

export function TimelineView({ commits, onCommitSelect, selectedCommit }: TimelineViewProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('week');
  const [hoveredCommit, setHoveredCommit] = useState<GitHubCommit | null>(null);

  const timelineData = useMemo(() => {
    if (!commits || commits.length === 0) return [];

    // Group commits by time period
    const grouped = new Map<string, { date: string; count: number; commits: GitHubCommit[] }>();

    commits.forEach(commit => {
      const date = parseISO(commit.commit.author.date);
      let key: string;
      let groupDate: Date;

      switch (groupBy) {
        case 'day':
          groupDate = startOfDay(date);
          key = format(groupDate, 'yyyy-MM-dd');
          break;
        case 'week':
          groupDate = startOfWeek(date);
          key = format(groupDate, 'yyyy-MM-dd');
          break;
        case 'month':
          groupDate = startOfMonth(date);
          key = format(groupDate, 'yyyy-MM');
          break;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { date: key, count: 0, commits: [] });
      }

      const group = grouped.get(key)!;
      group.count++;
      group.commits.push(commit);
    });

    return Array.from(grouped.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [commits, groupBy]);

  const significantCommits = useMemo(() => {
    // Find commits with high impact (many changes)
    return commits
      .filter(commit => {
        const messageLength = commit.commit.message.length;
        const hasStats = commit.stats && commit.stats.total > 100;
        const isMerge = commit.commit.message.toLowerCase().includes('merge');
        const isRelease = commit.commit.message.toLowerCase().includes('release');
        
        return hasStats || isMerge || isRelease || messageLength > 200;
      })
      .slice(0, 10);
  }, [commits]);

  const formatXAxisTick = (value: string) => {
    switch (groupBy) {
      case 'day':
        return format(new Date(value), 'MMM d');
      case 'week':
        return format(new Date(value), 'MMM d');
      case 'month':
        return format(new Date(value + '-01'), 'MMM yyyy');
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Card className="p-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {formatXAxisTick(data.date)}
            </p>
            <p className="text-2xl font-bold">{data.count} commits</p>
            {data.commits.length > 0 && (
              <div className="pt-2 space-y-1">
                <p className="text-xs text-muted-foreground">Latest commits:</p>
                {data.commits.slice(0, 3).map((commit: GitHubCommit, idx: number) => (
                  <div key={idx} className="text-xs">
                    <span className="font-mono text-muted-foreground">
                      {commit.sha.substring(0, 7)}
                    </span>{' '}
                    {commit.commit.message.split('\n')[0].substring(0, 50)}
                    {commit.commit.message.length > 50 && '...'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      );
    }
    return null;
  };

  const handleDataClick = (data: any) => {
    if (data && data.commits && data.commits.length > 0) {
      // Select the most recent commit from this period
      onCommitSelect?.(data.commits[0]);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Commit Timeline
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={groupBy === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('day')}
              >
                Day
              </Button>
              <Button
                variant={groupBy === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('week')}
              >
                Week
              </Button>
              <Button
                variant={groupBy === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('month')}
              >
                Month
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={timelineData}
              onClick={handleDataClick}
              margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisTick}
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Brush
                dataKey="date"
                height={30}
                stroke="hsl(var(--primary))"
                tickFormatter={formatXAxisTick}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              {selectedCommit && (
                <ReferenceLine
                  x={format(parseISO(selectedCommit.commit.author.date), 
                    groupBy === 'month' ? 'yyyy-MM' : 'yyyy-MM-dd')}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="5 5"
                  label="Selected"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {significantCommits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Significant Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {significantCommits.map((commit) => (
                <div
                  key={commit.sha}
                  className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => onCommitSelect?.(commit)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono">
                        {commit.sha.substring(0, 7)}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(commit.commit.author.date), 'PPp')}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {commit.commit.message.split('\n')[0]}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">
                          {commit.author?.login || commit.commit.author.name}
                        </span>
                      </div>
                      {commit.stats && (
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            +{commit.stats.additions}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            -{commit.stats.deletions}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}