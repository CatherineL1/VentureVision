import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function RevenueChart({ revenueForecast, unitSalesForecast }) {
  const data = [
    { year: 'Year 1', revenue: revenueForecast?.year_1 || 0, units: unitSalesForecast?.year_1 || 0 },
    { year: 'Year 2', revenue: revenueForecast?.year_2 || 0, units: unitSalesForecast?.year_2 || 0 },
    { year: 'Year 3', revenue: revenueForecast?.year_3 || 0, units: unitSalesForecast?.year_3 || 0 },
  ];

  const minRevenue = Math.min(...data.map(d => d.revenue));
  const hasNegative = minRevenue < 0;
  
  // New wind-down scenario logic
  const year1Revenue = revenueForecast?.year_1 || 0;
  const year2Revenue = revenueForecast?.year_2 || 0;
  const year1Negative = year1Revenue < 0;
  const year2NegativeOrZero = year2Revenue <= 0;
  const isWindDown = year1Negative && year2NegativeOrZero;

  const formatRevenue = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) return `${value < 0 ? '-' : ''}${(absValue / 1000000).toFixed(1)}M`;
    if (absValue >= 1000) return `${value < 0 ? '-' : ''}${(absValue / 1000).toFixed(0)}k`;
    return `${value < 0 ? '-' : ''}$${absValue}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Revenue Forecast
          </CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            {isWindDown 
              ? '⚠️ Wind-down scenario: Continuous losses indicate business model failure'
              : hasNegative 
                ? 'Conservative projection showing potential losses' 
                : 'Projected revenue growth over 3 years'
            }
          </p>
        </CardHeader>
        
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={hasNegative ? "#ef4444" : "#8b5cf6"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={hasNegative ? "#ef4444" : "#8b5cf6"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={formatRevenue} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [
                  value <= 0 && isWindDown ? '≤ $0 (wind-down)' : (value < 0 ? `-$${Math.abs(value).toLocaleString()}` : `$${value.toLocaleString()}`),
                  'Revenue'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={hasNegative ? "#ef4444" : "#8b5cf6"}
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
            {data.map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-sm text-gray-400 mb-1">{item.year}</p>
                <p className={`text-lg font-bold ${item.revenue < 0 ? 'text-red-400' : item.revenue === 0 && isWindDown ? 'text-orange-400' : 'text-white'}`}>
                  {item.revenue <= 0 && isWindDown && index > 0
                    ? '≤ $0'
                    : item.revenue < 0 
                      ? `-$${Math.abs(item.revenue).toLocaleString()}`
                      : `$${item.revenue.toLocaleString()}`
                  }
                </p>
                {item.revenue <= 0 && isWindDown && index > 0 && (
                  <p className="text-xs text-orange-400 mt-1">Wind-down</p>
                )}
                {item.revenue < 0 && (!isWindDown || index === 0) && (
                  <p className="text-xs text-red-400 mt-1">Loss</p>
                )}
                <p className="text-xs text-gray-500">{item.units.toLocaleString()} units</p>
              </div>
            ))}
          </div>

          {isWindDown && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                <strong>Wind-down Scenario:</strong> The forecast shows continuous losses indicating fundamental business model issues. 
                Consider pivoting or shutting down before further capital depletion.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
