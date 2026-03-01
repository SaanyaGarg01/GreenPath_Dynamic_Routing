import React from 'react';
import { Brain, CheckCircle2 } from 'lucide-react';

interface AIExplainabilityProps {
  decisionFactors: string[];
  efficiencyScore: number;
  confidence: number;
}

const AIExplainabilityPanel: React.FC<AIExplainabilityProps> = ({
  decisionFactors,
  efficiencyScore,
  confidence
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLevel = (conf: number) => {
    if (conf >= 0.9) return { label: 'Very High', color: 'bg-green-100 text-green-800' };
    if (conf >= 0.8) return { label: 'High', color: 'bg-blue-100 text-blue-800' };
    if (conf >= 0.7) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Standard', color: 'bg-gray-100 text-gray-800' };
  };

  const confidenceInfo = getConfidenceLevel(confidence);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200 shadow-md">
      <div className="flex items-center gap-3 mb-5">
        <Brain className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-purple-800">🧠 Why AI Chose This Route</h3>
      </div>

      {/* AI Decision Breakdown */}
      <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-purple-500">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600" />
          AI Decision Factors
        </h4>

        <div className="space-y-2">
          {decisionFactors.length > 0 ? (
            decisionFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-3 pl-4">
                <span className="text-purple-500 font-bold text-lg leading-none mt-0.5">✓</span>
                <p className="text-sm text-slate-700 leading-relaxed">{factor}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">Analyzing route decision factors...</p>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Efficiency Score */}
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">Route Efficiency</p>
          <div className="flex items-end gap-2 mt-2">
            <span className={`text-3xl font-bold ${getScoreColor(efficiencyScore)}`}>
              {efficiencyScore.toFixed(0)}
            </span>
            <span className="text-sm text-gray-500 mb-1">/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all ${
                efficiencyScore >= 80
                  ? 'bg-green-500'
                  : efficiencyScore >= 60
                  ? 'bg-yellow-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${efficiencyScore}%` }}
            />
          </div>
        </div>

        {/* Confidence Level */}
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-gray-600 text-xs font-medium uppercase tracking-wide">AI Confidence</p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-bold text-indigo-600">
              {(confidence * 100).toFixed(0)}
            </span>
            <span className="text-sm text-gray-500 mb-1">%</span>
          </div>
          <div className={`mt-2 px-2 py-1 rounded text-xs font-semibold text-center ${confidenceInfo.color}`}>
            {confidenceInfo.label}
          </div>
        </div>
      </div>

      {/* Trustworthiness Indicator */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 flex items-start gap-3">
        <div className="text-2xl">🔒</div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">Explainable AI - Transparent Decision Making</p>
          <p className="text-xs text-slate-700 mt-1">
            This route was selected based on {decisionFactors.length} verified optimization factors.
            The AI is not a black box—every decision is traceable and business-focused.
          </p>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-xs text-gray-600 mb-2">
          <strong>How it works:</strong> Our Q-Learning agent evaluates traffic patterns, weather conditions,
          vehicle efficiency, and delivery priorities to find optimal routes that maximize business value while
          minimizing environmental impact.
        </p>
        <p className="text-xs text-gray-500 italic">
          Algorithm: Reinforcement Learning (Q-Learning) | Model: GreenPath v2.0
        </p>
      </div>
    </div>
  );
};

export default AIExplainabilityPanel;
