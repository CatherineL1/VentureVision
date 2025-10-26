import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import IdeaInput from '../components/analyzer/IdeaInput';
import SuccessThermometer from '../components/analyzer/SuccessThermometer';
import WhyBreakdown from '../components/analyzer/WhyBreakdown';
import ChatPanel from '../components/analyzer/ChatPanel';
import CompetitorAnalysis from '../components/analyzer/CompetitorAnalysis';
import RecommendationsPanel from '../components/analyzer/RecommendationsPanel';
import RevenueChart from '../components/analyzer/RevenueChart';

export default function Analyzer() {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const applyRevenueTemplate = (tier) => {
    // Random spread ±15% around template, rounded to nearest $5k
    const randomize = (base) => {
      const spread = base * (0.85 + Math.random() * 0.3); // ±15%
      return Math.round(spread / 5000) * 5000; // Round to nearest $5k
    };

    const templates = {
      bad: {
        year_1: randomize(-20000),
        year_2: randomize(-8000),
        year_3: randomize(0)
      },
      medium: {
        year_1: randomize(180000),
        year_2: randomize(320000),
        year_3: randomize(550000)
      },
      good: {
        year_1: randomize(650000),
        year_2: randomize(1400000),
        year_3: randomize(2800000)
      }
    };

    return templates[tier];
  };

  const applyUnitSalesTemplate = (tier) => {
    const randomize = (base) => {
      const spread = base * (0.85 + Math.random() * 0.3);
      return Math.round(spread / 100) * 100;
    };

    const templates = {
      bad: {
        year_1: randomize(500),
        year_2: randomize(200),
        year_3: randomize(0)
      },
      medium: {
        year_1: randomize(3000),
        year_2: randomize(6000),
        year_3: randomize(10000)
      },
      good: {
        year_1: randomize(15000),
        year_2: randomize(35000),
        year_3: randomize(70000)
      }
    };

    return templates[tier];
  };

  const analyzeIdea = async (ideaDescription) => {
    setIsAnalyzing(true);
    
    try {
      // Step 1: Get rule-based evaluation flags
      const ruleEvaluation = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this business idea against specific hard rules to determine tier classification:

"${ideaDescription}"

EVALUATE THESE EXACT CRITERIA:

BAD IDEA FLAGS (if ANY are true, it's a bad idea):
1. Health/Legal Liability: Does it involve health risks, legal liability, bodily fluids, privacy breaches, or dangerous materials?
2. Shrinking TAM: Is the total addressable market shrinking (negative CAGR > -5% in last 3 years)?
3. Low Gross Margin: Would gross margins be < 15% at scale?
4. Cultural Revulsion: Would > 60% of people find this disgusting, offensive, or unethical?

GOOD IDEA FLAGS (ALL must be true for good classification):
1. TAM CAGR > 8%: Is the market growing at least 8% annually?
2. Gross Margin > 45%: Can this achieve 45%+ gross margins at scale?
3. Google Trends Up: Has search interest been increasing for 3+ years?
4. Low Competitor Density: Are there fewer than 3 dominant brands with >10% market share each?
5. ESG/Regulatory Tailwind: Is there supportive regulation (plastic bans, carbon credits, sustainability mandates)?

ELSE → MEDIUM TIER (neither bad nor good)

Be objective and data-driven. Search current market data.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            bad_flags: {
              type: "object",
              properties: {
                health_legal_liability: { type: "boolean" },
                shrinking_tam: { type: "boolean" },
                low_gross_margin: { type: "boolean" },
                cultural_revulsion: { type: "boolean" },
                details: { type: "string" }
              }
            },
            good_flags: {
              type: "object",
              properties: {
                tam_cagr_high: { type: "boolean" },
                gross_margin_high: { type: "boolean" },
                google_trends_up: { type: "boolean" },
                low_competitor_density: { type: "boolean" },
                esg_tailwind: { type: "boolean" },
                details: { type: "string" }
              }
            },
            tier_classification: {
              type: "string",
              enum: ["bad", "medium", "good"]
            },
            reasoning: { type: "string" }
          }
        }
      });

      // Determine tier based on flags
      const isBad = Object.values(ruleEvaluation.bad_flags).slice(0, 4).some(flag => flag === true);
      const isGood = !isBad && Object.values(ruleEvaluation.good_flags).slice(0, 5).every(flag => flag === true);
      
      let tier;
      let scoreRange;
      
      if (isBad) {
        tier = 'bad';
        scoreRange = { min: 5, max: 29 };
      } else if (isGood) {
        tier = 'good';
        scoreRange = { min: 70, max: 95 };
      } else {
        tier = 'medium';
        scoreRange = { min: 30, max: 69 };
      }

      // Step 2: Get detailed analysis with tier constraint
      const detailedAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert business analyst. This idea has been PRE-CLASSIFIED as "${tier.toUpperCase()}" tier based on hard market rules.

