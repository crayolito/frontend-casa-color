
# Estándares de código, naming y patrones de diseño frontend

Aplica esto en TODO código frontend que generes o modifiques, sin importar el framework — cambia la sintaxis, no el criterio.

## Naming — fuerza esto siempre, no lo trates como estilo opcional

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `UserCard.tsx` |
| Hooks/Composables | `use` + camelCase | `useAuth`, `useDebounce` |
| Handlers (definición interna) | `handle` + acción | `handleClick` |
| Props de evento | `on` + acción | `onClick` |
| Booleanos | `is/has/can/should` | `isLoading`, `hasError` |
| Constantes de dominio | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Archivos no-componente | kebab-case | `format-date.ts` |
| Tests | mismo nombre + sufijo | `UserCard.test.tsx` |

Si generas un hook cuyo nombre necesita "y" (`useUserDataAndValidate`), esa es la señal de que viola responsabilidad única — divídelo antes de continuar, no lo dejes así.

## Separación de responsabilidades — pregunta obligatoria antes de escribir un componente

Antes de escribir cualquier componente, decide explícitamente: ¿esta lógica es de **presentación** (recibe props, renderiza, emite eventos), de **estado** (hooks/composables que orquestan datos), o de **acceso a datos** (fetch/repositorios)? Nunca mezcles fetch directo dentro de un componente de presentación — extrae siempre esa llamada a un hook o a una capa de datos, aunque sea solo por hoy, porque el costo de no hacerlo aparece en cuanto ese mismo dato se necesita en una segunda ruta.

## Patrones — cuándo usarlos (no los apliques por defecto)

- **Container/Presentational**: solo si el componente se reutiliza en más de un contexto o necesita testearse aislado de la red.
- **Custom Hook/Composable**: extrae lógica repetida solo después de verla repetida 2-3 veces real, nunca en la primera implementación — abstraer con un solo caso de uso casi siempre produce la abstracción equivocada (Rule of Three).
- **Provider/Context**: solo para prop drilling de 4+ niveles o estado transversal (sesión, tema, i18n). Si usas Context en React, sepáralo en contexts granulares para no forzar re-render de todo consumidor ante cualquier cambio.
- **Facade** (capa de acceso a datos): obligatoria si el backend puede cambiar de contrato o protocolo durante la vida del producto — que es casi siempre. Nunca dejes que un componente importe un cliente HTTP directamente.
- **Compound Components**: solo si hay múltiples piezas relacionadas que comparten estado implícito (`<Tabs><Tabs.Panel/></Tabs>`); no lo uses para un botón simple.
- **Observer / state management**: entiéndelo como patrón antes de elegir Redux/Zustand/Pinia — la pregunta de fondo es quién se suscribe y con qué granularidad, no "qué librería está de moda".

## Organización de carpetas

Organiza por **dominio de negocio** (`features/checkout/{components,hooks,api}`), no por tipo técnico (`components/`, `hooks/`, `services/` globales) — salvo que el proyecto tenga menos de ~15-20 componentes y un solo dev, en cuyo caso la organización por feature es sobre-ingeniería y una estructura plana simple es preferible.

## Cuándo NO aplicar esto — evita sobre-ingeniería

- No crees un patrón (Container/Presentational, Facade, Redux) para un componente de un solo uso que no se reutilizará.
- No abstraigas en la primera repetición — espera la tercera antes de extraer un hook o helper.
- No introduzcas estado global para compartir datos entre 2 componentes cercanos en el árbol; usa props o un Context simple.
- No fragmentes un componente en 5 archivos microscópicos si el árbol de JSX ya es legible en una pantalla — divide por reutilización o testabilidad real, no por "Clean Code" llevado al extremo.
- Si vas a aplicar cualquier patrón de esta lista, pregúntate primero: ¿qué problema real y actual resuelve? Si no hay respuesta concreta, no lo apliques.

## Checklist antes de entregar código

- [ ] Naming forzado por convención (o configurado en ESLint si el proyecto lo tiene)
- [ ] Ningún componente mezcla fetch + lógica de negocio + presentación
- [ ] No hay `any` en TypeScript como escape
- [ ] Ningún patrón aplicado sin un problema real que resuelva hoy
- [ ] Los hooks extraídos resuelven una repetición ya vista, no especulativa
