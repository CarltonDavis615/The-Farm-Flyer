
import { useEffect, useRef, useState } from 'react';
import { Velocity, Coordinates } from '../types';
import { PhysicsConfig, MapConfig, getAltitudeFromZoom, getZoomFromAltitude } from '../constants';

interface GameLoopProps {
  initialCenter: Coordinates;
  initialZoom: number;
}

export const useGameLoop = ({ initialCenter, initialZoom }: GameLoopProps) => {
  const [center, setCenter] = useState<Coordinates>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  
  // Direct reference to Google Maps instance to bypass React render cycle for camera updates
  const mapInstanceRef = useRef<any>(null);
  
  // Mutable state for physics calculations
  const velocityRef = useRef<Velocity>({ x: 0, y: 0 });
  const centerRef = useRef<Coordinates>(initialCenter);
  const zoomRef = useRef<number>(initialZoom);
  const rotationRef = useRef<number>(0); // Ship rotation (0 = North)
  const targetTiltRef = useRef<number>(MapConfig.DEFAULT_TILT);
  const keysPressed = useRef<Set<string>>(new Set());
  const requestRef = useRef<number | null>(null);
  
  // Throttle counter to reduce React render frequency
  const frameCountRef = useRef<number>(0);

  // Handle Key Press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore game controls if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      keysPressed.current.add(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Physics Loop
  useEffect(() => {
    const updatePhysics = () => {
        // 1. Update Heading (Rotation) based on Left/Right
        const keys = keysPressed.current;
        
        if (keys.has('ArrowLeft')) {
        rotationRef.current -= PhysicsConfig.ROTATION_SPEED;
        }
        if (keys.has('ArrowRight')) {
        rotationRef.current += PhysicsConfig.ROTATION_SPEED;
        }

        // Normalize rotation to 0-360 for cleaner math
        rotationRef.current = rotationRef.current % 360;

        // DYNAMIC PHYSICS: Scale speed based on zoom/altitude
        const currentZoom = zoomRef.current;
        const speedScale = Math.pow(2, MapConfig.ZOOM_AT_1000_FEET - currentZoom);

        const effectiveAcceleration = PhysicsConfig.ACCELERATION * speedScale;
        const effectiveMaxVelocity = PhysicsConfig.MAX_VELOCITY * speedScale;

        // 2. Update Velocity based on Thrust (Up Arrow)
        if (keys.has('ArrowUp')) {
        const rad = (rotationRef.current * Math.PI) / 180;
        // Sin is X (Longitude), Cos is Y (Latitude) because 0deg is UP (Y-axis)
        const ax = Math.sin(rad) * effectiveAcceleration;
        const ay = Math.cos(rad) * effectiveAcceleration;
        
        velocityRef.current.x += ax;
        velocityRef.current.y += ay;
        }
        
        // Down arrow as "Brake"
        if (keys.has('ArrowDown')) {
            velocityRef.current.x *= 0.95;
            velocityRef.current.y *= 0.95;
        }

        // Apply Friction (Space Drag)
        velocityRef.current.x *= PhysicsConfig.FRICTION;
        velocityRef.current.y *= PhysicsConfig.FRICTION;

        // Cap Velocity
        const speed = Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.y ** 2);
        if (speed > effectiveMaxVelocity) {
        const ratio = effectiveMaxVelocity / speed;
        velocityRef.current.x *= ratio;
        velocityRef.current.y *= ratio;
        }

        // 3. Update Position
        const currentCenter = centerRef.current;
        
        // Adjust longitude delta by 1/cos(lat) to normalize ground distance (Mercator projection fix)
        const latRad = (currentCenter.lat * Math.PI) / 180;
        const cosLat = Math.max(0.1, Math.abs(Math.cos(latRad))); // Prevent div by zero
        
        centerRef.current = {
        lat: currentCenter.lat + velocityRef.current.y,
        lng: currentCenter.lng + (velocityRef.current.x / cosLat)
        };

        // 4. Update Altitude (Zoom)
        let zoomVal = zoomRef.current;
        const altitude = getAltitudeFromZoom(zoomVal);
        let altitudeChanged = false;
        const ALTITUDE_SPEED = 15;

        if (keys.has('KeyQ')) {
        const newAlt = Math.min(altitude + ALTITUDE_SPEED, MapConfig.MAX_ALTITUDE_FEET);
        zoomVal = getZoomFromAltitude(newAlt);
        altitudeChanged = true;
        }
        if (keys.has('KeyE')) {
        const newAlt = Math.max(altitude - ALTITUDE_SPEED, MapConfig.MIN_ALTITUDE_FEET);
        zoomVal = getZoomFromAltitude(newAlt);
        altitudeChanged = true;
        }
        zoomRef.current = zoomVal;

        // IMPERATIVE MAP UPDATE
        if (mapInstanceRef.current) {
            const map = mapInstanceRef.current;
            if (map.moveCamera) {
                map.moveCamera({
                    center: centerRef.current,
                    zoom: zoomRef.current,
                    tilt: targetTiltRef.current,
                    heading: MapConfig.DEFAULT_HEADING
                });
            } else {
                map.setCenter(centerRef.current);
                map.setZoom(zoomRef.current);
                if (Math.abs(map.getTilt() - targetTiltRef.current) > 1) {
                    map.setTilt(targetTiltRef.current);
                }
            }
        }

        // 5. Sync React State (Throttled)
        frameCountRef.current++;
        const isMoving = Math.abs(velocityRef.current.x) > 0.0000001 || Math.abs(velocityRef.current.y) > 0.0000001 || altitudeChanged || keys.has('ArrowLeft') || keys.has('ArrowRight');
        
        if (frameCountRef.current % 3 === 0 || !isMoving) {
            setVelocity({ ...velocityRef.current });
            setCenter({ ...centerRef.current });
            setZoom(zoomVal);
            setRotation(rotationRef.current);
        }

        requestRef.current = requestAnimationFrame(updatePhysics);
    };

    requestRef.current = requestAnimationFrame(updatePhysics);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const forceSetLocation = (loc: Coordinates) => {
    centerRef.current = loc;
    velocityRef.current = { x: 0, y: 0 };
    setCenter(loc);
    setVelocity({ x: 0, y: 0 });
    
    // Immediately update map to prevent "stuck" feeling
    if (mapInstanceRef.current) {
        if (mapInstanceRef.current.moveCamera) {
             mapInstanceRef.current.moveCamera({
                center: loc,
                zoom: zoomRef.current,
                tilt: targetTiltRef.current,
                heading: MapConfig.DEFAULT_HEADING
            });
        } else {
            mapInstanceRef.current.setCenter(loc);
        }
    }
  };

  const setMapInstance = (map: any) => {
      mapInstanceRef.current = map;
  };
  
  const setTargetTilt = (tilt: number) => {
      targetTiltRef.current = tilt;
      if (mapInstanceRef.current) {
          mapInstanceRef.current.setTilt(tilt);
      }
  };

  return {
    center,
    zoom,
    velocity,
    rotation,
    forceSetLocation,
    setMapInstance,
    setTargetTilt
  };
};
