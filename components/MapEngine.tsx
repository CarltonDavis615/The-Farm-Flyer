import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, geocodeAddress } from '../services/googleMapsService';
import { MapConfig, INITIAL_COORDINATES, getZoomFromAltitude } from '../constants';
import { MapState, Coordinates } from '../types';
import HUD from './HUD';
import Spaceship from './Spaceship';
import { useGameLoop } from '../hooks/useGameLoop';

interface MapEngineProps {
  apiKey: string;
}

const MapEngine: React.FC<MapEngineProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Reverted default to satellite, removed 'winter' type constraint
  const [mapType, setMapType] = useState('satellite');

  // Calculate initial zoom for 700 feet
  const INITIAL_ZOOM = getZoomFromAltitude(700);

  // Initialize Physics Loop
  const { center, zoom, velocity, rotation, forceSetLocation, setMapInstance, setTargetTilt } = useGameLoop({
    initialCenter: INITIAL_COORDINATES,
    initialZoom: INITIAL_ZOOM
  });

  // Load Google Maps
  useEffect(() => {
    loadGoogleMapsScript(apiKey)
      .then(() => {
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to load Google Maps", err);
        alert("Failed to load Google Maps. Check your API key.");
      });
  }, [apiKey]);

  // Initialize Map Instance
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: INITIAL_COORDINATES,
        zoom: INITIAL_ZOOM,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        tilt: MapConfig.DEFAULT_TILT,
        heading: MapConfig.DEFAULT_HEADING,
        draggable: false, // Disable drag, we control via physics
        scrollwheel: false,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        gestureHandling: 'none',
        isFractionalZoomEnabled: true 
      });

      mapInstanceRef.current = map;
      
      // Pass map instance to physics engine
      setMapInstance(map);
    }
  }, [mapLoaded, setMapInstance, INITIAL_ZOOM]);

  // Handle Map Type Changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    mapInstanceRef.current.setMapTypeId(mapType);
    
    // Update tilt target
    // Satellite gets tilt for 3D effect, Terrain (Topography) looks better flat (0 tilt)
    if (mapType === 'satellite') {
        setTargetTilt(MapConfig.DEFAULT_TILT);
    } else {
        setTargetTilt(0);
    }
  }, [mapType, setTargetTilt]);

  const handleToggleTerrain = () => {
    // Toggle between Satellite and standard Terrain (Topography)
    const newType = mapType === 'satellite' ? 'terrain' : 'satellite';
    setMapType(newType);
  };

  const handleResetHome = () => {
    forceSetLocation(INITIAL_COORDINATES);
  };

  const handleSearch = async (address: string) => {
    try {
        const location = await geocodeAddress(address);
        forceSetLocation(location);
    } catch (error) {
        console.error("Geocoding error:", error);
        alert("Could not find that location.");
    }
  };

  const mapState: MapState = {
    center,
    zoom,
    tilt: mapType === 'satellite' ? MapConfig.DEFAULT_TILT : 0,
    heading: MapConfig.DEFAULT_HEADING,
    mapTypeId: mapType,
  };

  return (
    <div className="relative w-full h-full">
      {/* The Map Container */}
      <div ref={mapRef} className="w-full h-full absolute inset-0 z-0" />
      
      {/* Overlay Elements */}
      <Spaceship velocity={velocity} rotation={rotation} />
      
      {/* HUD Layer */}
      <HUD 
        mapState={mapState} 
        onToggleTerrain={handleToggleTerrain}
        onResetHome={handleResetHome}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default MapEngine;
