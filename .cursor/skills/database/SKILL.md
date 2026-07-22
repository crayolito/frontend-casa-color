---
name: database
description: Reglas de base de datos, esquema y migraciones. Cargar SIEMPRE que la tarea cree/modifique/corrija migraciones, toque entities con impacto en schema, escriba queries en repositories, cambie cómo corren las migraciones en el deploy/arranque, o cuando un deploy falle por errores de DB. La carpeta schema/ de este skill es la fuente de verdad del esquema.
---

# Skill: Base de datos

> Agnóstico al motor. El proyecto puede usar PostgreSQL, MySQL, SQL Server, Oracle, MongoDB u otro —
> estas reglas se TRADUCEN al motor del proyecto, no se asume ninguno.
> Fuentes: patrón expand-contract (Parallel Change, Fowler/Sato), guías de zero-downtime migrations.

## El apartado del esquema: `schema/`

El esquema del proyecto vive en la carpeta `schema/` de este skill. Ahí el dev pone:
- `schema/schema.sql` (o `.js`, `.prisma`, el formato que sea) — el script/DDL del proyecto actual.
- Opcionalmente `schema/notes.md` — decisiones, convenciones o particularidades del esquema.

**Reglas del apartado:**
1. **Es LA fuente de verdad del esquema.** Antes de escribir cualquier query, migración o entidad, leé lo que hay acá. Los nombres de tablas/columnas/colecciones salen de acá, no de la imaginación.
2. **Si `schema/` está vacío → NO asumas nada.** No inventes tablas, no supongas columnas, no elijas motor. Preguntá al dev: "¿me pasás el esquema o lo diseñamos juntos?" Con esquema diseñado en la conversación, ofrecé guardarlo en `schema/` para que quede como fuente de verdad.
3. **El dev lo cambia cuando quiere.** Hoy PG, mañana Oracle: se reemplaza el contenido de `schema/` y el skill sigue funcionando igual. Nada fuera de esta carpeta depende del motor.
4. **Proyecto existente:** si te integrás a un proyecto hecho y te pasan el script, va acá. Si el esquema real de la BD y el de `schema/` divergen, señalalo — no trabajes contra un esquema desactualizado.

---

## Correctitud contra el schema real — ANTES de idempotencia y ANTES de estilo

> Lección de incidente real: una migración con `IF NOT EXISTS` tiró producción igual,
> porque indexaba `products("categoryId")` y esa columna no existe — la relación era
> @ManyToMany vía tabla intermedia. IF NOT EXISTS protege contra objetos DUPLICADOS,
> no contra referencias INEXISTENTES. Son dos verificaciones distintas; van las dos.

- **Cada tabla y columna referenciada en DDL se verifica contra `schema/` (o las
  entities si schema/ está vacío y el dev pasó el código) y se CITA la evidencia**:
  `✅ products_categories."categoryId" — existe: product.entity.ts, @JoinTable inverseJoinColumn`.
  Referencia sin evidencia = migración incompleta, no se propone.
- **Trampa ORM**: @ManyToMany + @JoinTable pone las FK en la tabla intermedia, NO en
  la entidad. @ManyToOne sí genera columna propia. Antes de indexar "la columna de la
  relación", determinar en QUÉ tabla la puso el ORM. Nunca deducirlo por el nombre.

## Idempotencia contra DB legacy — el historial puede mentir

> Lección de incidente real: prod tenía el schema evolucionado (sync/SQL manual) con la
> tabla de historial de migraciones VACÍA. Al correr las migraciones "desde cero", una
> no idempotente chocó con una columna que ya existía y el servicio no levantó.

- Toda migración DDL debe sobrevivir contra una DB que YA tiene el objeto:
  `IF NOT EXISTS`, checks en information_schema, guards en drops/renames.
- **Baseline primero**: antes de escribir o correr migraciones en un proyecto con DB
  existente, preguntar: "¿el historial de migraciones de PROD refleja el schema real?"
  Si la respuesta es "no sé" → es bloqueante: se verifica (o se hace el baseline:
  registrar como aplicadas las migraciones cuyo efecto ya está en el schema) antes
  de agregar migraciones nuevas.

## Migraciones y el arranque — PROHIBIDO acoplar sin plan

> Lección de ambos incidentes: `migration:run` en el comando de start con abort en
> fallo convirtió cada migración rota en un apagón total del API (502 en todo).

- Por defecto, las migraciones corren como **paso de deploy separado**: si fallan,
  falla el deploy con el servicio anterior todavía sirviendo tráfico.
- Si el dev insiste en correrlas al boot: declarar explícito el modo de fallo
  ("migración rota = servicio caído") y exigir el gate previo (abajo).
- Todo cambio al comando de arranque (nixpacks, Dockerfile, entrypoint, Procfile)
  se trata como cambio de infraestructura de riesgo ALTO, nunca como "trivial de
  1 archivo": lista qué corría antes, qué corre ahora y el nuevo modo de fallo.

## Gate ejecutable — la única garantía real

- Ninguna regla de agente garantiza el 100%. El respaldo determinístico es correr
  TODAS las migraciones contra un motor efímero limpio (y, mejor, contra un dump
  de schema de prod) en CI o pre-deploy. Si el repo tiene `scripts/verify-migrations.sh`
  o equivalente, recordarle al dev correrlo antes de commitear una migración; si no
  existe, recomendarlo una vez.

---

## Migraciones — las reglas que evitan tirar producción

