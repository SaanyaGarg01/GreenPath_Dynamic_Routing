import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { Brain, TrendingUp } from 'lucide-react';

interface TrainingData {
  episode: number;
  reward: number;
  avgReward: number;
  exploration: number;
  exploitation: number;
}

interface AITrainingVisualizationProps {
  trainingData?: TrainingData[];
  totalEpisodes?: number;
  convergenceThreshold?: number;
}

export function AITrainingVisualization({
  trainingData = generateMockTrainingData(),
  totalEpisodes = 500,
  convergenceThreshold = 0.92
}: AITrainingVisualizationProps) {
  const currentEpisode = trainingData.length;
  const isConverged = trainingData.length > 0 && 
    trainingData[trainingData.length - 1].avgReward >= convergenceThreshold * 100;
  
  const progressPercent = Math.round((currentEpisode / totalEpisodes) * 100);
  
  // Calculate exploration vs exploitation balance
  const avgExploration = trainingData.length > 0 
    ? (trainingData.reduce((sum, d) => sum + d.exploration, 0) / trainingData.length).toFixed(1)
    : '0';
  const avgExploitation = trainingData.length > 0
    ? (trainingData.reduce((sum, d) => sum + d.exploitation, 0) / trainingData.length).toFixed(1)
    : '0';

  // Convergence indicator: check if last 20 episodes have low variance
  const recentData = trainingData.slice(-20);
  const recentRewards = recentData.map(d => d.avgReward);
  const recentVariance = recentRewards.length > 1
    ? Math.sqrt(recentRewards.reduce((sum, r, _i, arr) => {
        const mean = arr.reduce((a, b) => a + b) / arr.length;
        return sum + Math.pow(r - mean, 2);
      }, 0) / recentRewards.length)
    : 0;
  
  const convergenceScore = Math.max(0, Math.min(100, 100 - (recentVariance * 10)));

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200 shadow-md space-y-6">
      <div className="flex items-center gap-3 mb-5">
        <Brain className="w-6 h-6 text-indigo-600" />
        <h3 className="text-xl font-bold text-indigo-800">🤖 AI Training Mode</h3>
      </div>

      {/* Training Progress */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-indigo-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Progress</span>
          <div className="text-2xl font-black text-indigo-600">{progressPercent}%</div>
          <div className="text-[9px] text-gray-600 mt-1">{currentEpisode}/{totalEpisodes} episodes</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Episodes</span>
          <div className="text-2xl font-black text-green-600">{currentEpisode}</div>
          <div className="text-[9px] text-gray-600 mt-1">Completed</div>
          <div className="mt-2 text-[10px] text-green-600 font-semibold">
            {Math.round((totalEpisodes - currentEpisode) / 10)} remaining
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Convergence</span>
          <div className="text-2xl font-black text-blue-600">{convergenceScore.toFixed(0)}%</div>
          <div className={`text-[9px] font-semibold mt-1 ${isConverged ? 'text-green-600' : 'text-yellow-600'}`}>
            {isConverged ? '✓ CONVERGED' : '⏳ Training'}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-purple-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Best Reward</span>
          <div className="text-2xl font-black text-purple-600">
            {trainingData.length > 0 ? Math.max(...trainingData.map(d => d.avgReward)).toFixed(0) : '0'}
          </div>
          <div className="text-[9px] text-gray-600 mt-1">Current routes</div>
        </div>
      </div>

      {/* Reward Curve */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Learning Curve (Reward Over Episodes)
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trainingData}>
            <defs>
              <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="episode" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              formatter={(value) => [(value as number).toFixed(1), '']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="reward" 
              name="Episode Reward"
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorReward)"
              strokeWidth={1}
            />
            <Area 
              type="monotone" 
              dataKey="avgReward" 
              name="Avg Reward (20ep)"
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorAvg)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Exploration vs Exploitation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Exploration vs Exploitation</h4>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={trainingData.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="episode" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Bar dataKey="exploration" name="Exploration %" fill="#f59e0b" />
              <Bar dataKey="exploitation" name="Exploitation %" fill="#10b981" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3">Training Insights</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">Avg Exploration</span>
                  <span className="text-sm font-bold text-amber-600">{avgExploration}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${avgExploration}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">Avg Exploitation</span>
                  <span className="text-sm font-bold text-green-600">{avgExploitation}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${avgExploitation}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>Convergence Status:</strong> {isConverged 
                    ? `✓ Model has converged with ${convergenceScore.toFixed(0)}% stability`
                    : `Training in progress. Variance: ${recentVariance.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockTrainingData(): TrainingData[] {
  const data: TrainingData[] = [];
  let avgReward = 20;
  
  for (let i = 1; i <= 250; i++) {
    // Gradually increase average reward with some noise
    const trend = Math.min(1, i / 200);
    const seasonality = Math.sin(i / 10) * 5;
    const noise = (Math.random() - 0.5) * 10;
    
    avgReward = 20 + trend * 70 + seasonality + noise;
    avgReward = Math.max(20, Math.min(90, avgReward));

    // Exploration decreases over time (epsilon decay)
    const exploration = Math.max(5, 100 * Math.exp(-i / 100));
    const exploitation = 100 - exploration;

    const episodeReward = avgReward + (Math.random() - 0.5) * 15;

    data.push({
      episode: i,
      reward: episodeReward,
      avgReward,
      exploration,
      exploitation
    });
  }
  
  return data;
}
