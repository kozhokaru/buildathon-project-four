import { NextRequest } from 'next/server';
import { AnthropicStream, StreamingTextResponse } from 'ai';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { query, context } = await request.json();
    
    if (!query) {
      return new Response('Query is required', { status: 400 });
    }
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response('Anthropic API key not configured', { status: 500 });
    }
    
    const systemPrompt = `You are an AI assistant specialized in analyzing git repository history and code evolution. 
    You have access to commit history, code patterns, and contributor information for the repository: ${context.repository}.
    
    Provide insightful answers about:
    - When and why certain features or patterns were introduced
    - Code evolution and architectural decisions
    - Contributor patterns and code ownership
    - Major refactorings or changes
    - Testing and quality improvements over time
    
    Base your answers on the provided context data. Be specific with commit references when relevant.
    Keep responses concise but informative.`;
    
    const userPrompt = `Repository: ${context.repository}
    
Recent Commits (last 50):
${context.recentCommits.map((c: any) => 
  `- ${c.sha}: "${c.message.split('\n')[0]}" by ${c.author} on ${new Date(c.date).toLocaleDateString()}`
).join('\n')}

Detected Patterns:
- Authentication: ${context.patterns.auth.length} references found
- API/Routes: ${context.patterns.api.length} references found  
- State Management: ${context.patterns.state.length} references found
- Testing: ${context.patterns.testing.length} references found

Top Contributors:
${context.topContributors.map((c: any) => `- ${c.name}: ${c.commits} commits`).join('\n')}

User Question: ${query}`;
    
    const response = await anthropic.messages.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      stream: true,
    });
    
    const stream = AnthropicStream(response);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('Query error:', error);
    return new Response(
      error.message || 'An error occurred while processing your query',
      { status: 500 }
    );
  }
}