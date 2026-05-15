import React, { useState, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Bike, Car, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface Vehicle {
  id: number;
  type: 'bike' | 'auto' | 'car';
  position: [number, number];
  offset: [number, number];
}

interface VehicleSimulationProps {
  pickup: [number, number];
}

const createCustomIcon = (type: 'bike' | 'auto' | 'car') => {
  const iconHtml = renderToStaticMarkup(
    <div className={`p-1.5 rounded-full bg-white shadow-md border-2 ${
      type === 'bike' ? 'border-emerald-500 text-emerald-600' : 
      type === 'auto' ? 'border-amber-500 text-amber-600' : 
      'border-indigo-500 text-indigo-600'
    }`}>
      {type === 'bike' ? <Bike size={16} /> : 
       type === 'auto' ? <Navigation size={16} className="rotate-45" /> : 
       <Car size={16} />}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-vehicle-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const VehicleSimulation: React.FC<VehicleSimulationProps> = ({ pickup }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Initialize random vehicles around pickup
    const initialVehicles: Vehicle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      type: i % 3 === 0 ? 'bike' : i % 3 === 1 ? 'auto' : 'car',
      position: [
        pickup[0] + (Math.random() - 0.5) * 0.02,
        pickup[1] + (Math.random() - 0.5) * 0.02
      ],
      offset: [(Math.random() - 0.5) * 0.0001, (Math.random() - 0.5) * 0.0001]
    }));
    setVehicles(initialVehicles);

    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => ({
        ...v,
        position: [
          v.position[0] + v.offset[0],
          v.position[1] + v.offset[1]
        ],
        // Occasionally change direction
        offset: Math.random() > 0.95 ? 
          [(Math.random() - 0.5) * 0.0001, (Math.random() - 0.5) * 0.0001] : 
          v.offset
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [pickup]);

  return (
    <>
      {vehicles.map(v => (
        <Marker 
          key={v.id} 
          position={v.position} 
          icon={createCustomIcon(v.type)}
        />
      ))}
    </>
  );
};

export default VehicleSimulation;
