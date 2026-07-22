
# i18n, SEO, Cross-browser, PWA y Design System

## Internacionalización (i18n)

No trates i18n como solo reemplazar strings. Considera también formato de fecha/número/moneda (Intl API), pluralización (reglas distintas por idioma), y dirección de texto (RTL). Si existe probabilidad real de soporte RTL futuro, escribe CSS con propiedades lógicas desde el inicio (`margin-inline-start`, no `margin-left`) — el retrofit después es un refactor masivo.

## SEO técnico

- El contenido crítico para SEO no puede depender solo de JS del lado cliente sin fallback — usa SSR/SSG si la ruta necesita ser indexada.
- Genera meta tags dinámicos (título, descripción, Open Graph) por ruta/contenido real, no un valor estático genérico.
- Usa structured data (JSON-LD) para contenido que se beneficia de rich results (producto, artículo, receta).
- Genera sitemap y robots.txt — no los omitas en SPAs.

## Cross-browser

Define `browserslist` explícito en la configuración de build. Prueba en Safari de forma rutinaria (motor WebKit, fuente frecuente de discrepancias de CSS/fechas), no solo en Chrome.

## PWA / Offline-first

Implementa Service Workers solo cuando el producto tiene caso de uso real de conectividad intermitente. Si lo implementas, define una estrategia clara de invalidación de caché — un Service Worker mal configurado puede servir contenido obsoleto indefinidamente sin que el usuario entienda por qué.

## Design System / Design Tokens

Centraliza tokens (color, espaciado, tipografía) en una fuente única (variables CSS o config compartida de Tailwind/styled-components), nunca los reinventes por componente. Documenta en Storybook si el proyecto lo justifica.

## Cuándo NO aplicar esto — evita sobre-ingeniería

- No implementes soporte i18n completo (extracción de strings, pluralización compleja, RTL) en un producto de un solo mercado/idioma indefinido.
- No apliques SSR "por SEO" a rutas autenticadas que nunca serán indexadas.
- No construyas infraestructura de Design System multi-producto con versionado semántico para un proyecto de un solo equipo y un solo producto — un archivo de tokens compartido en el mismo repo resuelve lo mismo con menos costo.

## Checklist antes de entregar

- [ ] ¿El CSS usa propiedades lógicas si hay probabilidad real de RTL futuro?
- [ ] ¿El contenido SEO-crítico se renderiza en servidor?
- [ ] ¿Existe `browserslist` y pruebas en Safari?
- [ ] ¿El Service Worker (si existe) tiene estrategia clara de invalidación?
- [ ] ¿Los tokens de diseño viven en una fuente única?