"${ideaDescription}"

TIER CLASSIFICATION: ${tier.toUpperCase()}
${tier === 'bad' ? `Bad Flags Triggered: ${ruleEvaluation.bad_flags.details}` : ''}
${tier === 'good' ? `Good Flags Met: ${ruleEvaluation.good_flags.details}` : ''}
${tier === 'medium' ? `Reasoning: ${ruleEvaluation.reasoning}` : ''}

YOUR TASK:
1. Assign a success score within the REQUIRED range: ${scoreRange.min}% to ${scoreRange.max}%
2. Provide 6-8 key factors explaining the ${tier} classification
3. Identify real competitors
4. Give 8 actionable recommendations appropriate for ${tier} tier ideas

FOR ${tier.toUpperCase()} TIER:
${tier === 'bad' ? '- Focus on fundamental flaws and why to pivot/abandon\n- Highlight legal, health, or market risks\n- Recommendations should focus on pivot strategies' : ''}
${tier === 'medium' ? '- Balance strengths and weaknesses\n- Show viable path but acknowledge challenges\n- Recommendations focus on execution and differentiation' : ''}
${tier === 'good' ? '- Highlight strong market position and advantages\n- Focus on scaling and optimization opportunities\n- Recommendations focus on maximizing high potential' : ''}

Be thorough and analytical. Success score MUST be within ${scoreRange.min}-${scoreRange.max}%.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            success_score: { type: "number" },
            key_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                  weight: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  threat_level: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  impact_on_score: { type: "number" },
                  priority: { type: "string", enum: ["low", "medium", "high"] }
                }
              }
            }
          }
        }
      });

      // Enforce score range (in case AI doesn't comply)
      let finalScore = detailedAnalysis.success_score;
      if (finalScore < scoreRange.min) finalScore = scoreRange.min + Math.random() * 10;
      if (finalScore > scoreRange.max) finalScore = scoreRange.max - Math.random() * 10;
      finalScore = Math.round(finalScore);

      // Apply revenue and unit sales templates based on tier
      const revenue_forecast = applyRevenueTemplate(tier);
      const unit_sales_forecast = applyUnitSalesTemplate(tier);

      const analysisData = {
        idea_description: ideaDescription,
        success_score: finalScore,
        revenue_forecast,
        unit_sales_forecast,
        key_factors: detailedAnalysis.key_factors,
        competitors: detailedAnalysis.competitors,
        recommendations: detailedAnalysis.recommendations,
        tier_classification: tier,
        rule_flags: {
          bad: ruleEvaluation.bad_flags,
          good: ruleEvaluation.good_flags
        }
      };

      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error analyzing idea:', error);
    }
    
    setIsAnalyzing(false);
  };

  const saveAnalysis = async () => {
    if (!analysis) return;
    
    setIsSaving(true);
    try {
      await base44.entities.BusinessAnalysis.create(analysis);
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
    setIsSaving(false);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {!analysis ? (
        <IdeaInput onAnalyze={analyzeIdea} isAnalyzing={isAnalyzing} />
      ) : (
        <div className="px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetAnalysis}
                  className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Tier: <span className={`font-semibold ${
                      analysis.tier_classification === 'good' ? 'text-green-400' :
                      analysis.tier_classification === 'bad' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>{analysis.tier_classification.toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <Button
                onClick={saveAnalysis}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Analysis
                  </>
                )}
              </Button>
            </motion.div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SuccessThermometer
                  score={analysis.success_score}
                  revenueForecast={analysis.revenue_forecast}
                />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <RevenueChart
                  revenueForecast={analysis.revenue_forecast}
                  unitSalesForecast={analysis.unit_sales_forecast}
                />
                <WhyBreakdown factors={analysis.key_factors} />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <RecommendationsPanel recommendations={analysis.recommendations} />
              <ChatPanel analysis={analysis} />
            </div>

            <div className="mt-6">
              <CompetitorAnalysis
                ideaDescription={analysis.idea_description}
                competitors={analysis.competitors}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
