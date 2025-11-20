export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Velocity {
  x: number; // Longitude delta
  y: number; // Latitude delta
}

export interface MapState {
  center: Coordinates;
  zoom: number;
  tilt: number;
  heading: number;
  mapTypeId: 'satellite' | 'terrain' | 'hybrid';
}

export interface SearchResult {
  address: string;
  location: Coordinates;
}
