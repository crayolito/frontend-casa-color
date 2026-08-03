import { environment } from '../../../../environments/environment';

let loadPromise: Promise<void> | null = null;

function hasImportLibrary(): boolean {
  return (
    typeof google !== 'undefined' &&
    !!google.maps &&
    typeof google.maps.importLibrary === 'function'
  );
}

/** Espera breve a que el bootstrap async exponga importLibrary. */
function waitForImportLibrary(timeoutMs = 8000): Promise<void> {
  if (hasImportLibrary()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (hasImportLibrary()) {
        resolve();
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(
          new Error(
            'Google Maps cargó sin importLibrary (¿API key, red o bloqueador?)',
          ),
        );
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/**
 * Carga la Google Maps JS API una sola vez y deja lista la librería `maps`
 * para @angular/google-maps 22 (usa google.maps.importLibrary).
 */
export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    try {
      if (!hasImportLibrary()) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>(
            'script[data-google-maps-loader="true"]',
          );
          if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener(
              'error',
              () => reject(new Error('Failed to load Google Maps')),
              { once: true },
            );
            return;
          }

          const script = document.createElement('script');
          script.dataset['googleMapsLoader'] = 'true';
          // v=weekly + loading=async → bootstrap con importLibrary (requerido por Angular 22)
          script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&v=weekly&loading=async`;
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error('Failed to load Google Maps'));
          document.head.appendChild(script);
        });
        await waitForImportLibrary();
      }

      await google.maps.importLibrary('maps');
    } catch (err) {
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}
