import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Info, ExternalLink, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CompetitorAnalysis({ ideaDescription, competitors: initialCompetitors }) {
  const [competitors, setCompetitors] = useState(initialCompetitors || []);
  const [isSearching, setIsSearching] = useState(false);

  const getThreatIcon = (level) => {
    if (level === 'high') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (level === 'medium') return <Info className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getThreatColor = (level) => {
    if (level === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (level === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border-green-500/30';
  };

  const runWebCrawl = async () => {
    setIsSearching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Research competitors and similar products for this business idea: "${ideaDescription}"

Search for:
- Direct competitors
- Similar products on Kickstarter, Indiegogo
- Existing patents or trademarks
- Reddit threads or forums discussing similar ideas
- Existing apps or services

Return a comprehensive competitive analysis.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  threat_level: { type: "string", enum: ["low", "medium", "high"] },
                  source: { type: "string" }
                }
              }
            },
            market_status: { type: "string" },
            recommendation: { type: "string" }
          }
        }
      });

      setCompetitors(response.competitors || []);
    } catch (error) {
      console.error('Error searching competitors:', error);
    }
    setIsSearching(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Search className="w-5 h-5 text-blue-500" />
                Competitive Intelligence
              </CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                Discover existing competitors and similar products
              </p>
            </div>
            <Button
              onClick={runWebCrawl}
              disabled={isSearching}
              variant="outline"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Deep Web Scan
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {competitors.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Click "Deep Web Scan" to discover competitors</p>
            </div>
          ) : (
            competitors.map((competitor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="p-4 bg-gray-950/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    {getThreatIcon(competitor.threat_level)}
                    <h4 className="font-semibold text-white">{competitor.name}</h4>
                  </div>
                  <Badge className={`${getThreatColor(competitor.threat_level)} border`}>
                    {competitor.threat_level} threat
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-400 mb-2">{competitor.description}</p>
                
                {competitor.source && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ExternalLink className="w-3 h-3" />
                    Source: {competitor.source}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
