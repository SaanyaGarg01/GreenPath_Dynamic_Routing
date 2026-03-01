import { Smartphone, Truck, MapPin, AlertCircle, Battery, Clock } from 'lucide-react';
import { RouteResult } from '../types/simulation';

interface FleetVehicle {
  id: string;
  driver: string;
  vehicle: string;
  status: 'active' | 'idle' | 'charging';
  location: string;
  eta: number;
  fuelLevel: number;
  driverStress: number;
  route: RouteResult;
}

interface MobileFleetManagerProps {
  vehicles?: FleetVehicle[];
  selectedVehicleId?: string;
  onSelectVehicle?: (id: string) => void;
}

const generateMockFleet = (): FleetVehicle[] => [
  {
    id: 'ev-001',
    driver: 'Raj Kumar',
    vehicle: 'EV-Tesla M3',
    status: 'active',
    location: 'NH-5, Bangalore',
    eta: 18,
    fuelLevel: 0.75,
    driverStress: 0.35,
    route: {
      path: [0, 5, 12, 23],
      totalDistance: 24.5,
      totalTime: 48,
      totalFuel: 2.1,
      co2Emissions: 0.84,
      steps: []
    }
  },
  {
    id: 'hybrid-002',
    driver: 'Priya Singh',
    vehicle: 'Hybrid-Innova',
    status: 'active',
    location: 'ORR, Bangalore',
    eta: 25,
    fuelLevel: 0.55,
    driverStress: 0.58,
    route: {
      path: [0, 8, 15, 32],
      totalDistance: 28.3,
      totalTime: 52,
      totalFuel: 3.2,
      co2Emissions: 3.84,
      steps: []
    }
  },
  {
    id: 'petrol-003',
    driver: 'Arun Patel',
    vehicle: 'Petrol-Indica',
    status: 'charging',
    location: 'Charging Hub, Whitefield',
    eta: 0,
    fuelLevel: 0.1,
    driverStress: 0.2,
    route: {
      path: [0, 9, 18, 31],
      totalDistance: 31.2,
      totalTime: 64,
      totalFuel: 3.8,
      co2Emissions: 8.77,
      steps: []
    }
  }
];

