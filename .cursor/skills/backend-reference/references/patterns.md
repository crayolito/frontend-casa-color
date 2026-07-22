# Referencia: Patrones de diseño

> Ejemplos agnósticos. Traducí al stack del proyecto.
> Regla madre: los patrones NO se adoptan de catálogo. Cada uno responde a una SEÑAL de problema,
> vive en una CAPA concreta, y tiene un caso donde NO va. Si no reconocés la señal, no metas el patrón.
> Si el proyecto ya usa un patrón para ese problema, seguí ESE.

## Tabla de decisión — señal → patrón → capa → cuándo NO

| Señal de problema | Patrón | Vive en | Cuándo NO |
|---|---|---|---|
| El caso de uso necesita datos pero no debe saber de qué BD salen | **Repository** | interfaz en `domain`, impl en `repositories`/`adapters` | Nunca lo saltees por "es un query simple": rompe la inversión |
| Una clase necesita una dependencia sin construirla ella misma | **Dependency Injection** | cableado en composition root (`infra`/main); interfaces en `domain` | — (es la base; siempre aplica con Clean) |
| Querés agregar comportamiento (cache, log, retry) a algo sin tocar su código | **Decorator** | `adapters` (envuelve un repo/gateway por su interfaz) | Si solo hay una implementación y nunca vas a envolver nada |
| Algo pasó y varios interesados deben reaccionar sin acoplarse al emisor | **Observer / Event-driven** | el caso de uso PUBLICA; interfaz del bus en `application`, impl en `infra` | Si el "interesado" es uno solo y la llamada directa basta. No metas eventos por moda |
| Lógica transversal en el borde (auth, parseo, rate-limit) | **Middleware** | `controllers` (borde de transporte) | Si la lógica es de negocio: va al dominio, no al middleware |

## El caso del Singleton — leé esto antes de usarlo

```
❌ MAL — Singleton clásico (GoF): constructor privado + accessor estático global
class Db:
    private constructor()
    static getInstance()         # estado global, imposible de mockear
# Pelea con testing.md: no podés inyectar un mock. Es deuda.

✅ BIEN — "instancia única" como CICLO DE VIDA del contenedor de DI
container.register(Db, { lifecycle: "singleton" })   # una sola instancia...
class CreateOrder:
    constructor(db: Db)          # ...pero inyectada. Testeable, sin estado global.
```
> Misma palabra, cosas opuestas. Lo que casi siempre querés es lo segundo (config del composition root),
> NO el patrón Singleton. El Singleton GoF es el enemigo de tu testeo de casos de uso.

## Reglas clave
- La señal manda. Sin problema reconocido, no hay patrón.
- Cada patrón en su capa (ver tabla y `patterns-by-layer.mdc`).
- Observer/eventos desacoplan, pero esconden el flujo: usalos cuando el desacople vale más que la trazabilidad directa.
- "Instancia única" = ciclo de vida del DI, no Singleton global.

## Verificación
- [ ] Cada patrón presente responde a una señal real (no "por si acaso")
- [ ] Cada patrón está en la capa que le corresponde
- [ ] No hay Singleton GoF (estado global); las instancias únicas son lifecycle del contenedor
- [ ] Los eventos se usan donde el desacople lo justifica, no por moda
