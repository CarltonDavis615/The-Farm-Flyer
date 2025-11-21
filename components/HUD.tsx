
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

      {/* Bottom Left: Winter Map Toggle */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <button
          onClick={onToggleTerrain}
          className="group flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity duration-200"
        >
           {/* Removed circle icon */}
           <span className="text-sm tracking-widest font-medium text-shadow-outline uppercase">
             {mapState.mapTypeId === 'satellite' ? 'Winter Map' : 'Satellite'}
           </span>
        </button>
      </div>

      {/* Bottom Center: Address Search */}
      {/* Moved down to bottom-6 to align baseline with text buttons approximately */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             {isSearching ? (
                 <div className="animate-spin h-3 w-3 border-2 border-cyan-500 rounded-full border-t-transparent"></div>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white/60 group-focus-within:text-cyan-400 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
             )}
          </div>
          <input 
             type="text" 
             className="block w-64 pl-10 pr-3 py-1.5 bg-slate-900/60 border border-white/20 rounded-full text-sm placeholder-white/40 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-slate-900/90 transition-all shadow-lg backdrop-blur-sm" 
             placeholder="Enter location..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Bottom Right: Return Home */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <button
          onClick={onResetHome}
          className="group flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity duration-200"
        >
           <span className="text-sm tracking-widest font-medium text-shadow-outline uppercase">Return to Base</span>
           {/* Removed heavy icon container to match left side size and style */}
        </button>
      </div>

    </div>
  );
};

export default HUD;
