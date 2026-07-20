import { environment } from '../../../../environments/environment';

let loadPromise: Promise<void> | null = null;

/**
 * Carga la Google Maps JS API una sola vez.
 * Key desde environment (no index.html).
 * @angular/google-maps 22 no expone provideGoogleMapsLoader — legacy script tag soportado.
 */
export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (typeof google !== 'undefined' && google.maps) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Google Maps'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
