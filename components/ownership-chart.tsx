'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Treemap,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp } from 'lucide-react';

interface OwnershipChartProps {
  contributors: Record<string, number>;
  fileOwnership?: Record<string, Record<string, number>>;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F59E0B',
  '#EF4444',
];

export function OwnershipChart({ contributors, fileOwnership = {} }: OwnershipChartProps) {
  const contributorData = useMemo(() => {
    const sorted = Object.entries(contributors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    const total = sorted.reduce((sum, [, count]) => sum + count, 0);
    
    return sorted.map(([name, count], index) => ({
      name,
      value: count,
      percentage: ((count / total) * 100).toFixed(1),
      color: COLORS[index % COLORS.length],
    }));
  }, [contributors]);

  const treemapData = useMemo(() => {
    // Convert file ownership to treemap format
    const modules: Record<string, { files: number; commits: number; contributors: Set<string> }> = {};
    
    Object.entries(fileOwnership).forEach(([path, owners]) => {
      const module = path.split('/')[0] || 'root';
      if (!modules[module]) {
        modules[module] = { files: 0, commits: 0, contributors: new Set() };
      }
      modules[module].files++;
      Object.entries(owners).forEach(([contributor, count]) => {
        modules[module].commits += count;
        modules[module].contributors.add(contributor);
      });
    });
    
    return Object.entries(modules)
      .map(([name, data]) => ({
        name,
        size: data.commits,
        files: data.files,
        contributors: data.contributors.size,
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 15);
  }, [fileOwnership]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <Card className="p-3">
          <div className="space-y-1">
            <p className="font-medium">{data.name}</p>
            <p className="text-sm">
              <span className="font-semibold">{data.value || data.size}</span> commits
            </p>
            {data.percentage && (
              <p className="text-sm text-muted-foreground">
                {data.percentage}% of total
              </p>
            )}
            {data.files && (
              <p className="text-sm text-muted-foreground">
                {data.files} files, {data.contributors} contributors
              </p>
            )}
          </div>
        </Card>
      );
    }
    return null;
  };

  const CustomTreemapContent = ({ x, y, width, height, name, size }: any) => {
    const fontSize = Math.min(width / name.length, height / 3, 14);
    const showText = width > 50 && height > 30;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={COLORS[Math.floor(Math.random() * COLORS.length)]}
          stroke="#fff"
          strokeWidth={2}
          opacity={0.8}
        />
        {showText && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - fontSize / 2}
              textAnchor="middle"
              fill="#fff"
              fontSize={fontSize}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + fontSize}
              textAnchor="middle"
              fill="#fff"
              fontSize={fontSize * 0.8}
            >
              {size} commits
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Code Ownership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="contributors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
              <TabsTrigger value="modules">Module Ownership</TabsTrigger>
            </TabsList>
            
            <TabsContent value="contributors" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={contributorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contributorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Contribution Breakdown
                  </h3>
                  {contributorData.map((contributor, index) => (
                    <div key={contributor.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: contributor.color }}
                      />
                      <span className="flex-1 text-sm truncate">
                        {contributor.name}
                      </span>
                      <span className="text-sm font-medium">
                        {contributor.value} commits
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({contributor.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="modules">
              {treemapData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomTreemapContent />}
                  >
                    <Tooltip content={<CustomTooltip />} />
                  </Treemap>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No module ownership data available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Activity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">{Object.keys(contributors).length}</p>
              <p className="text-xs text-muted-foreground">Total Contributors</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {contributorData[0]?.value || 0}
              </p>
              <p className="text-xs text-muted-foreground">Top Contributor Commits</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {Math.round(
                  Object.values(contributors).reduce((a, b) => a + b, 0) /
                  Object.keys(contributors).length
                ) || 0}
              </p>
              <p className="text-xs text-muted-foreground">Avg Commits/Person</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {contributorData.slice(0, 3).reduce((sum, c) => sum + parseFloat(c.percentage), 0).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Top 3 Contributors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}