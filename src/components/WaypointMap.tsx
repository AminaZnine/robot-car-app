import { useState, useRef, useEffect } from "react";
import { MapPin, Send, Trash, History } from "lucide-react";
import { toast } from "sonner";

interface Coordinate {
  lat: number;
  lng: number;
}

interface WaypointMapProps {
  onAddWaypoint: (coordinate: Coordinate) => void;
  carLocation?: Coordinate;
  isMoving?: boolean;
}

export const WaypointMap = ({ onAddWaypoint, carLocation, isMoving }: WaypointMapProps) => {
  const [points, setPoints] = useState<Coordinate[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [carPosition, setCarPosition] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lat = ((rect.height - y) / rect.height) * 90;
    const lng = ((x / rect.width) * 360) - 180;

    const newPoint = { lat, lng };
    setPoints(prev => [...prev, newPoint]);
    onAddWaypoint(newPoint);
    toast.success("Waypoint added at coordinates: " + lat.toFixed(6) + ", " + lng.toFixed(6));
  };

  const getPixelCoordinates = (coord: Coordinate) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const rect = mapRef.current.getBoundingClientRect();
    
    const x = ((coord.lng + 180) / 360) * rect.width;
    const y = rect.height - ((coord.lat / 90) * rect.height);
    
    return { x, y };
  };

  useEffect(() => {
    if (carLocation) {
      const pos = getPixelCoordinates(carLocation);
      setCarPosition(pos);
    }
  }, [carLocation]);

  const handleClearAllWaypoints = () => {
    setPoints([]);
    toast.info("All waypoints cleared");
  };

  const handleClearPreviousWaypoint = () => {
    if (points.length > 0) {
      setPoints(prev => prev.slice(0, -1));
      toast.info("Previous waypoint removed");
    } else {
      toast.error("No waypoints to remove");
    }
  };

  const handleSendInstructions = () => {
    if (points.length === 0) {
      toast.error("No waypoints to send");
      return;
    }
    toast.success("Instructions sent to vehicle");
    console.log("Sending waypoints to car:", points);
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Visual Waypoint Map</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendInstructions}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-500"
              title="Send instructions to vehicle"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={mapRef}
          className="relative w-full h-[300px] bg-slate-100 dark:bg-slate-800/50 rounded-lg cursor-crosshair overflow-hidden"
          onClick={handleClick}
        >
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-slate-200 dark:border-slate-700/50" />
            ))}
          </div>
          
          {/* Draw connecting lines between points */}
          <svg className="absolute inset-0 pointer-events-none">
            {points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = points[index - 1];
              const start = getPixelCoordinates(prevPoint);
              const end = getPixelCoordinates(point);
              
              return (
                <line
                  key={`line-${index}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="4"
                  className="animate-fade-in"
                />
              );
            })}
          </svg>

          {/* Draw points */}
          {points.map((point, index) => {
            const { x, y } = getPixelCoordinates(point);
            return (
              <div
                key={`point-${index}`}
                className="absolute w-3 h-3 rounded-full bg-primary animate-fade-in"
                style={{
                  left: `${x - 6}px`,
                  top: `${y - 6}px`,
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium">
                  {index + 1}
                </div>
              </div>
            );
          })}

          {/* Draw car position with enhanced animation */}
          {carPosition && (
            <div
              className={`absolute w-4 h-4 transition-all duration-500`}
              style={{
                left: `${carPosition.x - 8}px`,
                top: `${carPosition.y - 8}px`,
                transform: isMoving ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              <div className={`
                w-full h-full rounded-full 
                bg-car-success
                ${isMoving ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}
                relative
              `}>
                {isMoving && (
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 rounded-full bg-car-success animate-ping opacity-75"></div>
                    <div className="absolute inset-0 rounded-full bg-car-success animate-pulse opacity-50"></div>
                  </div>
                )}
              </div>
            </div>
          )}
            
          <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-6 h-6 opacity-25" />
        </div>

        <p className="text-sm text-muted-foreground">
          Click anywhere on the map to add a waypoint. Points will be automatically connected in sequence.
        </p>
      </div>

      <div className="glass-panel rounded-xl p-3 flex justify-center gap-4">
        <button
          onClick={handleClearPreviousWaypoint}
          className="control-button flex items-center gap-2"
          title="Clear previous waypoint"
        >
          <History className="w-5 h-5" />
          <span>Clear Previous</span>
        </button>
        <button
          onClick={handleClearAllWaypoints}
          className="control-button flex items-center gap-2"
          title="Clear all waypoints"
        >
          <Trash className="w-5 h-5" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
};