### Versionadas y chicas
- Toda alteración del esquema es una migración versionada en el repo, junto al código — nunca un ALTER a mano en la BD.
- Una migración hace UNA cosa. Si falla, el radio del problema es chico y se debuggea fácil.
- Secuenciales y con nombre descriptivo: `0007-add-status-to-orders`.

### Expand-contract — NUNCA cambios destructivos en un paso
El patrón para todo cambio que rompe (renombrar, cambiar tipo, borrar) con el sistema corriendo:

```
# MAL — renombrar en un paso
ALTER TABLE users RENAME COLUMN user_name TO username;
# → el código viejo que sigue corriendo referencia user_name → roto en el instante

# BIEN — expand → migrar → contract (deploys separados)
1. EXPAND:   agregar `username` junto a `user_name`. Nada existente cambia. Deploy.
2. MIGRAR:   backfill de datos (en lotes si la tabla es grande);
             el código nuevo escribe en ambas y lee de la nueva. Deploy.
3. CONTRACT: cuando nada referencia `user_name`, borrarla. Deploy separado —
             puede ser días después. El contract nunca va junto al expand.
```
- Regla mental: **primero agregás lo nuevo, al final borrás lo viejo — nunca al revés, nunca junto.**
- Cada paso es reversible por sí solo; el rollback es "volver un paso", no "restaurar backup".

### Trampas clásicas de migración (chequear SIEMPRE antes de generarla)
- **Referencia inexistente** → toda tabla/columna citada en el DDL verificada contra `schema/` con evidencia (sección Correctitud — la trampa #1 de ESTE proyecto).
- **NOT NULL sin default sobre tabla existente** → falla o bloquea la tabla. Agregar nullable o con default; endurecer a NOT NULL después del backfill.
- **Índices sobre tablas grandes** → crear en modo no bloqueante si el motor lo permite (PG: `CREATE INDEX CONCURRENTLY`; otros motores: su equivalente online).
- **Backfills masivos en una sola query** → en lotes, en background. Una migración que tarda milisegundos con 100 filas puede tardar horas con millones.
- **Borrar "esa columna que nadie usa"** → verificar consumidores ocultos (reportes, integraciones, scripts) antes del contract.
- Toda migración declara su reversa (down) o documenta explícitamente por qué es irreversible.

### Al CORREGIR una migración rota — auditoría, no solo parche
- Verificar TODAS las demás sentencias del mismo archivo contra `schema/` (el error suele venir en lote).
- Barrer las otras migraciones del repo buscando la misma clase de error y reportar, aunque sea "sin hallazgos".
- Confirmar el estado transaccional: qué quedó aplicado tras el ROLLBACK y si la migración re-corre en el próximo deploy.
- Señalar la causa sistémica si existe (ej. migraciones acopladas al boot) — el parche destraba; el reporte debe decir qué cambio estructural evita la repetición.

---

## Queries — las reglas que evitan la lentitud

### N+1 — el bug de performance #1, y nace en los repositories
```
# MAL — 1 query por la lista + 1 por cada elemento
orders = orderRepo.findByUser(userId)          # 1 query
for order in orders:
    order.items = itemRepo.findByOrder(order)  # N queries

# BIEN — traer la relación en la misma consulta (join / include / $lookup / eager loading según motor)
orders = orderRepo.findByUserWithItems(userId) # 1-2 queries, siempre
```
- Señal de alerta al revisar/escribir un repository: un query dentro de un loop = N+1 casi seguro.

### Índices e higiene
- Lo que se filtra, ordena o joinea con frecuencia, se indexa — incluidas las FK. Pero no indexar "todo por las dudas": cada índice encarece las escrituras (mismo criterio anti-sobreingeniería de la constitución).
- Traer solo las columnas necesarias (conecta con allowlist de lectura, constitución → Seguridad).
- Paginar en la QUERY (`LIMIT/OFFSET`, cursor), no traer todo y cortar en memoria (constitución → API: toda lista se pagina).
- Unicidad de negocio (email único, código único) = constraint en la BD, no solo validación en código: la BD es la última línea contra duplicados en concurrencia.

### Transacciones y concurrencia
- El límite de transacción lo define el caso de uso (Unit of Work, constitución). El repository no abre transacciones por su cuenta.
- Verificar-y-mutar en una sola operación atómica (constitución → Seguridad, TOCTOU). Aplica igual en SQL (`UPDATE ... WHERE`) y en documentos (operaciones atómicas del motor).
- Transacciones cortas: nunca I/O externo (HTTP, email) dentro de una transacción abierta.

---

## Verificación (checklist que sdd-verify y sdd-audit EJECUTAN cuando hay BD)
- [ ] Toda tabla/columna referenciada en DDL tiene evidencia en `schema/` o entities (correctitud)
- [ ] Toda migración DDL es idempotente contra DB legacy; baseline confirmado o hecho
- [ ] Migraciones NO acopladas al boot sin plan y modo de fallo declarado
- [ ] Todo cambio de esquema es una migración versionada, chica, con reversa (o irreversibilidad documentada)
- [ ] Cero cambios destructivos en un paso: renombrar/cambiar tipo/borrar siguen expand-contract
- [ ] Cero NOT NULL sin default sobre tablas existentes; backfills en lotes
- [ ] Cero N+1: ningún query dentro de un loop en repositories
- [ ] Consultas frecuentes con índice; unicidad de negocio como constraint
- [ ] Queries consistentes con `schema/` (nombres reales, no inventados)
- [ ] Sin I/O externo dentro de transacciones
