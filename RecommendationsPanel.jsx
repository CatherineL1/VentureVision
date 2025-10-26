import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowUp, Zap } from 'lucide-react';

export default function RecommendationsPanel({ recommendations }) {
  const getPriorityColor = (priority) => {
    if (priority === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (priority === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Ranked Recommendations
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Actionable steps to improve your success odds
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {recommendations?.sort((a, b) => b.impact_on_score - a.impact_on_score).map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 bg-gray-950/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {rec.action}
                    </h4>
                    <Badge className={`${getPriorityColor(rec.priority)} border flex-shrink-0`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-400">
                      <ArrowUp className="w-3 h-3" />
                      <span className="font-medium">+{rec.impact_on_score}%</span>
                      <span className="text-gray-500">potential boost</span>
                    </div>
                    {rec.priority === 'high' && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs">Quick win</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
