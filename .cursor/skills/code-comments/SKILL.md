---
name: code-comments-standard
description: "Criterio de ingeniería senior para decidir cuándo, cómo y dónde escribir comentarios en código, aplicable a cualquier lenguaje o stack (frontend, backend, scripts, infra, SQL, etc.). Usar SIEMPRE que se genere, edite o refactorice código y haya que decidir si una línea, función, bloque o commit necesita un comentario; al escribir docstrings/JSDoc/TSDoc/Javadoc/Godoc para funciones, componentes o APIs públicas; al hacer code review y evaluar si comentarios existentes son necesarios, redundantes, engañosos o están desactualizados; al escribir TODO/FIXME; o cuando se pregunte por convenciones de comentarios, documentación inline, o estilo relacionado. No comentar por costumbre ni evitar comentar por dogma: aplicar siempre el criterio de esta skill antes de añadir, mantener o borrar cualquier comentario."
---

# Estándar de comentarios en código

Criterio único para todo el código que generes o revises, sin importar si es frontend, backend, infra o scripts. No es "comentar mucho" ni "comentar cero" — es un test de decisión.

## Principio rector

> El comentario explica el **por qué**. El código explica el **qué**.

Si hace falta un comentario para entender **qué** hace una línea, el problema es que el código no es claro — la solución es refactorizar (nombres, funciones más chicas), no añadir texto. Un comentario nunca es excusa para código confuso.

## Test de decisión (aplicar antes de escribir CUALQUIER comentario)

1. ¿Este comentario explica una decisión, no una acción? Si solo describe la acción → bórralo, no lo escribas.
2. ¿El motivo detrás de esta línea es recuperable leyendo solo el código? Si sí → no hace falta comentario.
3. ¿Si borro este comentario mañana, alguien puede repetir un error ya pagado (bug, regresión, decisión de negocio, limitación externa)? Si sí → el comentario se queda.
4. ¿Esto pertenece a una decisión de una sola línea/función, o a un flujo/arquitectura que cruza módulos? Si cruza módulos → no va en comentario, va en documentación externa (ver sección correspondiente).
5. ¿Vas a poder mantener este comentario actualizado cuando el código cambie? Si no estás seguro → mejor no escribirlo. Un comentario incorrecto es peor que ningún comentario.

## Cuándo SÍ comentar

| Categoría | Ejemplo |
|---|---|
| Workaround por bug/limitación externa | `// Safari <16 no soporta :has(), fallback manual abajo` |
| Regla de negocio no obvia | `// No aplica IVA a clientes con exención fiscal activa (ticket FIN-204)` |
| Código no idiomático a propósito | `// Loop manual en vez de map() por límite de memoria en el batch` |
| Fórmula, algoritmo o constante no trivial | `// Coeficientes ITU-R BT.601 para luminancia perceptual` |
| Riesgo de concurrencia / thread-safety | `// No mover: el lock debe adquirirse antes de leer sharedState` |
| Seguridad / validación crítica | `// No remover: previene inyección SQL en el filtro dinámico` |
| Referencia externa (RFC, ticket, doc) | `// Ver RFC 7519 §4.1.4 para el claim exp` |
| Atribución de código copiado | Link a la fuente original (licencia, crédito) |
| TODO/FIXME con contexto accionable | `// TODO: migrar a SDK v2 al salir de beta (JIRA-4521)` |
| Contrato de API pública | Docstring/JSDoc que documenta comportamiento, no implementación |
| Regex no trivial | Explicar qué patrón captura y por qué esa forma |

## Cuándo NO comentar

- Lo que un nombre de variable/función bien elegido ya dice (`getUserById` no necesita `// obtiene el usuario por id`).
- Código obvio (`i++ // incrementa i`).
- Comentarios de autoría/fecha tipo `// modificado por Juan 12/03` — para eso está `git blame`.
- Código muerto comentado en vez de borrado — para eso está el control de versiones.
- Explicaciones largas que compensan una función mal dividida. Si necesitas un párrafo, refactoriza primero.
- Repetir en el comentario lo que ya dice el tipo/firma de la función (en lenguajes tipados, no dupliques el tipo en texto).

**Señal de alerta:** si un archivo tiene muchos comentarios explicando "qué hace esto", el diagnóstico no es "faltan más comentarios" — es que el código necesita refactor.

## Comentarios vs. documentación externa

No son sustitutos, resuelven problemas distintos. No subir de nivel una cosa a la otra.

| | Comentario inline | Documentación externa (README, ADR, wiki) |
|---|---|---|
| Alcance | Una línea, función o bloque puntual | Arquitectura, flujos entre servicios, decisiones de producto |
| Se consulta | Al leer/editar esa línea específica | Al diseñar, onboardear, planear |
| Vida útil | Corta, ligada a esa implementación | Más larga, riesgo de quedar desactualizada sin que nadie lo note |

Regla práctica: decisión de negocio o técnica que afecta a **un módulo puntual** → comentario. Decisión que afecta a **varios servicios, el flujo general o la arquitectura** → ADR o doc externo, no un comentario de 5 líneas al inicio del archivo.

## Convenciones por stack (aplicar la de contexto)

- **Frontend (JS/TS, React, Vue):** JSDoc/TSDoc en hooks, componentes y funciones exportadas. Evitar comentar el JSX obvio; sí comentar efectos secundarios no evidentes en `useEffect`, condiciones de render no triviales, y hacks de CSS/navegador.
- **Backend (Node, Python, Java, Go, etc.):** docstring/Javadoc/Godoc en toda función pública o endpoint. Comentar validaciones de seguridad, contratos de idempotencia, y por qué una query no usa el ORM si aplica.
- **SQL/migraciones:** comentar siempre el motivo de un índice no obvio, un constraint inusual, o una migración destructiva.
- **Infra/IaC:** comentar por qué un recurso tiene una configuración fuera del default (costos, compliance, límites de proveedor).

En todos los casos el test de decisión de arriba manda por encima de la convención del lenguaje — la convención dice *cómo* formatear el comentario, no si hace falta.

## Aplicación en code review

Al revisar comentarios existentes, marcar:
- **Redundante:** repite lo que el código ya dice → sugerir eliminarlo.
- **Desactualizado:** contradice el comportamiento actual del código → bug de documentación, corregir o eliminar.
- **Mal ubicado:** documenta arquitectura/flujo multi-módulo dentro de un comentario de una línea → mover a documento externo.
- **TODO sin contexto:** sin ticket ni motivo → exigir contexto o eliminar antes de mergear a rama principal.
- **Comentario que tapa código complejo:** si el comentario es más largo que el bloque que explica → señalar necesidad de refactor, no aprobar el comentario como solución.

## Checklist final antes de terminar cualquier tarea de código

- [ ] Ningún comentario describe una acción obvia.
- [ ] Todo comentario que quedó explica un "por qué", no un "qué".
- [ ] Nada de arquitectura/flujo multi-módulo metido en un comentario inline.
- [ ] APIs públicas y funciones exportadas tienen docstring/JSDoc del contrato.
- [ ] TODOs tienen ticket o motivo, no quedaron sueltos.
- [ ] Ningún comentario quedó desactualizado respecto al código que se acaba de cambiar.
