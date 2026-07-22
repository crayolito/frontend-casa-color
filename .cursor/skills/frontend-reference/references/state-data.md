
# Estado y Gestión de Datos

## Las tres categorías — sepáralas siempre explícitamente

- **Local (UI state)**: pertenece a un componente (valor de un input antes de submit, si un acordeón está abierto).
- **Global (client state)**: compartido entre partes no relacionadas del árbol (sesión, tema, idioma).
- **Servidor (server state)**: datos que viven en el backend, el cliente solo tiene copia temporal (listas, perfiles, resultados de búsqueda).

No guardes estado de servidor manualmente en Redux/Zustand con lógica custom de loading/error — usa una librería especializada (React Query, TanStack Query, SWR, Apollo) que ya resuelve invalidación, revalidación en background y deduplicación de requests.

## Normalización

Si el mismo dato (ej. un usuario) aparece en dos listas distintas del estado, normalízalo: entidades indexadas por ID en un solo lugar, las listas solo guardan referencias. Evita duplicar el mismo objeto en múltiples partes del estado sin esto — produce inconsistencias silenciosas cuando se edita en un lugar y no en otro.

## Derived state

Si un valor se puede calcular desde otro estado existente (ej. `totalPrice` desde `items`), no lo guardes como estado separado — calcúlalo en el render o memoízalo si es costoso. Guardarlo aparte genera desincronización cuando el estado base cambia y nadie disparó el recálculo.

## Optimistic updates

Si implementas actualización optimista (aplicar el cambio localmente antes de la confirmación del servidor), siempre incluye estrategia de rollback: aplicar → enviar → si falla, revertir y notificar. Nunca dejes la UI mostrando un estado que no refleja la realidad del servidor sin decírselo al usuario. Resérvalo para acciones frecuentes de alto impacto en percepción (like, carrito, marcar como leído) — no lo apliques a acciones raras de bajo impacto.

## Sincronización con URL

Si el usuario espera compartir o recargar una vista (filtros, paginación, pestaña activa) y mantener el mismo estado, refleja eso en query params de la URL, no solo en memoria del componente.

## Componentes de datos — la escalabilidad se decide por la NATURALEZA del dato

> Fuente única de este criterio. `constitution.mdc` y `frontend-layers.mdc` solo lo resumen y apuntan acá.
> Espejo frontend de "toda lista se pagina" (backend-reference → api-design.md). El contrato ya existe; esto define cómo se CONSUME y se MUESTRA.

Pregunta obligatoria antes de renderizar una colección: **¿de dónde sale y puede crecer?**

- **Colección unbounded** (tabla/colección del backend que crece con el uso: productos, usuarios, órdenes, mensajes, resultados) → el componente nace preparado, sin importar el count de HOY. La trampa a evitar: "hoy son 6, lo hago simple" — el costo de nacer paginado es marginal; retrofitear paginación con UI, estado y tests ya escritos es caro.
- **Colección cerrada por naturaleza** (enum, 12 meses, opciones fijas en código) → lista simple. Paginarla/buscarla ES sobreingeniería.
- Pedido literal de "lista pelada" sobre colección unbounded → **regla del pedido incompleto** (constitución): surfacear, no completar en silencio ni entregar pelado.

### 1. Elección del patrón de consumo — por tipo de tarea, no default único (criterio NN/g)

| Patrón | Cuándo | Por qué |
|---|---|---|
| **Paginación clásica** | Tarea orientada a objetivo: tablas admin, resultados con filtros, comparar opciones | Scroll infinito no sirve para localizar/comparar ítems específicos; páginas dan control, cierre y posición |
| **Load More** | E-commerce, galerías, término medio exploración/control | Usuario decide cargar más; footer accesible; mejor en bajo ancho de banda |
| **Scroll infinito** | Solo feeds/descubrimiento continuo sin endpoint | Menor costo de interacción; exige mitigar URL, footer y back button |

Default ante duda: **paginación clásica** (la más reversible). Cursor en el API (sin total ni salto a página N) empuja a Load More/infinito — coordinar con backend (api-design.md → offset vs cursor).

### 2. Búsqueda y filtrado

- Server-side cuando el usuario busca en la colección; con **debounce** en el input.
- **Cancelación de requests obsoletos** (`AbortController` / `switchMap` en Angular): el debounce reduce requests pero NO impide que una respuesta vieja llegue tarde y pise a la nueva. Buscador sin cancelación = bug de race condition, no detalle.
- Filtrado en cliente solo sobre la página ya cargada, nunca como sustituto.

