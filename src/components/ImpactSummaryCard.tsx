import { useState } from 'react';
import { Leaf, Zap, TrendingDown, Award, X, Share2, Copy } from 'lucide-react';

interface ImpactSummaryCardProps {
  fuelSavingsPercent?: number;
  emissionReduced?: number;
  costSaved?: number;
  ecoScore?: number;
  isAnimated?: boolean;
}

export function ImpactSummaryCard({
  fuelSavingsPercent = 68.4,
  emissionReduced = 0.34,
  costSaved = 89,
  ecoScore = 100,
  isAnimated = true
}: ImpactSummaryCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    const shareText = `🚀 GreenPath AI Impact Report:
📊 Fuel Saved: ${fuelSavingsPercent.toFixed(1)}%
🌍 CO₂ Reduced: ${emissionReduced.toFixed(2)} kg
💰 Cost Saved: ₹${costSaved.toFixed(0)}
🏆 Eco Score: ${ecoScore}/100

Discover smarter routing with GreenPath Dynamic Routing!`;
    
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl shadow-2xl ${
        isAnimated ? 'animate-gradient' : ''
      }`}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-90"></div>
        
        {/* Subtle animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent opacity-10"></div>

        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white rounded-full opacity-5 blur-2xl"></div>

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-7 h-7 text-white drop-shadow-lg" />
            <h2 className="text-2xl font-black text-white drop-shadow-lg">
              🚀 AI Improved Routing By:
            </h2>
          </div>

          {/* Impact Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fuel Savings */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all group cursor-pointer transform hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-200 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-bold text-white text-opacity-80 uppercase">Fuel Saved</span>
              </div>
              <div className="text-3xl font-black text-white drop-shadow-lg">{fuelSavingsPercent.toFixed(1)}%</div>
              <div className="text-xs text-white text-opacity-70 mt-1">Less consumption</div>
            </div>

            {/* Emissions Reduced */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all group cursor-pointer transform hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-blue-200 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-bold text-white text-opacity-80 uppercase">CO₂ Cut</span>
              </div>
              <div className="text-3xl font-black text-white drop-shadow-lg">{emissionReduced.toFixed(2)} kg</div>
              <div className="text-xs text-white text-opacity-70 mt-1">Emissions prevented</div>
            </div>

            {/* Cost Saved */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all group cursor-pointer transform hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💰</span>
                <span className="text-xs font-bold text-white text-opacity-80 uppercase">Savings</span>
              </div>
              <div className="text-3xl font-black text-white drop-shadow-lg">₹{costSaved.toFixed(0)}</div>
              <div className="text-xs text-white text-opacity-70 mt-1">Per delivery</div>
            </div>

            {/* Eco Score */}
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20 hover:bg-opacity-20 transition-all group cursor-pointer transform hover:scale-105">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-200 group-hover:rotate-12 transition-transform" />
                <span className="text-xs font-bold text-white text-opacity-80 uppercase">Eco Score</span>
              </div>
              <div className="text-3xl font-black text-white drop-shadow-lg">{ecoScore}</div>
              <div className="text-xs text-white text-opacity-70 mt-1">/100 rating</div>
            </div>
          </div>

          {/* Benefit Summary */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 border border-white border-opacity-20 mt-4">
            <p className="text-sm text-white text-opacity-90">
              <strong>Total Fleet Impact:</strong> By using GreenPath AI, you're saving fuel costs while reducing environmental impact. 
              This route demonstrates how intelligent routing optimizes both operational efficiency and sustainability goals.
            </p>
          </div>

          {/* Call to Action */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 bg-white text-green-600 font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 hover:shadow-lg active:scale-95"
            >
              View Details
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="flex-1 bg-white bg-opacity-20 text-white font-bold py-2 px-4 rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Leaf className="w-6 h-6" /> Impact Analysis Report
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <span className="text-sm font-bold text-gray-600">Fuel Consumption</span>
                  <div className="text-3xl font-black text-yellow-600 mt-2">{fuelSavingsPercent.toFixed(1)}%</div>
                  <p className="text-xs text-gray-600 mt-2">Reduction compared to standard routing</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <span className="text-sm font-bold text-gray-600">CO₂ Emissions</span>
                  <div className="text-3xl font-black text-blue-600 mt-2">{emissionReduced.toFixed(2)} kg</div>
                  <p className="text-xs text-gray-600 mt-2">CO₂ prevented from entering atmosphere</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <span className="text-sm font-bold text-gray-600">Cost Savings</span>
                  <div className="text-3xl font-black text-green-600 mt-2">₹{costSaved.toFixed(0)}</div>
                  <p className="text-xs text-gray-600 mt-2">Per delivery savings</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <span className="text-sm font-bold text-gray-600">Eco Score</span>
                  <div className="text-3xl font-black text-purple-600 mt-2">{ecoScore}/100</div>
                  <p className="text-xs text-gray-600 mt-2">Environmental rating</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-green-900 mb-3">🌍 Environmental Impact</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <p>✓ Trees planted equivalent: <strong>{Math.round(emissionReduced / 0.02)}</strong></p>
                  <p>✓ Carbon credit value: <strong>₹{(emissionReduced * 250).toFixed(0)}</strong></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3">💰 Financial Impact</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>✓ Annual projection (250 trips): <strong>₹{(costSaved * 250).toFixed(0)}</strong></p>
                  <p>✓ Maintenance savings: <strong>₹{(costSaved * 0.15).toFixed(0)}</strong></p>
                </div>
              </div>

              <button
                onClick={() => {
                  handleCopyToClipboard();
                  setShowDetails(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <Share2 className="w-6 h-6" /> Share Impact
              </h3>
              <button
                onClick={() => setShowShare(false)}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={handleCopyToClipboard}
                className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" /> {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`GreenPath AI: ${fuelSavingsPercent.toFixed(1)}% fuel saved! 🚀🌍`)}`, '_blank')} className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-sm">
                  📱 Twitter
                </button>
                <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=greenpath.com`, '_blank')} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-3 rounded-lg text-sm">
                  💼 LinkedIn
                </button>
                <button onClick={() => window.location.href = `mailto:?subject=GreenPath Impact&body=${encodeURIComponent(`Fuel: ${fuelSavingsPercent.toFixed(1)}% CO₂: ${emissionReduced.toFixed(2)}kg`)}`} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm">
                  📧 Email
                </button>
                <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=greenpath.com`, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm">
                  f Facebook
                </button>
              </div>

              <button
                onClick={() => setShowShare(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
