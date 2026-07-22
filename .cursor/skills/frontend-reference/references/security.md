

> **NO opt-in — siempre activa** (mismo estatus que la sección Seguridad de la constitución). Es la cara cliente del mismo pilar: el backend decide, el frontend nunca es frontera de confianza.
# Seguridad Frontend (obligatorio — no se salta por falta de tiempo)

El cliente NUNCA es una frontera de seguridad confiable — todo lo que corre en el navegador puede leerse, modificarse o interceptarse. Aplica esto sin excepción.

## XSS — el punto de entrada más común

- Nunca uses `dangerouslySetInnerHTML` (React), `v-html` (Vue), `[innerHTML]` (Angular) con contenido de usuario sin sanitizar con una librería auditada (ej. DOMPurify) antes de insertar.
- No insertes contenido vía `document.write`/`element.innerHTML =` fuera del ciclo de renderizado del framework.
- Valida el esquema de cualquier URL dinámica insertada en `href`/`src` — `javascript:alert(1)` sigue siendo un vector válido si no se sanitiza.

## Content Security Policy

Si configuras CSP, usa `nonce` por request para scripts inline en SSR. Nunca uses `unsafe-inline` para evitar el trabajo de nonces — anula gran parte de la protección real.

## Tokens de autenticación

- **Cookie httpOnly + Secure + SameSite**: no accesible por JS, mitiga robo vía XSS. Requiere cooperación del backend.
- **localStorage/sessionStorage**: accesible por cualquier script — si hay XSS, el atacante lee el token directamente. Aceptable solo en apps con superficie de XSS controlada y bajo riesgo (admin panels internos).

Decide según la superficie de ataque real del producto, no por comodidad de implementación. Nunca guardes tokens sensibles en localStorage por default sin evaluar esto.

## Dependencias y terceros

- Cualquier script cargado desde CDN externo debe llevar Subresource Integrity (`integrity="sha384-..."`).
- Recomienda o configura auditoría continua en CI (`npm audit`, Snyk, Dependabot) como gate, no revisión manual ocasional.

## CORS

Nunca configures `Access-Control-Allow-Origin: *` en un endpoint que devuelve datos autenticados. Usa orígenes explícitos.

## Formularios

La validación del cliente es solo para UX. Nunca asumas que reemplaza la validación del servidor — cualquier request puede construirse fuera del formulario (curl, Postman). Si generas validación de cliente, indica explícitamente que la validación de seguridad real debe replicarse en el servidor.

## Cuándo esto NO se relaja (a diferencia de otras skills, aquí no hay "sobre-ingeniería")

Seguridad no se salta por presupuesto de tiempo ni por tamaño del proyecto. Lo único que varía por contexto es el nivel de rigor de la mitigación (ej. localStorage puede ser aceptable en un admin panel interno de bajo riesgo, pero nunca en un producto público con contenido de usuario no controlado) — nunca la omisión total de la práctica.

## Checklist antes de entregar código

- [ ] ¿Hay `innerHTML`/`v-html`/`dangerouslySetInnerHTML` sin sanitización?
- [ ] ¿CSP usa `nonce` en vez de `unsafe-inline`, si aplica?
- [ ] ¿La decisión de dónde guardar tokens fue evaluada contra la superficie de XSS real?
- [ ] ¿Los scripts de CDN externos tienen Subresource Integrity?
- [ ] ¿CORS usa orígenes explícitos, no wildcard en endpoints autenticados?
- [ ] ¿La validación crítica también existe en el servidor?
