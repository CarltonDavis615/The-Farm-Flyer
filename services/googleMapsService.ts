import { Coordinates } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

let isLoaded = false;

export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isLoaded) {
      resolve();
      return;
    }

    if (window.google && window.google.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
    if (existingScript) {
      // If script is already there but not loaded, we might need to wait (rare edge case in this flow)
      existingScript.addEventListener('load', () => {
        isLoaded = true;
        resolve();
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      resolve();
    };
    
    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });
};

export const geocodeAddress = (address: string): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject(new Error(`Geocode failed: ${status}`));
      }
    });
  });
};