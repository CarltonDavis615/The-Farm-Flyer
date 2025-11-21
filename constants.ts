
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

// Winter Map Style (Snowy/clean look)
export const WINTER_MAP_STYLE = [
    {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [{ "color": "#eef2f3" }] // Snow / White landscape
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#a5bfdd" }] // Icy Blue
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{ "color": "#ffffff" }] // White roads
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#cbd5e1" }] // Subtle grey edges
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#e2e6e9" }] // Bare trees (greyish)
    },
    {
        "featureType": "poi",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }] // Hide icons for cleaner look
    },
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#64748b" }] // Slate text
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [{ "visibility": "on" }, { "color": "#eef2f3" }, { "weight": 2 }] // Snow halo
    }
];

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
    // Inverse of above roughly
    // Clamp to valid range
    if (altitudeFeet <= 0) return 21;
    const maxZoom = 22;
    // scale = alt / 50
    // 2^(max-zoom) = alt/50
    // max-zoom = log2(alt/50)
    // zoom = max - log2(alt/50)
    const zoom = maxZoom - Math.log2(altitudeFeet / 50);
    return Math.min(Math.max(zoom, 15), 21);
};
