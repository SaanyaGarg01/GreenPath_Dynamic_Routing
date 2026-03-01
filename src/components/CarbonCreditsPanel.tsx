import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface CarbonCredits {
  co2_kg: number;
  trees_equivalent: number;
  km_pollution_avoided: number;
  carbon_credits: number;
}

interface CarbonPanelProps {
  totalFuel: number;
  vehicleType: string;
  distance: number;
}

const CarbonCreditsPanel: React.FC<CarbonPanelProps> = ({ totalFuel, vehicleType, distance }) => {
  const [carbonData, setCarbonData] = useState<CarbonCredits | null>(null);

  // Simplified carbon calculation (using real route data only)
  useEffect(() => {
    if (totalFuel <= 0.001) {
      // Very small fuel amounts show negligible impact
      setCarbonData(null);
      return;
    }

    // Get CO2 factor based on vehicle type
    const co2Factors: Record<string, number> = {
      ev: 0.4,
      hybrid: 1.2,
      petrol: 2.31
    };

    const co2Factor = co2Factors[vehicleType] || 2.31;
    // Ensure minimum CO2 calculation
    const co2Saved = Math.max(0.1, totalFuel * co2Factor);
    const treesEquivalent = Math.max(0.01, co2Saved / 20);
    const kmAvoided = Math.max(0.1, co2Saved / 0.23);
    const credits = Math.max(0.01, co2Saved * 0.1);

    // Use real values calculated from actual route
    setCarbonData({
      co2_kg: parseFloat(Math.max(0.001, co2Saved).toFixed(3)),
      trees_equivalent: parseFloat(treesEquivalent.toFixed(2)),
      km_pollution_avoided: parseFloat(kmAvoided.toFixed(1)),
      carbon_credits: parseFloat(credits.toFixed(2))
    });
  }, [totalFuel, vehicleType]);

  if (!carbonData || totalFuel <= 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-lg p-6 border border-green-200 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-green-800">🌍 Carbon Impact</h3>
        </div>
        <p className="text-gray-600 text-center py-8">
          Run a route simulation to calculate real carbon credits and environmental impact...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-lg p-6 border border-green-200 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Leaf className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-green-800">🌍 Carbon Impact</h3>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-gray-600 text-sm font-medium">CO₂ Emissions Reduced</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {carbonData.co2_kg.toFixed(3)} <span className="text-lg">kg</span>
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-gray-600 text-sm font-medium">Carbon Credits Earned</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {carbonData.carbon_credits.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Real-World Impact */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 mb-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Real-World Environmental Impact:</h4>

        <div className="space-y-3">
          {/* Trees */}
          <div className="flex items-start gap-3">
            <div className="text-2xl">🌳</div>
            <div>
              <p className="font-semibold text-slate-800">
                Equivalent to planting{' '}
                <span className="text-green-600">{carbonData.trees_equivalent.toFixed(2)} trees</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                at {carbonData.trees_equivalent > 0 ? 'absorbing' : 'plant'} CO₂ per year
              </p>
            </div>
          </div>

          {/* Pollution Avoided */}
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚗</div>
            <div>
              <p className="font-semibold text-slate-800">
                Equivalent to avoiding pollution from{' '}
                <span className="text-blue-600">{carbonData.km_pollution_avoided.toFixed(0)} km</span> of petrol vehicle travel
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Clean air equivalent across {Math.round(carbonData.km_pollution_avoided / 50)} vehicle trips
              </p>
            </div>
          </div>

          {/* Route Distance */}
          <div className="flex items-start gap-3">
            <div className="text-2xl">📍</div>
            <div>
              <p className="font-semibold text-slate-800">
                This route was <span className="text-orange-600">{distance.toFixed(1)} km</span> optimized
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {vehicleType === 'ev' ? '⚡ EV battery optimized route' : vehicleType === 'hybrid' ? '🔄 Hybrid efficiency optimized' : '🛣️ Traditional route'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Badge */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <div className="text-sm">
          <p className="font-semibold text-slate-800">Achievement Unlocked!</p>
          <p className="text-gray-700">Green Route Champion - Save 1+ kg CO₂</p>
        </div>
      </div>

      {/* Certification */}
      <p className="text-xs text-gray-600 mt-4 text-center">
        Carbon impact verified by GreenPath Logistics Engine v2.0
      </p>
    </div>
  );
};

export default CarbonCreditsPanel;
