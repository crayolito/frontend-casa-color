
# CSS y Responsividad

## Scoping — decide esto antes de escribir una sola línea de CSS

Nunca generes CSS global sin aislamiento. Elige según el contexto real del proyecto:
- **CSS Modules**: default razonable si no hay necesidad de theming dinámico en runtime.
- **CSS-in-JS**: solo si el proyecto necesita theming dinámico (dark mode con múltiples temas de cliente, por ejemplo) — tiene costo de runtime salvo extracción estática.
- **Utility-first (Tailwind)**: si el proyecto ya lo usa o prioriza velocidad/consistencia sobre CSS custom.

No migres de una estrategia a otra sin que exista un requisito real que lo justifique — el costo de migración es alto.

## Especificidad

Mantén selectores planos (clases, no IDs ni anidamiento profundo). Si necesitas `!important`, es señal de que la cascada ya se rompió antes — resuelve la causa, no agregues otro `!important` encima. BEM (`.block__element--modifier`) genera especificidad uniforme si el proyecto usa CSS plano.

## Responsividad — reglas obligatorias

- **Mobile-first siempre**: escribe el CSS base para el viewport más pequeño, añade complejidad hacia arriba con `min-width`. Nunca desktop-first con `max-width` como parche.
- **Unidades**: `rem`/`em` en tipografía y espaciado (respeta zoom/accesibilidad del usuario). `%`/`vw`/`vh` para layout que debe adaptarse al viewport. `px` solo para detalles que no deben escalar (bordes de 1px).
- **Container Queries**: úsalas cuando un componente deba responder al tamaño de *su contenedor*, no del viewport (ej. una card que vive en sidebar angosto y en grid ancho). No resuelvas esto con JS (`ResizeObserver` + estado) si Container Queries ya lo resuelve nativamente — es reinventar la rueda con peor performance.
- **Imágenes responsivas**: usa `srcset`/`sizes` o `<picture>` con `source` por breakpoint. Nunca sirvas la misma imagen a móvil y desktop.
- **Layout**: Flexbox para 1D, Grid para 2D. Si ves floats o tablas para layout, es código legado — corrígelo.

## Accesibilidad dentro de CSS — no opcional

- Touch targets: WCAG 2.2 exige 24x24 CSS pixels como mínimo AA (criterio 2.5.8, con excepción de espaciado). 44x44px es AAA (2.5.5) y la referencia práctica de Apple HIG — apunta a 44px en controles primarios de uso frecuente, cumple 24px como piso en todo lo demás.
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande (AA) — verifícalo, no lo asumas a ojo.
- Respeta siempre `prefers-reduced-motion` en cualquier animación que generes.
- Incluye `<meta name="viewport" content="width=device-width, initial-scale=1">` en cualquier documento HTML nuevo.

## Cuándo NO aplicar esto — evita sobre-ingeniería

- No migres un proyecto estable de CSS Modules a CSS-in-JS solo por costumbre si no hay necesidad real de theming dinámico.
- No implementes Container Queries en componentes que nunca cambiarán de contenedor — es complejidad sin beneficio si el componente vive en un solo contexto de layout.
- No generes `srcset` con 6 variantes de tamaño para una imagen decorativa de bajo peso — resérvalo para imágenes hero/LCP.

## Checklist antes de entregar CSS

- [ ] El CSS tiene scoping real (Modules/CSS-in-JS/utility), no global sin aislamiento
- [ ] Está escrito mobile-first, no desktop-first con parches
- [ ] Usa unidades relativas en tipografía/espaciado
- [ ] Los targets interactivos cumplen mínimo 24x24px (idealmente 44px en controles primarios)
- [ ] El contraste cumple AA
- [ ] Las imágenes usan `srcset`/`picture` si son responsivas al viewport
