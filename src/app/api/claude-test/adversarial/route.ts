import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface ConversationMessage {
  agent: string;
  content: string;
}

interface RequestBody {
  prompt: string;
  conversationHistory?: ConversationMessage[];
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
    const { prompt, conversationHistory = [] } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Dynamic debate process with disagreement detection
    const rounds: Array<{agent: string, round: number, content: string}> = [];
    let totalTokens = 0;

    // Build context from conversation history (including single-agent Claude responses)
    const contextString = conversationHistory.length > 0 
      ? `\nPREVIOUS CONVERSATION CONTEXT:\n${conversationHistory.map((msg: ConversationMessage) => {
          const agentName = msg.agent === 'assistant' ? 'CLAUDE' : msg.agent.toUpperCase();
          return `${agentName}: ${msg.content}`;
        }).join('\n\n')}\n\n`
      : '';

    // Round 1: Skeptic opens with concerns (debate mode)
    const skepticOpeningPrompt = `You are the SKEPTIC AGENT in a debate that may or may not reach consensus. Your primary role is to identify genuine risks and flaws, even if others disagree with you.
${contextString}
CURRENT SCENARIO/QUESTION: ${prompt}

ROUND 1 - Risk Assessment:
${conversationHistory.length > 0 
  ? 'Building on our previous discussion, analyze this new input and present your honest assessment of risks and concerns. You may disagree with previous viewpoints if warranted. Focus on:'
  : 'Present your honest assessment of risks and potential problems with this scenario. Be direct about concerns that others might overlook. Focus on:'
}
- Material risks that could cause failure
- Questionable assumptions that need challenge
- Areas where optimism may be misplaced
- Critical failure points to consider

Be direct and honest. If you see problems, say so clearly. Keep your response to 3-4 concise sentences.`;

