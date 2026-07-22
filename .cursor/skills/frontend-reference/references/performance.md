
# Performance y Core Web Vitals

## Métricas objetivo (umbrales oficiales vigentes, verificados)

| Métrica | Umbral "Good" | Qué mide |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Velocidad de carga del elemento visible más grande |
| INP (Interaction to Next Paint) | < 200ms | Responsividad ante cualquier interacción de toda la sesión |
| CLS (Cumulative Layout Shift) | < 0.1 | Estabilidad visual |

Medidos al percentil 75 de usuarios reales (RUM/CrUX), no en laboratorio. Un Lighthouse verde en local no garantiza estos umbrales en campo.

## Estrategia de renderizado — decide por ruta, no para toda la app

- **CSR**: dashboards autenticados donde SEO no importa. Malo para LCP (pantalla en blanco hasta que JS carga).
- **SSR**: rutas públicas con datos que cambian por request. Mejora LCP/SEO pero introduce costo de hidratación.
- **SSG**: contenido que cambia poco y necesita SEO óptimo (páginas de producto).
- **ISR**: intermedio — HTML estático regenerado en background.

No apliques la misma estrategia a toda la aplicación por defecto. Un e-commerce puede necesitar SSG en producto, SSR en checkout, CSR en admin — evalúa cada ruta según su necesidad real.

## Hidratación — audítala, no solo LCP

Un bundle de JS grande puede dar LCP excelente pero INP terrible porque el contenido se ve pero no es interactivo hasta que termina de hidratar. Si usas SSR/SSG, prioriza qué se hidrata primero (componentes interactivos above-the-fold antes que el footer), y considera streaming SSR o hidratación selectiva si el bundle es pesado.

## Code splitting

- Divide por ruta como mínimo.
- Difiere (`dynamic import`/`lazy`) librerías pesadas usadas en un solo flujo (editor rico, visor PDF, date picker complejo).
- No dividas un componente usado en el 100% de las rutas (header, nav) — el overhead de la petición adicional supera el beneficio.
- Verifica con un analizador de bundle antes de fragmentar agresivamente; no fragmentes por intuición.

## Presupuesto de performance

Define un límite de bundle inicial (ej. <200KB gzip) desde el inicio del proyecto y hazlo un gate en CI. Revertir una librería pesada después de que 40 componentes dependen de ella es mucho más costoso que prevenirlo.

## Cuándo NO aplicar esto — evita sobre-ingeniería

- No apliques SSR a rutas que nunca serán indexadas ni tienen requisito de LCP (paneles internos de bajo tráfico).
- No fragmentes el bundle en decenas de chunks microscópicos sin medir — puede generar más overhead de peticiones que beneficio.
- No implementes hidratación selectiva/streaming SSR si el bundle ya es pequeño y el INP ya cumple umbral.

## Checklist antes de entregar

- [ ] ¿La estrategia de renderizado se eligió por ruta según necesidad real?
- [ ] ¿Las librerías pesadas de un solo flujo están en lazy load?
- [ ] ¿Existe un presupuesto de bundle verificado en CI?
- [ ] ¿Las imágenes/fuentes reservan espacio para evitar CLS?
- [ ] ¿Se prioriza qué se hidrata primero en rutas SSR/SSG con bundle pesado?
