# Referencia: Testing en Angular — el CÓMO

> El QUÉ es política de la constitución (→ Testing, obligatorio): happy path ejecutado en todo flujo nuevo; recovery en camino crítico; tests de seguridad siempre. Esta referencia define CÓMO se cumple eso en Angular.
> **E2E: NO se usa en este equipo** (decisión registrada en el SKILL.md). Los flujos críticos se cubren con tests de integración de feature — no queda hueco: se cubren igual, con otra herramienta.

## Herramientas

- **Vitest** (integración oficial). Karma está muerto — ni en legacy nuevo.
- **Angular Testing Library** como estilo default para componentes: probar comportamiento observable (render, interacción), no internals.
- **`provideHttpClientTesting` / MSW** para HTTP mockeado en integración.

## Dónde va el esfuerzo (pirámide honesta, sin capa E2E)

1. **Unit — la masa:**
   - Lógica pura (`shared/util`, mappers, validators): cobertura alta — baratos y estables. Los mappers son frontera con el backend: SIEMPRE testeados (cuando el contrato cambie, el test avisa primero).
   - Stores/servicios de estado: transiciones vía su API pública. Con signals: assert sobre el valor del signal tras la acción, no sobre implementación.
2. **Integración de feature — donde se cazan los bugs de wiring:** la feature completa (smart component + state + data) con HTTP mockeado. **Acá viven el happy path y el recovery del camino crítico** que exige la constitución: submit de pago → respuesta ok → estado y UI correctos; respuesta con error/timeout → el usuario ve el error de `error-ux.md`, el input no se pierde, el retry no duplica.

## Reglas duras

- Un fix de bug sin test que lo reproduzca no se mergea. El bug que volvió dos veces es culpa del equipo, no del bug.
- Umbral de cobertura en CI: ~80% en `util`/`data`/`state`. Componentes se miden por comportamiento, no por %. Perseguir 100% global es teatro (y la constitución lo dice: coverage no es el objetivo, probar que la plata llega sí).
- Tests con `setTimeout`/sleeps arbitrarios = flaky = se arreglan o se borran. Un flaky vale menos que ningún test: entrena a ignorar el CI. Async se testea con `fakeAsync`/`tick` o utilidades de Testing Library (`findBy*`), no durmiendo.
- Zoneless en tests: mismo provider zoneless que la app — testear con Zone lo que corre zoneless es testear otra aplicación.
