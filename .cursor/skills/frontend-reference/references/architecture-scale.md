
# Arquitectura a Escala: Micro-frontends y Monorepos

## Empieza siempre por el monolito

Un solo repositorio, un solo build, un solo deploy es la opción correcta para la mayoría de proyectos. No recomiendes fragmentar sin que exista un problema real: múltiples equipos independientes que necesitan desplegar sin coordinar release conjunto, y el build/test se ha vuelto un cuello de botella real.

## Monorepo con Nx/Turborepo — el paso intermedio antes de micro-frontends

Antes de recomendar micro-frontends, evalúa un monorepo bien tooleado: build incremental (solo reconstruye lo que cambió), grafos de dependencia explícitos entre paquetes compartidos y apps. Comparte código real (no duplicado), mantiene una sola versión de dependencias críticas, permite refactors atómicos en un solo PR.

## Micro-frontends — solo si el problema real lo justifica

Recomiéndalos solo cuando: equipos grandes y verdaderamente independientes necesitan desplegar sin coordinar entre sí, posiblemente con stacks distintos. El costo que debes hacer explícito antes de recomendarlos:
- Múltiples runtimes de framework cargados simultáneamente si no se comparten dependencias vía Module Federation.
- Consistencia visual más difícil sin Design System con gobernanza real.
- Requiere un contrato explícito de comunicación entre micro-frontends — sin él, terminan tan acoplados como un monolito pero con más infraestructura.
- Debugging más difícil (errores en la interacción entre piezas desplegadas en momentos distintos).

## La pregunta que decide

No es "¿qué es más moderno?" — es: ¿los equipos que trabajan en este producto realmente necesitan desplegar de forma completamente independiente? Si no, un monorepo con build incremental resuelve el problema de escala sin el costo operacional de micro-frontends.

## Module Federation

Mecanismo técnico (Webpack 5+/Vite) que permite compartir dependencias comunes entre micro-frontends para no duplicarlas. Requiere estrategia clara de versionado — un mismatch entre host y remote produce errores en runtime difíciles de diagnosticar.

## Cuándo NO recomendar esto — evita sobre-ingeniería (la más común y costosa en este pilar)

No recomiendes micro-frontends a un producto con un solo equipo, o con equipos que ya coordinan releases sin fricción real. Adoptarlo por tendencia sin un problema de coordinación real es la decisión de sobre-ingeniería más costosa en arquitectura frontend — introduce toda la complejidad operacional sin resolver nada que exista hoy.

## Checklist antes de recomendar

- [ ] ¿Existe un problema real y actual de coordinación entre equipos independientes?
- [ ] ¿El monorepo (si existe) usa build incremental, o reconstruye todo en cada cambio?
- [ ] ¿Los micro-frontends (si se recomiendan) compartirían dependencias críticas?
- [ ] ¿Se definiría un contrato explícito de comunicación entre piezas?
- [ ] ¿Se evaluó el costo operacional real contra el problema específico antes de recomendar?
