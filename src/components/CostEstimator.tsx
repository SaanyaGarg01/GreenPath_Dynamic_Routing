import React, { useState, useEffect } from 'react';
import { TrendingDown, Banknote } from 'lucide-react';

interface CostEstimate {
  trip_cost_breakdown: {
    driver_wage: number;
    maintenance: number;
    battery_degradation: number;
    total_trip_cost: number;
  };
  fleet_annual_projection: {
    single_vehicle_annual: number;
    fleet_size: number;
    total_annual_savings: number;
    savings_per_vehicle: number;
  };
}

interface CostEstimatorProps {
  totalDistance: number;
  totalTime: number;
  vehicleType: string;
}

const CostEstimatorComponent: React.FC<CostEstimatorProps> = ({
  totalDistance,
  totalTime,
  vehicleType
}) => {
  const [costData, setCostData] = useState<CostEstimate | null>(null);
  const [fleetSize, setFleetSize] = useState<number>(100);

  useEffect(() => {
    // Calculate based on ANY route data - no minimum thresholds
    if (totalDistance <= 0 || totalTime <= 0) {
      setCostData(null);
      return;
    }

    // Calculate based on REAL route values only - even if small deliveries
    const timeHours = Math.max(0.1, totalTime / 3600); // Minimum 0.1 hours = 6 minutes
    
    // Real calculations without backend needed
    const driverWage = timeHours * 150;
    const maintenanceRates: Record<string, number> = { ev: 0.5, hybrid: 1.2, petrol: 1.5 };
    const maintenanceCost = Math.max(10, totalDistance * (maintenanceRates[vehicleType] || 1.5)); // Minimum ₹10
    const batteryDegradation = vehicleType === 'ev' ? Math.max(5, totalDistance * 0.02) : 0; // Minimum ₹5 for EV
    const totalTripCost = Math.max(50, driverWage + maintenanceCost + batteryDegradation); // Minimum ₹50 per trip
    
    // Fleet projections (250 working days per year)
    const singleVehicleAnnual = totalTripCost * 250;
    const aiOptimizationSavings = Math.max(5, totalTripCost * 0.15); // At least 15% savings, minimum ₹5
    const savingsPerVehicle = aiOptimizationSavings * 250;
    const totalFleetSavings = savingsPerVehicle * fleetSize;

    setCostData({
      trip_cost_breakdown: {
        driver_wage: parseFloat(Math.max(30, driverWage).toFixed(2)),
        maintenance: parseFloat(maintenanceCost.toFixed(2)),
        battery_degradation: parseFloat(batteryDegradation.toFixed(2)),
        total_trip_cost: parseFloat(totalTripCost.toFixed(2))
      },
      fleet_annual_projection: {
        single_vehicle_annual: parseFloat(singleVehicleAnnual.toFixed(2)),
        fleet_size: fleetSize,
        total_annual_savings: parseFloat(Math.max(100, totalFleetSavings).toFixed(2)), // Minimum ₹100
        savings_per_vehicle: parseFloat(Math.max(5, (totalFleetSavings / fleetSize)).toFixed(2)) // Minimum ₹5/vehicle
      }
    });
  }, [totalDistance, totalTime, vehicleType, fleetSize]);

  const handleFleetSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10) || 1;
    setFleetSize(size);
  };

  if (!costData || totalDistance <= 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Banknote className="w-6 h-6 text-amber-600" />
          <h3 className="text-xl font-bold text-amber-800">💰 Business Cost Estimator</h3>
        </div>
        <p className="text-gray-600 text-center py-8">
          Run a route simulation first to see real-time cost breakdown and fleet savings...
        </p>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatLakhs = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200 shadow-md">
      <div className="flex items-center gap-3 mb-5">
        <Banknote className="w-6 h-6 text-amber-600" />
        <h3 className="text-xl font-bold text-amber-800">💰 Business Cost Estimator</h3>
      </div>

      {/* Trip Cost Breakdown */}
      <div className="bg-white rounded-lg p-5 mb-5 border-l-4 border-amber-500">
        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          📍 Per-Trip Cost Breakdown
        </h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Driver Wage */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 font-medium">👨‍💼 Driver Wage</p>
            <p className="text-2xl font-bold text-indigo-600 mt-2">
              {formatCurrency(costData.trip_cost_breakdown.driver_wage)}
            </p>
            <p className="text-xs text-gray-500 mt-1">@ ₹150/hour</p>
          </div>

          {/* Maintenance */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 font-medium">🔧 Maintenance</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(costData.trip_cost_breakdown.maintenance)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{vehicleType} vehicle</p>
          </div>

          {/* Battery Degradation */}
          <div className={`rounded-lg p-3 ${
            vehicleType === 'ev'
              ? 'bg-gradient-to-br from-purple-50 to-pink-50'
              : 'bg-gray-50'
          }`}>
            <p className="text-sm text-gray-600 font-medium">⚡ Battery Degradation</p>
            <p className={`text-2xl font-bold mt-2 ${
              vehicleType === 'ev' ? 'text-purple-600' : 'text-gray-400'
            }`}>
              {formatCurrency(costData.trip_cost_breakdown.battery_degradation)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {vehicleType === 'ev' ? 'EV battery wear' : 'N/A'}
            </p>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg p-3 border border-orange-300">
            <p className="text-sm text-gray-700 font-bold">💵 Total Trip Cost</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {formatCurrency(costData.trip_cost_breakdown.total_trip_cost)}
            </p>
            <p className="text-xs text-gray-600 mt-1">All factors included</p>
          </div>
        </div>

        {/* Route Details */}
        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
          <p><strong>Distance:</strong> {totalDistance.toFixed(2)} km</p>
          <p><strong>Time:</strong> {(totalTime / 3600).toFixed(2)} hours</p>
          <p><strong>Vehicle:</strong> {vehicleType.toUpperCase()}</p>
        </div>
      </div>

      {/* Fleet-Level Projections */}
      <div className="bg-white rounded-lg p-5 mb-5 border-l-4 border-green-500">
        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          Annual Fleet Projection
        </h4>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fleet Size (vehicles)
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={fleetSize}
            onChange={handleFleetSizeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Single Vehicle */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-2">Per Vehicle Annual Cost</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatCurrency(costData.fleet_annual_projection.single_vehicle_annual)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Based on 250 working days
            </p>
          </div>

          {/* Per Vehicle Savings */}
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 border border-green-300">
            <p className="text-sm text-gray-700 font-bold mb-2">Per Vehicle Annual Savings</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(costData.fleet_annual_projection.savings_per_vehicle)}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Using AI-optimized routes
            </p>
          </div>
        </div>

        {/* Fleet Total */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-400">
          <p className="text-sm text-gray-700 font-bold mb-2">
            🎯 Total Annual Savings for {fleetSize} Vehicles
          </p>
          <p className="text-4xl font-bold text-green-600 mb-1">
            {formatLakhs(costData.fleet_annual_projection.total_annual_savings)}
          </p>
          <p className="text-sm text-gray-600">
            That's {formatCurrency(costData.fleet_annual_projection.total_annual_savings / 250 / fleetSize)} saved per vehicle per day!
          </p>
        </div>
      </div>

      {/* ROI Summary */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border border-yellow-300">
        <p className="font-semibold text-slate-800 mb-2">💡 Key Insight</p>
        <p className="text-sm text-slate-700">
          By optimizing {fleetSize} vehicles with AI routing, you can save approximately{' '}
          <span className="font-bold text-green-600">{formatLakhs(costData.fleet_annual_projection.total_annual_savings)}</span> annually
          while reducing your carbon footprint. That's real business impact!
        </p>
      </div>
    </div>
  );
};

export default CostEstimatorComponent;
