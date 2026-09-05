export const environment = {
  production: true,
  // Mismo dominio que la SPA; nginx del contenedor reenvía /api → backend:3000.
  apiUrl: '/api',
  /** Deuda: key del clon en texto plano. Restringir por referrer en GCP Console. */
  googleMapsApiKey: 'AIzaSyBRSBYCDJFyruDRg9ZYABYrCuY99tqg6Y8',
};
