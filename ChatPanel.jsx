import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChatPanel({ analysis }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `I can help you improve your success odds! Try asking:
• "How do I raise my odds to 85%?"
• "What pricing strategy works best?"
• "Should I focus on marketing or product first?"
• "What's my biggest risk?"`,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an experienced business strategy advisor. Be realistic but constructive.

BUSINESS IDEA: "${analysis.idea_description}"

CURRENT ANALYSIS:
- Success Score: ${analysis.success_score}%
- Year 1 Revenue: $${analysis.revenue_forecast?.year_1?.toLocaleString() || 0}
- Key Factors: ${JSON.stringify(analysis.key_factors)}
- Current Recommendations: ${JSON.stringify(analysis.recommendations)}

USER QUESTION: ${userMessage}

RESPONSE GUIDELINES BASED ON SCORE:

HIGH SCORE (60%+):
- Reinforce strengths and help optimize
- Focus on scaling strategies and execution excellence
- Suggest refinements to maximize potential
- Be encouraging about achievable milestones

MODERATE SCORE (30-60%):
- Focus on addressing key weaknesses
- Provide clear, actionable improvements
- Help prioritize what will move the needle most
- Be realistic about effort required but show path forward

LOW SCORE (<30%):
- If fundamentally flawed: Recommend pivot or major redesign
- If salvageable: Focus on fundamental business model fixes first
- Be honest about challenges but constructive
- Consider if shutdown/pivot is the best advice

RESPONSE FORMAT:
- Direct answer to their question
- 3-5 SPECIFIC, ACTIONABLE recommendations (ranked by impact)
- For each: explain WHY it helps, HOW to do it, REALISTIC expected impact ($$ or % improvement)
- Include concrete numbers and timeframes
- Be honest about difficulty but show achievable path

Max 3 paragraphs. Be conversational, data-driven, and proportionally encouraging based on the idea's actual merit.`,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }

    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            Strategy Optimizer
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Ask how to improve your success probability
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="h-[400px] overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-950/50 text-gray-300 border border-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-medium">AI Advisor</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-950/50 border border-gray-800 p-4 rounded-lg">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask how to improve your odds..."
              className="bg-gray-950/50 border-gray-800 text-white placeholder:text-gray-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </motion.div>
  );
}
