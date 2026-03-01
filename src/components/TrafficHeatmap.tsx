import { useMemo } from 'react';
import { MapPin, Zap } from 'lucide-react';

interface TrafficHeatmapProps {
  width?: number;
  height?: number;
  intensity?: number;
  showTrafficPrediction?: boolean;
}

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number; // 0-1
}

const generateTrafficHeatmap = (width: number, height: number, intensity: number): HeatmapPoint[] => {
  const points: HeatmapPoint[] = [];
  const cellSize = 40;
  
  // Create traffic clusters (major intersections, highways, congestion zones)
  const hotspots = [
    { x: width * 0.3, y: height * 0.2, radius: 150, intensity: 0.9 },
    { x: width * 0.7, y: height * 0.3, radius: 120, intensity: 0.75 },
    { x: width * 0.5, y: height * 0.7, radius: 100, intensity: 0.6 },
    { x: width * 0.2, y: height * 0.8, radius: 80, intensity: 0.7 },
    { x: width * 0.8, y: height * 0.6, radius: 90, intensity: 0.65 },
  ];

  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      let cellIntensity = 0.1; // Base traffic

      // Calculate distance to nearest hotspot
      hotspots.forEach(hotspot => {
        const distance = Math.sqrt(Math.pow(x - hotspot.x, 2) + Math.pow(y - hotspot.y, 2));
        const influence = Math.max(0, 1 - (distance / hotspot.radius)) * hotspot.intensity;
        cellIntensity = Math.max(cellIntensity, influence);
      });

      // Apply time-based variation (simulating rush hour)
      const timeVariation = 0.8 + Math.sin(Date.now() / 5000) * 0.2;
      cellIntensity = Math.min(1, cellIntensity * timeVariation * (0.8 + intensity * 0.2));

      // Add random variation for realism
      cellIntensity += (Math.random() - 0.5) * 0.1;
      cellIntensity = Math.max(0, Math.min(1, cellIntensity));

      points.push({ x, y, intensity: cellIntensity });
    }
  }

  return points;
};

const getHeatmapColor = (intensity: number): string => {
  if (intensity < 0.2) return 'rgba(52, 211, 153, 0.3)'; // Green - Free flow
  if (intensity < 0.4) return 'rgba(74, 222, 128, 0.4)'; // Light green
  if (intensity < 0.6) return 'rgba(234, 179, 8, 0.5)'; // Yellow - Moderate
  if (intensity < 0.8) return 'rgba(249, 115, 22, 0.6)'; // Orange - Heavy
  return 'rgba(239, 68, 68, 0.8)'; // Red - Severe
};

export function TrafficHeatmap({
  width = 800,
  height = 600,
  intensity = 0.5,
  showTrafficPrediction = true
}: TrafficHeatmapProps) {
  const heatmapData = useMemo(() => generateTrafficHeatmap(width, height, intensity), [width, height, intensity]);

  const trafficIntensities = heatmapData.map(p => p.intensity);
  const avgTraffic = (trafficIntensities.reduce((a, b) => a + b, 0) / trafficIntensities.length) * 100;
  const peakTraffic = Math.max(...trafficIntensities) * 100;

  // Calculate prediction (simulating next 30 min)
  const predictedIntensity = Math.min(100, avgTraffic * 1.1 + (Math.random() * 5));

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200 shadow-md space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-slate-600" />
          <h3 className="text-xl font-bold text-slate-800">🗺️ Live Traffic Heatmap</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Live</span>
        </div>
      </div>

      {/* Main Heatmap Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white" style={{ width: '100%', maxWidth: `${width}px`, margin: '0 auto' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-gradient-to-b from-blue-100 to-blue-50">
          {/* Background (road network) */}
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* Grid lines (roads) */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * (width / 20)}
              y1={0}
              x2={i * (width / 20)}
              y2={height}
              stroke="#d1d5db"
              strokeWidth={1}
              opacity={0.3}
            />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * (height / 15)}
              x2={width}
              y2={i * (height / 15)}
              stroke="#d1d5db"
              strokeWidth={1}
              opacity={0.3}
            />
          ))}

          {/* Heat squares */}
          {heatmapData.map((point, idx) => (
            <rect
              key={idx}
              x={point.x}
              y={point.y}
              width={40}
              height={40}
              fill={getHeatmapColor(point.intensity)}
              opacity={point.intensity}
            />
          ))}

          {/* Major intersections (hotspots) */}
          <circle cx={width * 0.3} cy={height * 0.2} r={8} fill="rgba(239, 68, 68, 0.8)" className="animate-pulse" />
          <circle cx={width * 0.7} cy={height * 0.3} r={7} fill="rgba(245, 158, 11, 0.8)" className="animate-pulse" />
          <circle cx={width * 0.5} cy={height * 0.7} r={6} fill="rgba(251, 146, 60, 0.8)" className="animate-pulse" />
          <circle cx={width * 0.2} cy={height * 0.8} r={6} fill="rgba(245, 158, 11, 0.8)" className="animate-pulse" />
          <circle cx={width * 0.8} cy={height * 0.6} r={6} fill="rgba(251, 146, 60, 0.8)" className="animate-pulse" />
        </svg>
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-5 gap-2 mt-4">
        <div className="text-center p-2 bg-green-50 rounded border border-green-200">
          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
          <span className="text-[10px] font-bold text-green-700">Free Flow</span>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
          <span className="text-[10px] font-bold text-yellow-700">Moderate</span>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
          <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
          <span className="text-[10px] font-bold text-orange-700">Heavy</span>
        </div>
        <div className="text-center p-2 bg-red-50 rounded border border-red-200">
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
          <span className="text-[10px] font-bold text-red-700">Severe</span>
        </div>
        <div className="text-center p-2 bg-slate-100 rounded border border-slate-300">
          <div className="w-3 h-3 bg-slate-400 rounded-full mx-auto mb-1"></div>
          <span className="text-[10px] font-bold text-slate-700">Incident</span>
        </div>
      </div>

      {/* Traffic Statistics */}
      {showTrafficPrediction && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Current</span>
            <span className="text-lg font-black text-slate-700">{avgTraffic.toFixed(0)}%</span>
            <span className="text-[9px] text-gray-500 block mt-1">Avg Density</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Peak Zone</span>
            <span className="text-lg font-black text-red-600">{peakTraffic.toFixed(0)}%</span>
            <span className="text-[9px] text-gray-500 block mt-1">Highest</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
            <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">+30 min</span>
            <span className="text-lg font-black text-orange-600">{predictedIntensity.toFixed(0)}%</span>
            <span className="text-[9px] text-gray-500 block mt-1">Predicted</span>
          </div>
        </div>
      )}

      {/* Smart Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
        <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Smart Route Tip:</p>
          <p className="text-xs text-blue-800 mt-1">Consider major intersection at coordinates (240, 120) - expect 15 min delay. Alternative route available with +2 km detour but 12 min time savings.</p>
        </div>
      </div>
    </div>
  );
}
