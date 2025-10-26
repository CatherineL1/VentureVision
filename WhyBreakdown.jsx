import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function WhyBreakdown({ factors }) {
  const getImpactIcon = (impact) => {
    if (impact === 'positive') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (impact === 'negative') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getImpactColor = (impact) => {
    if (impact === 'positive') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (impact === 'negative') return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Why This Score?
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Real-time factors affecting your success probability
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {factors?.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-4 p-4 bg-gray-950/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getImpactIcon(factor.impact)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-white">{factor.factor}</h4>
                  <Badge className={`${getImpactColor(factor.impact)} border`}>
                    {factor.weight > 0 ? '+' : ''}{factor.weight}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  {factor.description || `${factor.impact} impact on overall success`}
                </p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
