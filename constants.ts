export const INITIAL_COORDINATES = {
  lat: 34.82902777777778, // 34°49'44.5"N
  lng: -85.38988888888889, // 85°23'23.6"W
};

export const MapConfig = {
  MAX_ALTITUDE_FEET: 2500,
  MIN_ALTITUDE_FEET: 100, // Approximate close ground view
  DEFAULT_TILT: 45,
  DEFAULT_HEADING: 0,
  ZOOM_AT_1000_FEET: 17, // ~1600ft. Lower value (higher zoom) starts us closer to ground.
  ZOOM_AT_MIN_FEET: 20,
};

export const PhysicsConfig = {
  ACCELERATION: 0.0000005, // Slower acceleration
  FRICTION: 0.98, // Increased friction for less drift (easier control)
  MAX_VELOCITY: 0.0001, // Lower max speed
  ROTATION_SPEED: 2.0, // Slower rotation
};

// Mapping zoom levels to intuitive "feet" for display
// Google Maps Zoom 21 ~ 10 meters/pixel scale roughly. 
// This is a heuristic for display purposes.
export const getAltitudeFromZoom = (zoom: number): number => {
  // Simplified logarithmic mapping
  // Zoom 21 ~= 50ft, Zoom 15 ~= 2000ft
  const base = 2;
  const maxZoom = 22;
  const scale = Math.pow(base, maxZoom - zoom);
  return Math.round(scale * 50); 
};

export const getZoomFromAltitude = (altitudeFeet: number): number => {
