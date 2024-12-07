import { Battery, Navigation2, Shield, Bot, Car, RefreshCw } from "lucide-react";
import { formatDistance } from "date-fns";

interface CarStatusProps {
  battery: number;
  obstacleDistance: number | null;
  speed: number;
  gpsLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  onRefreshStatus?: () => void;
}

export const CarStatus = ({ 
  battery, 
  obstacleDistance, 
  speed,
  gpsLocation,
  onRefreshStatus 
}: CarStatusProps) => {
  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-car-success";
    if (level > 20) return "text-car-warning";
    return "text-car-error";
  };

  const getObstacleColor = (distance: number | null) => {
    if (distance === null) return "text-car-neutral";
    if (distance > 100) return "text-car-success";
    if (distance > 50) return "text-car-warning";
    return "text-car-error";
  };

  return (
    <div className="glass-panel rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-500" />
          Vehicle Status
        </h2>
        {onRefreshStatus && (
          <button 
            onClick={onRefreshStatus}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-purple-500" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center gap-2">
          <Battery className={`w-6 h-6 ${getBatteryColor(battery)}`} />
          <span className="text-sm font-medium">{battery}%</span>
          <span className="text-xs text-muted-foreground">Battery</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Shield className={`w-6 h-6 ${getObstacleColor(obstacleDistance)}`} />
          <span className="text-sm font-medium">
            {obstacleDistance ? `${obstacleDistance}cm` : 'N/A'}
          </span>
          <span className="text-xs text-muted-foreground">Obstacle</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Navigation2 className="w-6 h-6 text-purple-500" />
          <span className="text-sm font-medium">{speed} km/h</span>
          <span className="text-xs text-muted-foreground">Speed</span>
        </div>
      </div>

      {gpsLocation && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Current Location</span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Latitude:</span>
              <span className="font-medium">{gpsLocation.lat.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Longitude:</span>
              <span className="font-medium">{gpsLocation.lng.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Update:</span>
              <span className="font-medium">
                {formatDistance(gpsLocation.timestamp, new Date(), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};