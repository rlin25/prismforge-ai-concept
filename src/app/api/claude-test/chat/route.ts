import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RequestBody {
  message: string;
  model?: string;
  conversationHistory?: Message[];
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const body: RequestBody = await request.json();
    const { message, model = 'claude-3-5-sonnet-20241022', conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Build system prompt for testing
    const systemPrompt = `You are Claude, an AI assistant created by Anthropic. You are being tested in a development environment. 

Key instructions:
- Be helpful, harmless, and honest
- Provide clear and informative responses
- When asked to act in specific roles (adversarial, validator, etc.), fully embrace that role while remaining ethical
- For M&A and business analysis questions, provide professional-quality insights
- Include relevant context and reasoning in your responses
- Be concise but thorough

This is a testing environment, so feel free to demonstrate your full capabilities across different domains and roles.`;

    // Prepare messages for the API
    const messages = conversationHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

    messages.push({
      role: 'user',
      content: message,
    });

    const startTime = Date.now();

    // Make the API call to Claude
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 4000,
      temperature: 0.1,
      system: systemPrompt,
      messages: messages,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Extract response content
    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    // Return the response with usage information
    return NextResponse.json({
      response: content,
      tokenUsage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      responseTime,
      model: model,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Claude API error:', error);
    
    if (error instanceof Error && error.message.includes('rate_limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    if (error instanceof Error && error.message.includes('invalid_api_key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to get response from Claude',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    apiKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
}