

> **OPT-IN (constitución → Logging y Testing):** no escribas tests por iniciativa. Cargá esto cuando el dev los pida. Excepciones que NO son opt-in: tests de seguridad (XSS/authz de la constitución) y tests de caracterización en refactor de legacy.
# Testing Frontend

## Usa Testing Trophy, no la pirámide clásica, como modelo por defecto en frontend

La pirámide clásica (mayoría unit, pocos E2E) asume que un componente es una "unidad" aislable — en frontend moderno, un componente que hace fetch, maneja estado y renderiza es un pequeño sistema, no una unidad pura. Testearlo aislado con todo mockeado produce tests en verde que no verifican integración real.

Aplica en su lugar la **Testing Trophy** (Kent C. Dodds):

| Capa | Qué prueba | Proporción |
|---|---|---|
| Análisis estático (ESLint, TypeScript) | Errores de tipo y patrones, antes de correr tests | Base, siempre activo |
| Unit | Lógica pura aislable (funciones, cálculos, reducers) | Pequeña |
| Integration | Componente + estado real, red mockeada en el borde (MSW) | La más grande — aquí va el esfuerzo principal |
| E2E | Flujos completos en navegador real | Delgada — solo flujos críticos (login, checkout, pago) |

La pirámide clásica sigue siendo válida para backend con lógica de dominio pesada — no la apliques por defecto a frontend.

## Qué testear en cada capa

- Unit: funciones utilitarias puras, sin red ni estado de componente.
- Integration: que un formulario valide con su estado real, que un componente muestre loading/error/success ante respuestas mockeadas de red — el núcleo del esfuerzo.
- E2E: flujo de negocio completo contra staging real.

## Cómo escribir los tests

Usa Testing Library (React/Vue Testing Library) — testea a través de lo que el usuario ve y hace (roles, texto visible, interacciones), nunca detalles internos de implementación (estado interno, nombres de props). Un test acoplado a implementación se rompe con cada refactor legítimo sin que haya cambiado el comportamiento — evita esto siempre.

## Mocking

Corta la frontera en la capa de red (fetch/axios/GraphQL client vía MSW u otra herramienta de intercepción), deja correr la lógica real del componente y del estado por encima. Mockear más profundo (mockear un hook entero) produce tests que pasan aunque la lógica interna esté rota.

## Cuándo NO aplicar esto — evita sobre-ingeniería

- No persigas 100% de cobertura como objetivo en sí mismo — genera tests triviales que no verifican comportamiento real.
- No apliques visual regression testing a componentes de bajo riesgo y bajo reuso — resérvalo para sistemas de diseño y componentes ampliamente compartidos.
- No escribas E2E para cada variante de formulario — resérvalo para los flujos de negocio realmente críticos.

## Checklist antes de entregar

- [ ] ¿La distribución sigue Testing Trophy (integración como capa mayor), no pirámide clásica invertida hacia E2E?
- [ ] ¿Los tests verifican comportamiento visible, no implementación interna?
- [ ] ¿El mocking corta en la frontera de red, dejando correr la lógica real?
- [ ] ¿Hay lógica de negocio atrapada en un componente que solo se puede verificar con E2E lento? (extráela)
