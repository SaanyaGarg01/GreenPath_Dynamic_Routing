import { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Heart, Shield } from 'lucide-react';

interface Alert {
  id: string;
  type: 'accident' | 'stress' | 'battery' | 'emergency';
  severity: 'critical' | 'high' | 'medium';
  message: string;
  timestamp: number;
  dismissed: boolean;
}

interface SmartAlertSystemProps {
  driverStressLevel?: number;
  batteryLevel?: number;
  accidentRisk?: number;
  isEmergency?: boolean;
}

export function SmartAlertSystem({
  driverStressLevel = 0.3,
  batteryLevel = 0.5,
  accidentRisk = 0.2,
  isEmergency = false
}: SmartAlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const newAlerts: Alert[] = [];

    // Accident Risk Detection
    if (accidentRisk > 0.7) {
      newAlerts.push({
        id: 'accident-risk',
        type: 'accident',
        severity: 'critical',
        message: `⚠️ High accident risk detected (${(accidentRisk * 100).toFixed(0)}%). Adjusting route for safer corridors.`,
        timestamp: Date.now(),
        dismissed: false
      });
    }

    // Driver Stress Detection
    if (driverStressLevel > 0.8) {
      newAlerts.push({
        id: 'stress-high',
        type: 'stress',
        severity: 'high',
        message: '😰 High driver stress detected. Auto-rerouting to less congested path with rest stops.',
        timestamp: Date.now(),
        dismissed: false
      });
    } else if (driverStressLevel > 0.6) {
      newAlerts.push({
        id: 'stress-medium',
        type: 'stress',
        severity: 'medium',
        message: '⏱️ Moderate stress levels. Suggest break in 45 minutes.',
        timestamp: Date.now(),
        dismissed: false
      });
    }

    // Battery Critical
    if (batteryLevel < 0.15) {
      newAlerts.push({
        id: 'battery-critical',
        type: 'battery',
        severity: 'critical',
        message: `🔋 Battery critical (${(batteryLevel * 100).toFixed(0)}%). Nearest charging station: 2.3 km ahead.',`,
        timestamp: Date.now(),
        dismissed: false
      });
    } else if (batteryLevel < 0.3) {
      newAlerts.push({
        id: 'battery-low',
        type: 'battery',
        severity: 'high',
        message: `🔋 Battery low (${(batteryLevel * 100).toFixed(0)}%). Plan charging stop within 5 km.`,
        timestamp: Date.now(),
        dismissed: false
      });
    }

    // Emergency Override
    if (isEmergency) {
      newAlerts.push({
        id: 'emergency-override',
        type: 'emergency',
        severity: 'critical',
        message: '🚨 EMERGENCY PRIORITY OVERRIDE ACTIVE - Hospital route engaged. All constraints lifted.',
        timestamp: Date.now(),
        dismissed: false
      });
    }

    setAlerts(newAlerts);
  }, [driverStressLevel, batteryLevel, accidentRisk, isEmergency]);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, dismissed: true } : a));
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);

  if (activeAlerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'accident':
        return <AlertTriangle className="w-5 h-5" />;
      case 'stress':
        return <Heart className="w-5 h-5" />;
      case 'battery':
        return <Zap className="w-5 h-5" />;
      case 'emergency':
        return <Shield className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-red-500 text-red-700';
      case 'high':
        return 'bg-orange-50 border-l-4 border-orange-500 text-orange-700';
      case 'medium':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
        <Shield className="w-4 h-4" /> Live Alerts
      </h3>
      
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-3 rounded-lg border ${getAlertStyles(alert.severity)} animate-pulse-subtle transition-all`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{alert.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-bold opacity-60">
                    {alert.severity.toUpperCase()}
                  </span>
                  {alert.type === 'stress' && (
                    <button className="text-[10px] font-bold px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-100 transition">
                      Reroute Now
                    </button>
                  )}
                  {alert.type === 'battery' && (
                    <button className="text-[10px] font-bold px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-100 transition">
                      Navigate to Charging
                    </button>
                  )}
                  {alert.type === 'accident' && (
                    <button className="text-[10px] font-bold px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-100 transition">
                      Safe Routes
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-lg opacity-60 hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
