'use client';

import { useState, useEffect } from 'react';
import '@/styles/claude-test.css';
import {
  Button,
  TextInput,
  Toggle,
  Loading,
  Tile,
  Tag,
  Content,
  Grid,
  Column,
  Theme,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  InlineNotification,
} from '@carbon/react';
import {
  Send,
  TrashCan,
  Analytics,
  UserAvatar,
  Watson,
  ChatBot,
  Collaborate,
} from '@carbon/icons-react';

interface UnifiedMessage {
  id: string;
  role: 'user' | 'assistant' | 'skeptic' | 'validator';
  content: string;
  timestamp: number;
  round?: number;
  isMultiAgent: boolean;
  tokenUsage?: {
    totalTokens: number;
    inputTokens?: number;
    outputTokens?: number;
    roundsCount?: number;
    debateOutcome?: string;
  };
}

export default function ClaudeTestPage() {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [adversarialMode, setAdversarialMode] = useState(false);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingTexts = adversarialMode ? [
    'Agents are analyzing your scenario...',
    'Building consensus through discussion...',
    'Weighing different perspectives...',
    'Evaluating strengths and concerns...',
    'Synthesizing viewpoints...',
    'Working toward balanced solution...',
    'Analyzing trade-offs and risks...',
    'Assessing implementation approaches...',
    'Exploring alternative strategies...',
    'Challenging underlying assumptions...',
    'Seeking common ground...',
    'Deliberating on optimal path...',
    'Comparing strategic options...',
    'Testing key hypotheses...',
    'Validating critical concerns...',
    'Negotiating balanced positions...',
    'Examining supporting evidence...',
    'Balancing competing priorities...',
    'Investigating broader implications...',
    'Reconciling different viewpoints...',
    'Scrutinizing implementation details...',
    'Debating solution merits...',
    'Contrasting approaches...',
  ] : [
    'Claude is thinking about your question...',
    'Analyzing the context and details...',
    'Processing information carefully...',
    'Considering multiple angles...',
    'Reflecting on the best approach...',
    'Formulating a thoughtful response...',
    'Contemplating nuanced aspects...',
    'Examining relevant factors...',
    'Evaluating different possibilities...',
    'Reasoning through the problem...',
    'Deliberating on key points...',
    'Pondering the implications...',
    'Calculating optimal solutions...',
    'Assessing various options...',
    'Investigating deeper meanings...',
    'Exploring connections...',
    'Synthesizing complex information...',
    'Computing the best response...',
    'Deducing logical conclusions...',
    'Interpreting your requirements...',
    'Composing a helpful answer...',
    'Constructing clear explanations...',
    'Generating comprehensive insights...',
    'Crafting precise guidance...',
    'Developing actionable advice...',
    'Researching relevant details...',
    'Parsing complex concepts...',
    'Conceptualizing solutions...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingTexts.length]);

  // Effect to remove any remaining unwanted text from DOM
  useEffect(() => {
    const removeUnwantedText = () => {
      const problematicPhrases = [
        'Skip to main content',
        'PrismForge AI Strategy Assistant Analytics Dashboard'
      ];
      
      // Function to walk through all text nodes and hide elements containing unwanted text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      const elementsToHide = new Set();
      
      while (node = walker.nextNode()) {
        const text = node.textContent?.trim();
        if (text) {
          for (const phrase of problematicPhrases) {
            if (text.includes(phrase)) {
              // Find the closest element to hide
              let element = node.parentElement;
              while (element && element !== document.body) {
                // Don't hide essential elements
                if (element.tagName === 'MAIN' || element.tagName === 'ARTICLE' || 
                    element.id === 'main-content' || element.className?.includes('main')) {
                  break;
                }
                elementsToHide.add(element);
                element = element.parentElement;
              }
            }
          }
        }
      }
      
      // Hide the identified elements
      elementsToHide.forEach(element => {
        (element as HTMLElement).style.cssText = `
          position: absolute !important;
          left: -10000px !important;
          top: auto !important;
          width: 1px !important;
          height: 1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          z-index: -1 !important;
        `;
      });
    };
    
    // Run immediately and also after a short delay to catch dynamically added content
    removeUnwantedText();
    const timeout = setTimeout(removeUnwantedText, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);
    
    // Add user message to unified conversation
    const userMsg: UnifiedMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      isMultiAgent: adversarialMode
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      if (adversarialMode) {
        // Send to adversarial endpoint with FULL conversation history (both modes)
        const fullHistory = messages
          .filter(msg => msg.role !== 'user')
          .slice(-8)
          .map(msg => ({ agent: msg.role, content: msg.content }));

        const response = await fetch('/api/claude-test/adversarial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: userMessage,
            conversationHistory: fullHistory
          }),
        });

        const data = await response.json();
        if (data.rounds) {
          // Convert agent responses to unified format
          const agentMessages: UnifiedMessage[] = data.rounds.map((round: any, index: number) => ({
            id: `${round.agent}-${round.round}-${Date.now() + index}`,
            role: round.agent as 'skeptic' | 'validator',
            content: round.content,
            timestamp: Date.now() + index + 1,
            round: round.round,
            isMultiAgent: true,
            tokenUsage: index === data.rounds.length - 1 ? { // Only attach to last message to avoid duplication
              totalTokens: data.tokenUsage?.totalTokens || 0,
              inputTokens: data.tokenUsage?.inputTokens,
              outputTokens: data.tokenUsage?.outputTokens,
              roundsCount: data.tokenUsage?.roundsCount,
              debateOutcome: data.debateOutcome
            } : undefined
          }));
          setMessages(prev => [...prev, ...agentMessages]);
          setSessionTokens(prev => prev + (data.tokenUsage?.totalTokens || 0));
        }
      } else {
        // Regular single-agent mode - get FULL conversation context including multi-agent
        const fullHistory = messages
          .slice(-10)
          .map(msg => ({ 
            role: msg.role === 'skeptic' || msg.role === 'validator' ? 'assistant' : msg.role as 'user' | 'assistant', 
            content: msg.role === 'skeptic' || msg.role === 'validator' ? 
              `[${msg.role.toUpperCase()}]: ${msg.content}` : msg.content,
            timestamp: new Date(msg.timestamp) 
          }));

        const response = await fetch('/api/claude-test/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMessage,
            conversationHistory: fullHistory
          }),
        });

        const data = await response.json();
        const assistantMsg: UnifiedMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          isMultiAgent: false,
          tokenUsage: {
            totalTokens: data.tokenUsage?.totalTokens || 0,
            inputTokens: data.tokenUsage?.inputTokens,
            outputTokens: data.tokenUsage?.outputTokens
          }
        };
        setMessages(prev => [...prev, assistantMsg]);
        setSessionTokens(prev => prev + (data.tokenUsage?.totalTokens || 0));
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg: UnifiedMessage = {
        id: `error-${Date.now()}`,
        role: adversarialMode ? 'skeptic' : 'assistant',
        content: `Unable to process your request at this time. Please try again.`,
        timestamp: Date.now(),
        isMultiAgent: adversarialMode
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setSessionTokens(0);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return <UserAvatar size={20} />;
      case 'assistant': return <Watson size={20} />;
      case 'skeptic': return <Analytics size={20} />;
      case 'validator': return <Collaborate size={20} />;
      default: return <ChatBot size={20} />;
    }
  };

  const getRoleLabel = (role: string, round?: number, isMultiAgent?: boolean) => {
    if (role === 'user') return isMultiAgent ? 'Your Business Scenario' : 'Your Question';
    if (role === 'assistant') return 'Claude Assistant';
    if (role === 'skeptic') {
      if (round === 1) return 'Risk Analysis Perspective';
      if (round === 2) return 'Strategic Concerns Review';
      if (round && round >= 3) return 'Critical Assessment';
      return 'Risk Analyst';
    }
    if (role === 'validator') {
      if (round === 1) return 'Opportunity Analysis';
      if (round === 2) return 'Strategic Validation';
      if (round && round >= 3) return 'Solution Framework';
      return 'Strategy Validator';
    }
    return role;
  };

  const getDebatePhaseLabel = (round: number) => {
    switch (round) {
      case 1: return 'Initial Assessment';
      case 2: return 'Strategic Analysis';
      case 3: return 'Consensus Building';
      case 4: return 'Final Positions';
      case 5: return 'Closing Arguments';
      case 6: return 'Resolution';
      default: return `Round ${round}`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Theme theme="g100">
      <Header 
        aria-label="Claude Test Interface"
        style={{ 
          backgroundColor: '#161616', 
          borderBottom: '1px solid #393939',
          color: '#f4f4f4'
        }}
      >
        {/* SkipToContent component removed to hide unwanted text */}
        <HeaderName prefix="PrismForge" style={{ color: '#f4f4f4' }}>
          AI Strategy Assistant
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction 
            aria-label="Analytics Dashboard" 
            tooltipAlignment="end"
            style={{ color: '#f4f4f4' }}
          >
            <Analytics size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <Content id="main-content" style={{ padding: '2rem', minHeight: 'calc(100vh - 48px)', backgroundColor: '#161616' }}>
        <Grid>
          <Column lg={16} md={8} sm={4}>
            
            {/* Page Header */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '300', 
                color: '#f4f4f4', 
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em'
              }}>
                AI-Powered Strategic Analysis
              </h1>
              <p style={{ 
                fontSize: '1.125rem', 
                color: '#c6c6c6', 
                maxWidth: '600px', 
                margin: '0 auto',
                lineHeight: '1.5'
              }}>
                Experience collaborative intelligence through our multi-agent debate system. 
                Get balanced insights from AI specialists working together to analyze your business scenarios.
              </p>
            </div>

            {/* Mode Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <Tile style={{ padding: '1.5rem', backgroundColor: '#262626', border: '1px solid #393939' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '2rem', 
                  flexWrap: 'wrap',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      padding: '0.75rem',
                      backgroundColor: adversarialMode ? '#0f62fe' : '#393939',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s ease'
                    }}>
                      {adversarialMode ? <Collaborate size={24} /> : <Watson size={24} />}
                    </div>
                    <div>
                      <Toggle
                        id="adversarial-toggle"
                        labelText=""
                        toggled={adversarialMode}
                        onToggle={setAdversarialMode}
                        size="sm"
                      />
                      <div style={{ marginTop: '0.5rem' }}>
                        <h3 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '500', 
                          color: '#f4f4f4',
                          marginBottom: '0.25rem'
                        }}>
                          {adversarialMode ? 'Multi-Agent Strategic Analysis' : 'Single AI Assistant'}
                        </h3>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#8d8d8d',
                          margin: 0
                        }}>
                          {adversarialMode 
                            ? 'Risk analyst and strategy validator collaborate to provide balanced insights'
                            : 'Direct conversation with Claude AI assistant'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#161616',
                      borderRadius: '0.5rem',
                      border: '1px solid #393939'
                    }}>
                      <Analytics size={20} style={{ color: '#0f62fe' }} />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#8d8d8d', marginBottom: '0.25rem' }}>
                          Session Usage
                        </div>
                        <div style={{ fontSize: '1rem', color: '#f4f4f4', fontWeight: '500' }}>
                          {sessionTokens.toLocaleString()} tokens
                        </div>
                      </div>
                    </div>

                    <Button
                      kind="secondary"
                      size="md"
                      renderIcon={TrashCan}
                      onClick={clearMessages}
                      disabled={messages.length === 0}
                    >
                      Clear Session
                    </Button>
                  </div>
                </div>
              </Tile>
            </div>

            {/* Information Notice */}
            {adversarialMode && messages.length === 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <InlineNotification
                  kind="info"
                  title="Multi-Agent Analysis Ready"
                  subtitle="Describe your business scenario below. Our AI specialists will analyze it from multiple perspectives, identifying both opportunities and risks to help you make informed decisions."
                  hideCloseButton
                />
              </div>
            )}

            {/* Messages */}
            <div style={{ marginBottom: '1.5rem' }}>
              <Tile style={{ 
                height: '60vh', 
                minHeight: '500px',
                display: 'flex', 
                flexDirection: 'column',
                padding: 0,
                backgroundColor: '#161616',
                border: '1px solid #393939'
              }}>
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '1.5rem',
                  scrollBehavior: 'smooth'
                }}>
                  {messages.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#8d8d8d', 
                      padding: '4rem 2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#262626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}>
                        {adversarialMode ? <Collaborate size={32} /> : <Watson size={32} />}
                      </div>
                      <h3 style={{ fontSize: '1.25rem', color: '#f4f4f4', marginBottom: '0.5rem' }}>
                        {adversarialMode ? 'Ready for Strategic Analysis' : 'Ready to Assist'}
                      </h3>
                      <p style={{ fontSize: '1rem', lineHeight: '1.5', maxWidth: '400px' }}>
                        {adversarialMode 
                          ? 'Share your business scenario, strategic decision, or challenge. Our AI specialists will provide comprehensive analysis from multiple perspectives.'
                          : 'Ask any question or describe what you need help with. I\'m here to provide thoughtful assistance.'
                        }
                      </p>
                    </div>
                  ) : (
                    (() => {
                      // Sort all messages by timestamp for true chronological order
                      const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);

                      return sortedMessages.map((msg) => {
                        const isUser = msg.role === 'user';
                        const alignment = isUser ? 'flex-end' : 'flex-start';

                        return (
                          <div key={msg.id} style={{ 
                            display: 'flex', 
                            justifyContent: alignment,
                            marginBottom: '1.5rem',
                            alignItems: 'flex-start'
                          }}>
                            <div style={{ 
                              maxWidth: '75%',
                              display: 'flex',
                              flexDirection: isUser ? 'row-reverse' : 'row',
                              alignItems: 'flex-start',
                              gap: '1rem'
                            }}>
                              {/* Avatar */}
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: isUser ? '#0f62fe' : (
                                  msg.role === 'skeptic' ? '#da1e28' : 
                                  msg.role === 'validator' ? '#24a148' : '#525252'
                                ),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0,
                                marginTop: '0.25rem',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                              }}>
                                {getRoleIcon(msg.role)}
                              </div>

                              {/* Message */}
                              <div style={{ flex: 1 }}>
                                {/* Role label */}
                                {!isUser && (
                                  <div style={{ 
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                  }}>
                                    <span style={{
                                      fontSize: '0.875rem', 
                                      fontWeight: '500',
                                      color: '#f4f4f4'
                                    }}>
                                      {getRoleLabel(msg.role, msg.round, msg.isMultiAgent)}
                                    </span>
                                    {msg.round && (
                                      <Tag size="sm" type="outline">
                                        {getDebatePhaseLabel(msg.round)}
                                      </Tag>
                                    )}
                                  </div>
                                )}

                                {/* Message content */}
                                <div style={{
                                  backgroundColor: isUser ? '#0f62fe' : '#262626',
                                  color: isUser ? 'white' : '#f4f4f4',
                                  padding: '1rem 1.25rem',
                                  borderRadius: isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                                  fontSize: '0.95rem',
                                  lineHeight: '1.5',
                                  border: isUser ? 'none' : '1px solid #393939',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}>
                                  {msg.content}
                                </div>

                                {/* Token usage */}
                                {msg.tokenUsage && (
                                  <div style={{ 
                                    marginTop: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    flexWrap: 'wrap'
                                  }}>
                                    <div style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '0.5rem',
                                      fontSize: '0.75rem',
                                      color: '#8d8d8d',
                                      fontFamily: 'IBM Plex Mono, monospace'
                                    }}>
                                      <Analytics size={12} />
                                      <span>{msg.tokenUsage.totalTokens?.toLocaleString()} tokens</span>
                                      {msg.tokenUsage.roundsCount && (
                                        <span>• {msg.tokenUsage.roundsCount} rounds</span>
                                      )}
                                    </div>
                                    {msg.tokenUsage.debateOutcome && (
                                      <Tag 
                                        type={msg.tokenUsage.debateOutcome === 'disagreement_maintained' ? 'red' : 'green'} 
                                        size="sm"
                                      >
                                        {msg.tokenUsage.debateOutcome === 'disagreement_maintained' ? 
                                          'Maintained Different Views' : 'Reached Consensus'}
                                      </Tag>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </Tile>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                margin: '0 0 1.5rem 0',
                padding: '1rem 1.25rem',
                backgroundColor: '#262626',
                borderRadius: '0.75rem',
                border: '1px solid #393939',
                color: '#c6c6c6'
              }}>
                <Loading small withOverlay={false} />
                <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{loadingTexts[loadingTextIndex]}</span>
              </div>
            )}

            {/* Input */}
            <div style={{ width: '100%' }}>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'flex-end',
                padding: '1.25rem',
                backgroundColor: '#262626',
                borderRadius: '0.75rem',
                border: '1px solid #393939',
                width: '100%',
                boxSizing: 'border-box',
                minWidth: 0
              }}>
                <div style={{ 
                  flex: 1, 
                  width: '100%', 
                  minWidth: 0 
                }}>
                  <TextInput
                    id="message-input"
                    placeholder={adversarialMode ? 
                      (messages.some(m => m.isMultiAgent) ? 
                        "Continue the strategic discussion..." : 
                        "Describe your business scenario, challenge, or strategic decision...") : 
                      "Ask a question or describe what you need help with..."
                    }
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    labelText=""
                    size="lg"
                    style={{ 
                      width: '100%',
                      minWidth: 0
                    }}
                  />
                </div>
                <Button
                  renderIcon={Send}
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  size="lg"
                  style={{ minWidth: '120px' }}
                >
                  {isLoading ? 'Analyzing...' : 'Send'}
                </Button>
              </div>
              
              {/* Debug info - Hidden in production */}
              <div style={{ 
                marginTop: '1rem',
                padding: '0.5rem 1.25rem', 
                fontSize: '0.75rem', 
                color: '#525252',
                fontFamily: 'IBM Plex Mono, monospace',
                backgroundColor: '#161616',
                borderRadius: '0.5rem',
                border: '1px solid #262626'
              }}>
                Status: {currentMessage.length} characters • {isLoading ? 'Processing' : 'Ready'}
              </div>
            </div>
          </Column>
        </Grid>
      </Content>
    </Theme>
  );
}