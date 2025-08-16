import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthButton } from "@/components/auth-button"
import { ArrowRight, GitBranch, Clock, Brain, BarChart3, Search, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <Clock className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Codebase Time Machine
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#tech"
              >
                Tech Stack
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="https://github.com"
                target="_blank"
              >
                GitHub
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            <nav className="flex items-center">
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background"></div>
        <div className="container relative">
          <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                Codebase
                <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"> Time Machine</span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Understand how code evolved and why decisions were made. Analyze any GitHub repository's 
                history with AI-powered insights and beautiful visualizations.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Analyze Repository <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="https://github.com" target="_blank">
                  <Button size="lg" variant="outline">
                    View on GitHub
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  <span>Git History Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>Visual Evolution</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Powerful Analysis Features
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Deep dive into any codebase's evolution with interactive visualizations and AI assistance.
          </p>
        </div>
        <div className="mx-auto grid gap-4 md:grid-cols-3 mt-12">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Git History Analysis</CardTitle>
              <CardDescription>
                Interactive timeline showing commit patterns over time. 
                Identify major changes, refactors, and feature introductions.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Commit timeline visualization</li>
                <li>• File evolution tracking</li>
                <li>• Pattern detection</li>
                <li>• Change impact analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Q&A</CardTitle>
              <CardDescription>
                Natural language queries about code evolution. 
                Understand why changes were made and when patterns emerged.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "When was auth added?"</li>
                <li>• "Why did they refactor?"</li>
                <li>• "Who owns this module?"</li>
                <li>• "Show pattern evolution"</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Ownership Visualization</CardTitle>
              <CardDescription>
                See who contributed to each part of the codebase. 
                Interactive treemaps and charts showing code ownership.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Contributor analysis</li>
                <li>• Module ownership</li>
                <li>• Activity heatmaps</li>
                <li>• Team insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="container py-20 border-t">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Supported Repositories
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Analyze any public GitHub repository or try our demo repos
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <GitBranch className="h-4 w-4" />
              <span className="font-mono text-sm">facebook/react</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <GitBranch className="h-4 w-4" />
              <span className="font-mono text-sm">vercel/next.js</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <GitBranch className="h-4 w-4" />
              <span className="font-mono text-sm">supabase/supabase</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <GitBranch className="h-4 w-4" />
              <span className="font-mono text-sm">microsoft/vscode</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <GitBranch className="h-4 w-4" />
              <span className="font-mono text-sm">tailwindlabs/tailwindcss</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Search className="h-4 w-4" />
              <span className="font-mono text-sm">Any Public Repo</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 text-center rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold">Ready to Explore?</h2>
          <p className="text-muted-foreground">
            Discover the story behind any codebase. See how great projects evolved over time.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/dashboard">
              <Button size="lg">Start Analyzing</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Clock className="h-5 w-5" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Travel through code history. Built for developers who want to understand, not just use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}