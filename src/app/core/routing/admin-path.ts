/** Segmento de URL del panel (no usar `/admin` — demasiado obvio). */
export const ADMIN_BASE_SEGMENT = 'ccadm';

export function adminPath(...segments: string[]): string {
  const parts = segments.filter(Boolean).map((s) => s.replace(/^\//, ''));
  return parts.length
    ? `/${ADMIN_BASE_SEGMENT}/${parts.join('/')}`
    : `/${ADMIN_BASE_SEGMENT}`;
}

export function isAdminAppUrl(url: string): boolean {
  return url === adminPath() || url.startsWith(`${adminPath()}/`);
}
