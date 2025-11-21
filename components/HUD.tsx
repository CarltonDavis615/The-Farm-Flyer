import React, { useState } from 'react';
import { MapState } from '../types';
import { getAltitudeFromZoom } from '../constants';

interface HUDProps {
  mapState: MapState;
  onToggleTerrain: () => void;
  onResetHome: () => void;
  onSearch: (address: string) => Promise<void>;
}

const HUD: React.FC<HUDProps> = ({ mapState, onToggleTerrain, onResetHome, onSearch }) => {
  const altitude = getAltitudeFromZoom(mapState.zoom);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Blur input to ensure keyboard controls work immediately on map
    (document.activeElement as HTMLElement)?.blur();
    
    setIsSearching(true);
    try {
        await onSearch(searchQuery);
        setSearchQuery('');
    } catch (error) {
        // Error handled in parent
    } finally {
        setIsSearching(false);
    }
  };

  // Format Coordinates to DMS or decimal with high precision
  const formatCoord = (n: number, type: 'lat' | 'lng') => {
    const dir = type === 'lat' ? (n > 0 ? 'N' : 'S') : (n > 0 ? 'E' : 'W');
    const abs = Math.abs(n);
    const deg = Math.floor(abs);
    const min = Math.floor((abs - deg) * 60);
    const sec = ((abs - deg - min / 60) * 3600).toFixed(1);
    return `${deg}°${min}'${sec}"${dir}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50 font-sans text-white">
      
      {/* Top Left: Coordinates (No Box, No Label, just text) */}
      <div className="absolute top-6 left-6 flex flex-col pointer-events-auto">
        <div className="text-xl font-light tracking-wider opacity-90 text-shadow-outline">
          {formatCoord(mapState.center.lat, 'lat')}
        </div>
        <div className="text-xl font-light tracking-wider opacity-90 text-shadow-outline">
          {formatCoord(mapState.center.lng, 'lng')}
        </div>
      </div>

      {/* Top Center: Instructions */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-auto">
        <p className="text-sm tracking-wide opacity-80 font-light text-shadow-outline">
          Use <span className="font-semibold text-white">Arrows</span> to fly • Press <span className="font-semibold text-white">Q</span> or <span className="font-semibold text-white">E</span> for Altitude
        </p>
      </div>

      {/* Top Right: Altitude */}
      <div className="absolute top-6 right-6 text-right pointer-events-auto">
        <div className="text-3xl font-light text-cyan-100 opacity-90 text-shadow-outline">
          {altitude.toLocaleString()} <span className="text-lg opacity-70">FT</span>
        </div>
      </div>

      {/* Bottom Left: Map Type Toggle */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <button
          onClick={onToggleTerrain}
          className="group flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity duration-200"
        >
           {/* Removed circle icon */}
           <span className="text-sm tracking-widest font-medium text