export function MobileFleetManager({
  vehicles = generateMockFleet(),
  selectedVehicleId = 'ev-001',
  onSelectVehicle = () => {}
}: MobileFleetManagerProps) {
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const activeCount = vehicles.filter(v => v.status === 'active').length;
  const totalDistance = vehicles.reduce((sum, v) => sum + v.route.totalDistance, 0);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200 shadow-md space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Smartphone className="w-6 h-6 text-slate-600" />
          <h3 className="text-xl font-bold text-slate-800">📱 Fleet Manager Mobile</h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-green-600">{activeCount} Active</span>
          <span className="text-[10px] text-gray-500 block">{vehicles.length} Total</span>
        </div>
      </div>

      {/* Fleet Overview Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Active</span>
          <span className="text-2xl font-black text-green-600">{activeCount}</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Total Dist</span>
          <span className="text-2xl font-black text-blue-600">{totalDistance.toFixed(0)} km</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Avg Stress</span>
          <span className="text-2xl font-black text-orange-600">
            {(vehicles.reduce((sum, v) => sum + v.driverStress, 0) / vehicles.length * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Vehicle List - Scrollable */}
      <div className="bg-white rounded-lg border border-slate-200 p-2 space-y-2 max-h-48 overflow-y-auto">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onSelectVehicle(vehicle.id)}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
              selectedVehicleId === vehicle.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-bold text-slate-800">{vehicle.driver}</span>
                <span className="text-[10px] text-gray-600 block">{vehicle.vehicle}</span>
              </div>
              <div className={`px-2 py-1 rounded text-[9px] font-bold ${
                vehicle.status === 'active' ? 'bg-green-100 text-green-700' :
                vehicle.status === 'charging' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {vehicle.status.toUpperCase()}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-3 h-3" /> {vehicle.location}
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-3 h-3" /> ETA: {vehicle.eta}m
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Battery className="w-3 h-3" /> {(vehicle.fuelLevel * 100).toFixed(0)}%
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Vehicle Detailed View */}
      {selectedVehicle && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 space-y-3">
          <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
            <Truck className="w-4 h-4" /> {selectedVehicle.driver} - {selectedVehicle.vehicle}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Fuel/Battery */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  {selectedVehicle.vehicle.includes('EV') ? 'Battery' : 'Fuel'}
                </span>
                <span className="text-sm font-bold text-slate-800">{(selectedVehicle.fuelLevel * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    selectedVehicle.fuelLevel > 0.3 ? 'bg-green-500' :
                    selectedVehicle.fuelLevel > 0.15 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedVehicle.fuelLevel * 100}%` }}
                />
              </div>
            </div>

            {/* Driver Stress */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-700">Driver Stress</span>
                <span className="text-sm font-bold text-slate-800">{(selectedVehicle.driverStress * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    selectedVehicle.driverStress < 0.4 ? 'bg-green-500' :
                    selectedVehicle.driverStress < 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${selectedVehicle.driverStress * 100}%` }}
                />
              </div>
            </div>

            {/* ETA */}
            <div className="bg-white rounded p-2 border border-blue-100">
              <span className="text-[10px] text-gray-600 font-semibold block mb-1">ETA</span>
              <span className="text-lg font-black text-blue-600">
                {selectedVehicle.eta > 0 ? `${selectedVehicle.eta} min` : 'Charging'}
              </span>
            </div>

            {/* Location */}
            <div className="bg-white rounded p-2 border border-blue-100">
              <span className="text-[10px] text-gray-600 font-semibold block mb-1">Location</span>
              <span className="text-xs font-bold text-slate-700 truncate">{selectedVehicle.location}</span>
            </div>

            {/* Distance */}
            <div className="bg-white rounded p-2 border border-blue-100">
              <span className="text-[10px] text-gray-600 font-semibold block mb-1">Distance</span>
              <span className="text-lg font-black text-slate-700">{selectedVehicle.route.totalDistance.toFixed(1)} km</span>
            </div>

            {/* Fuel Consumed */}
            <div className="bg-white rounded p-2 border border-blue-100">
              <span className="text-[10px] text-gray-600 font-semibold block mb-1">Fuel</span>
              <span className="text-lg font-black text-slate-700">{selectedVehicle.route.totalFuel.toFixed(1)} L</span>
            </div>
          </div>

          {/* Route Path */}
          <div className="bg-white rounded p-2 border border-blue-100">
            <span className="text-[10px] text-gray-600 font-semibold block mb-1">Route Path</span>
            <span className="text-xs text-slate-700 font-mono">{selectedVehicle.route.path.join(' → ')}</span>
          </div>

          {/* Alerts */}
          {(selectedVehicle.fuelLevel < 0.3 || selectedVehicle.driverStress > 0.7) && (
            <div className="bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-red-700 space-y-0.5">
                {selectedVehicle.fuelLevel < 0.3 && <p>⚠️ Fuel/Battery running low</p>}
                {selectedVehicle.driverStress > 0.7 && <p>⚠️ High driver stress - suggest break</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fleet Performance */}
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <span className="text-[10px] text-gray-600 font-bold uppercase block mb-2">Fleet Performance</span>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[9px] text-gray-600 block">Avg Stress</span>
            <span className="text-sm font-bold text-orange-600">
              {(vehicles.reduce((s, v) => s + v.driverStress, 0) / vehicles.length * 100).toFixed(0)}%
            </span>
          </div>
          <div>
            <span className="text-[9px] text-gray-600 block">Total CO₂</span>
            <span className="text-sm font-bold text-slate-700">
              {(vehicles.reduce((s, v) => s + v.route.co2Emissions, 0)).toFixed(2)} kg
            </span>
          </div>
          <div>
            <span className="text-[9px] text-gray-600 block">Total Time</span>
            <span className="text-sm font-bold text-blue-600">
              {Math.round(vehicles.reduce((s, v) => s + v.route.totalTime, 0) / 60)}h {Math.round(vehicles.reduce((s, v) => s + v.route.totalTime, 0) % 60)}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
