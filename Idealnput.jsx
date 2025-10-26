import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IdeaInput({ onAnalyze, isAnalyzing }) {
  const [idea, setIdea] = useState('');

  const handleSubmit = () => {
    if (idea.trim()) {
      onAnalyze(idea);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-auto">
      {/* Background Image - Full Screen */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070)',
        }}
      />
      
      {/* Darker Navy Blue Overlay with 75% opacity */}
      <div className="fixed inset-0 bg-blue-950" style={{ opacity: 0.75 }} />

      {/* Animated gradient elements (keeping subtle effects) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full mb-6 border border-purple-500/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">AI-Powered Business Intelligence</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Predict Your Success
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Paste your business idea and get instant forecasts, success probability, and actionable insights
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl p-6">
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your business idea in plain English...&#10;&#10;Example: A mobile app that connects local dog walkers with busy pet owners. Users can book walks, track their dog in real-time via GPS, and pay through the app. We'll charge a 20% commission per booking."
              className="min-h-[200px] bg-gray-950/50 border-gray-800 text-white placeholder:text-gray-500 text-lg resize-none focus:border-purple-500/50"
            />
            
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                {idea.length > 0 && `${idea.length} characters`}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!idea.trim() || isAnalyzing}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Analyze My Idea
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
