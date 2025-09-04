'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  MessageSquare,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  ChatMessage, 
  TokenBudget, 
  ProcessedDocument 
} from '@/types/phase1.types';

interface ChatInterfaceProps {
  sessionId: string;
  documents: ProcessedDocument[];
  onPhase2Ready?: (ready: boolean) => void;
  className?: string;
}

interface ChatState {
  messages: ChatMessage[];
  tokenBudget: TokenBudget;
  isLoading: boolean;
  error?: string;
  phase2Ready: boolean;
  readinessScore: number;
}

export function ChatInterface({
  sessionId,
  documents,
  onPhase2Ready,
  className,
}: ChatInterfaceProps) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    tokenBudget: {
      maxTokensPerSession: 15000,
      remainingTokens: 15000,
      usedTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      costSoFar: 0,
      warningThreshold: 12000,
      hardStopThreshold: 14250,
      budgetStatus: 'normal',
      canContinue: true,
    },
    isLoading: false,
    phase2Ready: false,
    readinessScore: 0,
  });

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load initial chat data
  useEffect(() => {
    loadChatData();
  }, [sessionId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  // Notify parent of Phase 2 readiness changes
  useEffect(() => {
    onPhase2Ready?.(state.phase2Ready);
  }, [state.phase2Ready, onPhase2Ready]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatData = async () => {
    try {
      const response = await fetch(`/api/phase1/chat?sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load chat data');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        messages: data.messages || [],
        tokenBudget: data.tokenBudget,
        phase2Ready: data.phase2Ready || false,
        readinessScore: data.readinessScore || 0,
      }));
    } catch (error) {
      console.error('Error loading chat data:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load chat history',
      }));
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || state.isLoading || !state.tokenBudget.canContinue) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, tempUserMessage],
      isLoading: true,
      error: undefined,
    }));

    try {
      const response = await fetch('/api/phase1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Chat request failed');
      }

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: data.messageId || `assistant-${Date.now()}`,
        sessionId,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        metadata: {
          tokenCount: data.tokenUsage?.outputTokens,
          processingTime: data.responseTime,
        },
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages.filter(m => m.id !== tempUserMessage.id), 
                  { ...tempUserMessage, id: `user-${Date.now()}` }, 
                  assistantMessage],
        tokenBudget: data.tokenBudget,
        isLoading: false,
        phase2Ready: data.tokenBudget.percentageUsed > 70 || prev.readinessScore > 0.7,
        readinessScore: Math.min(data.tokenBudget.percentageUsed / 100, 1),
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== tempUserMessage.id),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-success-green-600';
      case 'warning':
        return 'text-warning-amber-600';
      case 'near_limit':
      case 'exceeded':
        return 'text-error-red-600';
      default:
        return 'text-text-tertiary';
    }
  };

  const getBudgetStatusMessage = () => {
    const { budgetStatus, remainingTokens } = state.tokenBudget;
    
    if (budgetStatus === 'exceeded') {
      return 'Token limit reached. Consider upgrading to Phase 2 professional validation.';
    } else if (budgetStatus === 'near_limit') {
      return `Approaching token limit (${remainingTokens.toLocaleString()} remaining). Consider Phase 2 for comprehensive analysis.`;
    } else if (budgetStatus === 'warning') {
      return `Warning: Only ${remainingTokens.toLocaleString()} FREE tokens remaining.`;
    }
    
    return `FREE exploration tokens available: ${remainingTokens.toLocaleString()}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSuggestedQuestions = () => {
    if (documents.length === 0) {
      return [
        "What should I look for in M&A financial models?",
        "How do I validate key assumptions in deal analysis?",
        "What are the most common risks in M&A transactions?",
      ];
    } else {
      return [
        "What are the key insights from my uploaded documents?",
        "What assumptions should I be most concerned about?",
        "What additional analysis would strengthen this deal evaluation?",
        "Are there any red flags I should investigate further?",
      ];
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Header */}
      <Card className="border-b rounded-b-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">FREE M&A Document Analysis</CardTitle>
              <Badge className="bg-success-green-100 text-success-green-800 border-success-green-200">
                Phase 1
              </Badge>
            </div>
            {documents.length > 0 && (
              <Badge variant="outline">
                {documents.length} document{documents.length !== 1 ? 's' : ''} processed
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Token Usage Display */}
      <Card className="border-b border-t-0 rounded-none">
        <CardContent className="py-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Token Usage (FREE Phase 1)</span>
              <span className={getBudgetStatusColor(state.tokenBudget.budgetStatus)}>
                {state.tokenBudget.usedTokens.toLocaleString()} / {state.tokenBudget.maxTokensPerSession.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={(state.tokenBudget.usedTokens / state.tokenBudget.maxTokensPerSession) * 100} 
              className="h-2"
            />
            <p className="text-xs text-text-tertiary">
              {getBudgetStatusMessage()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col border-t-0 rounded-t-none">
        <CardContent className="flex-1 p-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96 custom-scrollbar">
            {state.messages.length === 0 && !state.isLoading && (
              <div className="text-center py-12 space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-text-primary">
                    Welcome to FREE M&A Document Analysis
                  </h3>
                  <p className="text-text-secondary max-w-md mx-auto">
                    {documents.length > 0 
                      ? "I've analyzed your documents. Ask me anything about your M&A analysis!"
                      : "Upload M&A documents to begin your FREE analysis, or ask general questions about deal validation."
                    }
                  </p>
                </div>
                
                {/* Suggested Questions */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-text-secondary">Try asking:</p>
                  <div className="space-y-2">
                    {getSuggestedQuestions().map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="text-left justify-start h-auto p-3 whitespace-normal text-sm"
                        onClick={() => setInputMessage(question)}
                        disabled={state.isLoading || !state.tokenBudget.canContinue}
                      >
                        &ldquo;{question}&rdquo;
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {state.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex space-x-3",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] space-y-2",
                    message.role === 'user' ? "order-1" : "order-2"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface border border-border"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-text-tertiary">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {message.metadata?.processingTime && (
                      <>
                        <span>•</span>
                        <span>{message.metadata.processingTime}ms</span>
                      </>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-text-secondary" />
                  </div>
                )}
              </div>
            ))}

            {state.isLoading && (
              <div className="flex space-x-3 justify-start">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-surface border border-border rounded-lg px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-text-secondary">Analyzing your request...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {state.error && (
        <Alert className="border-t-0 rounded-t-none">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            {state.error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0 text-primary"
              onClick={() => setState(prev => ({ ...prev, error: undefined }))}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Input Area */}
      <Card className="border-t-0 rounded-t-none">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  !state.tokenBudget.canContinue 
                    ? "Token limit reached - upgrade to Phase 2 for continued analysis"
                    : documents.length > 0
                      ? "Ask about your documents or M&A analysis..."
                      : "Ask questions about M&A validation or upload documents to begin..."
                }
                disabled={state.isLoading || !state.tokenBudget.canContinue}
                className={cn(
                  "w-full min-h-[44px] max-h-32 px-3 py-2 text-sm resize-none",
                  "border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  !state.tokenBudget.canContinue && "bg-surface"
                )}
                rows={1}
                style={{ 
                  height: 'auto',
                  minHeight: '44px',
                }}
              />
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || state.isLoading || !state.tokenBudget.canContinue}
              size="default"
              className="h-11 px-4"
            >
              {state.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {!state.tokenBudget.canContinue && (
            <Alert className="mt-3">
              <Zap className="w-4 h-4" />
              <AlertDescription>
                <strong>FREE exploration complete!</strong> Upgrade to Phase 2 professional validation ($500 per professional validation) 
                for adversarial analysis with Skeptic Agent + Validator Agent system.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}