    const skepticRound1 = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      temperature: 0.2,
      system: skepticOpeningPrompt,
      messages: [{ role: 'user', content: 'Present your risk assessment for debate analysis.' }]
    });

    const skepticR1Content = skepticRound1.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    totalTokens += skepticRound1.usage.input_tokens + skepticRound1.usage.output_tokens;
    rounds.push({ agent: 'skeptic', round: 1, content: skepticR1Content });

    // Round 2: Validator responds with counter-analysis
    const validatorResponsePrompt = `You are the VALIDATOR AGENT who may disagree with the Skeptic's assessment. Your role is to provide an honest counter-perspective, not just agree for the sake of consensus.
${contextString}
CURRENT SCENARIO/QUESTION: ${prompt}

SKEPTIC'S LATEST RISK ASSESSMENT:
${skepticR1Content}

ROUND 2 - Counter-Analysis:
${conversationHistory.length > 0 
  ? 'Considering our previous discussion and the Skeptic\'s latest assessment, provide your honest counter-perspective. You may disagree if you see it differently. Address:'
  : 'Provide your honest assessment of the Skeptic\'s concerns. Agree where valid, but disagree where you see it differently. Address:'
}
- Which risks you think are overstated or understated
- Alternative perspectives on the assumptions questioned
- Opportunities or strengths the Skeptic may have missed
- Where you fundamentally agree or disagree with their analysis

Be honest about your disagreements. Consensus isn't required. Keep your response to 3-4 concise sentences.`;

    const validatorRound2 = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 400,
      temperature: 0.2,
      system: validatorResponsePrompt,
      messages: [{ role: 'user', content: 'Provide your counter-analysis of the Skeptic\'s assessment.' }]
    });

    const validatorR2Content = validatorRound2.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    totalTokens += validatorRound2.usage.input_tokens + validatorRound2.usage.output_tokens;
    rounds.push({ agent: 'validator', round: 2, content: validatorR2Content });

    // Function to detect if agents disagree
    const detectDisagreement = (skepticContent: string, validatorContent: string): boolean => {
      const disagreementKeywords = [
        'disagree', 'however', 'but', 'on the contrary', 'alternatively', 'different view',
        'overstated', 'understated', 'not convinced', 'skeptical', 'doubt', 'question',
        'wrong', 'incorrect', 'flawed', 'misguided', 'overlook', 'miss', 'overblown',
        'exaggerated', 'unfounded', 'challenge', 'dispute', 'contrary'
      ];
      
      const validatorLower = validatorContent.toLowerCase();
      return disagreementKeywords.some(keyword => validatorLower.includes(keyword));
    };

    const hasDisagreement = detectDisagreement(skepticR1Content, validatorR2Content);
    
    if (hasDisagreement) {
      // Additional debate round when there's disagreement
      const skepticDebatePrompt = `You are the SKEPTIC AGENT continuing the debate. The Validator has challenged some of your points.
${contextString}
CURRENT SCENARIO/QUESTION: ${prompt}

YOUR PREVIOUS ASSESSMENT:
${skepticR1Content}

VALIDATOR'S COUNTER-ANALYSIS:
${validatorR2Content}

ROUND 3 - Skeptic Rebuttal:
The Validator has disagreed with some of your concerns. Respond to their counter-analysis:
- Defend your position where you still believe you're right
- Acknowledge any valid points they made
- Clarify any misunderstandings of your original concerns
- Present additional evidence for your most important points

Stand your ground where warranted, but be fair. Keep response to 3-4 concise sentences.`;

      const skepticDebateRound = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.2,
        system: skepticDebatePrompt,
        messages: [{ role: 'user', content: 'Respond to the Validator\'s counter-analysis.' }]
      });

      const skepticDebateContent = skepticDebateRound.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('\n');

      totalTokens += skepticDebateRound.usage.input_tokens + skepticDebateRound.usage.output_tokens;
      rounds.push({ agent: 'skeptic', round: 3, content: skepticDebateContent });

      // Validator's final response to the debate
      const validatorDebatePrompt = `You are the VALIDATOR AGENT making your final argument in this debate.
${contextString}
CURRENT SCENARIO/QUESTION: ${prompt}

FULL DEBATE HISTORY:
SKEPTIC (Round 1): ${skepticR1Content}
YOUR COUNTER (Round 2): ${validatorR2Content}
SKEPTIC REBUTTAL (Round 3): ${skepticDebateContent}

ROUND 4 - Validator Final Position:
Provide your final position in this debate:
- Address the Skeptic's rebuttal points
- Reinforce your strongest arguments
- Acknowledge where they may have valid points
- State your final recommendation despite any remaining disagreements

This is your final word in the debate. Keep response to 3-4 concise sentences.`;

      const validatorDebateRound = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.2,
        system: validatorDebatePrompt,
        messages: [{ role: 'user', content: 'Make your final argument in this debate.' }]
      });

      const validatorDebateContent = validatorDebateRound.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('\n');

      totalTokens += validatorDebateRound.usage.input_tokens + validatorDebateRound.usage.output_tokens;
      rounds.push({ agent: 'validator', round: 4, content: validatorDebateContent });

      // Round 5: Final Skeptic closing argument
      const skepticFinalPrompt = `You are the SKEPTIC AGENT making your final closing argument in this extended debate.
${contextString}
CURRENT SCENARIO/QUESTION: ${prompt}

COMPLETE DEBATE HISTORY:
SKEPTIC (Round 1): ${skepticR1Content}
VALIDATOR (Round 2): ${validatorR2Content}
SKEPTIC (Round 3): ${skepticDebateContent}
VALIDATOR (Round 4): ${validatorDebateContent}

ROUND 5 - Skeptic Closing Argument:
This is your final opportunity to make your case. Provide your closing argument:
- Summarize your strongest concerns that remain unaddressed
- Explain why the Validator's points don't fully resolve the risks
- Present your final recommendation despite the disagreement
- Acknowledge any areas where you might be willing to compromise

This is your closing statement in the debate. Keep response to 3-4 concise sentences.`;

      const skepticFinalRound = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.2,
        system: skepticFinalPrompt,
        messages: [{ role: 'user', content: 'Make your final closing argument in this debate.' }]
      });

      const skepticFinalContent = skepticFinalRound.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('\n');

      totalTokens += skepticFinalRound.usage.input_tokens + skepticFinalRound.usage.output_tokens;
      rounds.push({ agent: 'skeptic', round: 5, content: skepticFinalContent });

      // Round 6: Validator final response to close the debate
      const validatorFinalPrompt = `You are the VALIDATOR AGENT delivering the final word in this extended debate.
${contextString}
CURRENT SCENARIO/QUESTION: ${prompt}

COMPLETE DEBATE HISTORY:
SKEPTIC (Round 1): ${skepticR1Content}
VALIDATOR (Round 2): ${validatorR2Content}
SKEPTIC (Round 3): ${skepticDebateContent}
VALIDATOR (Round 4): ${validatorDebateContent}
SKEPTIC (Round 5): ${skepticFinalContent}

ROUND 6 - Validator Final Response:
As the final speaker in this debate, provide your ultimate response:
- Address the Skeptic's closing argument
- Reaffirm your strongest points that counter their concerns
- Present your final recommendation for this scenario
- Acknowledge the value of the debate process itself

You have the final word. Keep response to 3-4 concise sentences.`;

      const validatorFinalRound = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.2,
        system: validatorFinalPrompt,
        messages: [{ role: 'user', content: 'Deliver your final response to close this debate.' }]
      });

      const validatorFinalContent = validatorFinalRound.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('\n');

      totalTokens += validatorFinalRound.usage.input_tokens + validatorFinalRound.usage.output_tokens;
      rounds.push({ agent: 'validator', round: 6, content: validatorFinalContent });

      return NextResponse.json({
        rounds: rounds,
        consensusReached: false,
        debateOutcome: 'disagreement_maintained',
        conversationFlow: {
          round1: { agent: 'skeptic', focus: 'Risk Assessment', content: skepticR1Content },
          round2: { agent: 'validator', focus: 'Counter-Analysis', content: validatorR2Content },
          round3: { agent: 'skeptic', focus: 'Rebuttal', content: skepticDebateContent },
          round4: { agent: 'validator', focus: 'Final Position', content: validatorDebateContent },
          round5: { agent: 'skeptic', focus: 'Closing Argument', content: skepticFinalContent },
          round6: { agent: 'validator', focus: 'Final Response', content: validatorFinalContent }
        },
        tokenUsage: {
          totalTokens: totalTokens,
          roundsCount: 6,
          debateRounds: 6
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Round 3: Attempt consensus (only if no major disagreement)
    const consensusPrompt = `You are working together to find common ground after your exchange.
${contextString}
CURRENT SCENARIO/QUESTION: ${prompt}

LATEST DIALOGUE:
SKEPTIC (Round 1): ${skepticR1Content}
VALIDATOR (Round 2): ${validatorR2Content}

ROUND 3 - Finding Common Ground:
${conversationHistory.length > 0 
  ? 'Building on our ongoing conversation and this latest exchange, try to find areas of agreement and practical next steps. Focus on:'
  : 'Try to find areas of agreement between your perspectives and create a practical path forward. Focus on:'
}
- Points where both perspectives align
- Practical steps that address the most critical concerns
- A balanced approach that incorporates both viewpoints
- Next steps that both agents could support

Focus on genuine common ground, not forced agreement. Keep response to 2-3 concise sentences.`;

    // Let Skeptic provide consensus first, then Validator
    const skepticConsensus = await anthropic.messages.create({
      model: 'claude-4-sonnet-20250514',
      max_tokens: 300,
      temperature: 0.1,
      system: `${consensusPrompt}

Provide your consensus focusing on risk-aware implementation. Speak naturally without labeling your response.`,
      messages: [{ role: 'user', content: 'Contribute to finding common ground with risk-aware recommendations.' }]
    });

    const skepticR3Content = skepticConsensus.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    totalTokens += skepticConsensus.usage.input_tokens + skepticConsensus.usage.output_tokens;
    rounds.push({ agent: 'skeptic', round: 3, content: skepticR3Content });

    const validatorConsensus = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      temperature: 0.1,
      system: `${consensusPrompt}

SKEPTIC'S CONSENSUS INPUT: ${skepticR3Content}

Complete the consensus by integrating the Skeptic's input with strategic execution. Speak naturally without labeling your response.`,
      messages: [{ role: 'user', content: 'Complete the consensus with integrated strategic recommendations.' }]
    });

    const validatorR3Content = validatorConsensus.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    totalTokens += validatorConsensus.usage.input_tokens + validatorConsensus.usage.output_tokens;
    rounds.push({ agent: 'validator', round: 3, content: validatorR3Content });

    return NextResponse.json({
      rounds: rounds,
      consensusReached: true,
      debateOutcome: 'consensus_achieved',
      conversationFlow: {
        round1: { agent: 'skeptic', focus: 'Risk Assessment', content: skepticR1Content },
        round2: { agent: 'validator', focus: 'Counter-Analysis', content: validatorR2Content },
        round3: [
          { agent: 'skeptic', focus: 'Finding Common Ground', content: skepticR3Content },
          { agent: 'validator', focus: 'Final Synthesis', content: validatorR3Content }
        ]
      },
      tokenUsage: {
        totalTokens: totalTokens,
        roundsCount: 4,
        consensusRounds: 2
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Adversarial API error:', error);
    
    if (error instanceof Error && error.message.includes('rate_limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to get adversarial response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}