### 3. Estados de carga — skeleton, spinner y progress tienen reglas (NN/g)

- **Skeleton**: carga inicial de contenido con layout conocido (listados, cards, dashboards, resultados). Debe mimetizar el layout final (reserva espacio → evita CLS, ver performance.md), el dato real lo reemplaza apenas llega (no bloquear carga gradual), shimmer lento izquierda→derecha (se percibe más corto que pulso).
- **Skeleton NO va** en cargas <1s (flashea), buffering de video, ni procesos largos.
- **Spinner**: acciones cortas bloqueantes de sistema (submit, guardar, autenticar, pagar) y esperas indeterminadas de 2–10s.
- **Progress bar**: >10s (uploads, exports, procesos) — el usuario necesita saber cuánto falta.
- **Sin flicker entre páginas**: al cambiar de página/filtro se mantienen los datos previos con indicador sutil (`keepPreviousData`/`placeholderData` o equivalente). El skeleton es de la carga INICIAL, no de cada transición.

### 4. Estados vacío y error — diferenciados

- **Vacío por primer uso** ("todavía no hay productos") con CTA de crear ≠ **vacío por filtros** ("nada coincide con tu búsqueda") con acción de limpiar filtros. Un "No hay resultados" genérico para ambos es un bug de UX.
- **Error** con reintento visible (detalle: error-resilience.md). Los tres estados + loading: siempre, sin excepción.

### 5. Contexto y navegación

- **Posición visible**: el usuario sabe cuánto queda y dónde está (números de página, "X de Y", conteo de resultados). Con cursor no hay total — el diseño lo asume, no lo finge.
- **URL** refleja filtros/página/búsqueda si la vista es compartible/recargable (sección Sincronización con URL).
- **Back button / scroll restoration**: volver del detalle a la lista restaura posición y datos, no recarga desde arriba. Fail clásico del scroll infinito; obligatorio mitigarlo si se eligió ese patrón.

### 6. Accesibilidad del patrón (lo puntual; baseline general en accessibility.md)

- `aria-live` anuncia conteo de resultados tras buscar/cargar más.
- Foco gestionado tras "Load More" (no se pierde al fondo ni salta al inicio).
- Skeleton marcado decorativo para lectores de pantalla (`aria-hidden` / `aria-busy` en el contenedor).

### 7. Virtualización — optimización con señal, NO baseline

Solo cuando el patrón acumula cientos de filas vivas en el DOM (scroll infinito largo, tablas densas): guía ~1500 nodos DOM totales; pasando el millar de ítems la degradación es real, antes no. Herramienta del framework (CDK Virtual Scroll, react-window/virtuoso). En una lista paginada de 20 por página es sobreingeniería.

Aplica igual en React/Next/Vue/Angular/Svelte — cambia la sintaxis (TanStack Query / Signals + servicio), no el criterio.

## Cuándo NO aplicar esto — evita sobre-ingeniería

- No introduzcas una librería de estado global para compartir datos entre 2 componentes a 1-2 niveles de distancia — usa props o un Context simple.
- No apliques optimistic updates a acciones poco frecuentes o de bajo impacto — no justifica la complejidad de manejar rollback.
- No normalices el estado si los datos nunca se duplican en más de un lugar del árbol.

## Checklist antes de entregar

- [ ] ¿Se distingue explícitamente estado local, global y de servidor?
- [ ] ¿El estado de servidor usa una librería especializada, no reimplementación manual?
- [ ] ¿Hay datos duplicados sin normalizar?
- [ ] ¿Hay estado guardado que debería derivarse de otro existente?
- [ ] ¿Los optimistic updates tienen rollback?
- [ ] ¿Filtros/paginación se reflejan en la URL cuando el usuario espera compartir/recargar?
- [ ] ¿Toda colección unbounded se consume con un patrón elegido (paginación/load more/infinito) según el tipo de tarea?
- [ ] ¿La búsqueda server-side tiene debounce Y cancelación de requests obsoletos?
- [ ] ¿Skeleton solo en carga inicial con layout conocido, sin flicker entre páginas (datos previos mantenidos)?
- [ ] ¿Vacío por primer uso y vacío por filtros son estados distintos, y el error tiene reintento?
- [ ] ¿El usuario ve su posición/cuánto queda, la URL refleja el estado, y el back restaura scroll y datos?
- [ ] ¿Listas dinámicas anuncian resultados (aria-live) y gestionan foco tras cargar más?
- [ ] ¿Virtualización solo con señal real de DOM (cientos de filas vivas), y ninguna colección cerrada paginada sin necesidad?
