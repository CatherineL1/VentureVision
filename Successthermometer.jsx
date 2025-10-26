import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, Target, DollarSign } from 'lucide-react';

export default function SuccessThermometer({ score, revenueForecast }) {
  const getScoreColor = (score) => {
    if (score >= 75) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 75) return 'High Probability';
    if (score >= 50) return 'Moderate Probability';
    return 'Low Probability';
  };

  const formatRevenue = (value) => {
    if (value < 0) {
      return `-$${Math.abs(value).toLocaleString()}`;
    }
    if (value === 0) {
      return '≤ $0';
    }
    return `$${value.toLocaleString()}`;
  };

  const getRevenueColor = (value) => {
    if (value < 0) return 'text-red-400';
    if (value === 0) return 'text-orange-400';
    if (value < 50000) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRevenueLabel = (value, year) => {
    const year1Revenue = revenueForecast?.year_1 || 0;
    const year1Negative = year1Revenue < 0;

    if (value <= 0 && year === 2 && year1Negative) {
      return 'Wind-down';
    }
    if (value < 0) return 'Expected Loss';
    if (value === 0) return 'Break-even/Closure';
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${getScoreColor(score)} opacity-10`} />
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5" />
            Success Probability
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Score Display */}
          <div className="text-center relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 1, delay: 0.2 }}
              className="relative inline-block"
            >
              <svg className="w-48 h-48 mx-auto -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-800"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: score / 100 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  style={{
                    strokeDasharray: 552.92,
                    strokeDashoffset: 552.92 * (1 - score / 100)
                  }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`${getScoreColor(score).split(' ')[0].replace('from-', 'text-')}`} stopColor="currentColor" />
                    <stop offset="100%" className={`${getScoreColor(score).split(' ')[1].replace('to-', 'text-')}`} stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-6xl font-bold text-white"
                >
                  {Math.round(score)}%
                </motion.span>
                <span className="text-sm text-gray-400 mt-1">{getScoreLabel(score)}</span>
              </div>
            </motion.div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Year 1 Revenue</span>
              </div>
              <p className={`text-2xl font-bold ${getRevenueColor(revenueForecast?.year_1 || 0)}`}>
                {formatRevenue(revenueForecast?.year_1 || 0)}
              </p>
              {getRevenueLabel(revenueForecast?.year_1 || 0, 1) && (
                <p className={`text-xs mt-1 ${getRevenueColor(revenueForecast?.year_1 || 0)}`}>
                  {getRevenueLabel(revenueForecast?.year_1 || 0, 1)}
                </p>
              )}
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Year 2 Revenue</span>
              </div>
              <p className={`text-2xl font-bold ${getRevenueColor(revenueForecast?.year_2 || 0)}`}>
                {formatRevenue(revenueForecast?.year_2 || 0)}
              </p>
              {getRevenueLabel(revenueForecast?.year_2 || 0, 2) && (
                <p className={`text-xs mt-1 ${getRevenueColor(revenueForecast?.year_2 || 0)}`}>
                  {getRevenueLabel(revenueForecast?.year_2 || 0, 2)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
