# Referencia: Refactor e intervención de legacy riesgoso

> Opt-in. Se carga cuando `explore` marcó la tarea como refactor/intervención de legacy de riesgo medio/alto.
> Ejemplos agnósticos. Traducí al stack del proyecto.
> Regla madre (constitución): no se refactoriza por fealdad. El gatillo es el costo actual.

## Principio: no migrás todo, entrás solo a la rebanada

Un servicio de 900+ líneas feo pero que FUNCIONA no es una emergencia. Casi nunca hay que migrarlo entero. Necesitás la función que tu tarea toca — entrá solo a esa. Quizás el resto nunca se migre, y está bien.

## Los pasos (en orden)

### 1. Tests de caracterización ANTES de tocar una línea
Fijás el comportamiento ACTUAL con tests — incluso el que tiene bugs. No testeás lo que *debería* hacer; testeás lo que *hace hoy*. Es tu paracaídas: si lo rompés, te enterás.
```
# No: "el descuento debería ser 10%"  (eso es diseño nuevo)
# Sí: "hoy, con input X, este servicio devuelve Y"  (eso ancla el comportamiento real)
test("BadooService.process(X) devuelve Y como hoy"): ...
```
> ⚠️ Excepción a la constitución: en un refactor SIN cambio de spec, los tests de caracterización
> NO son opt-in. Son lo único que prueba que no rompiste nada. Acá testing es obligatorio.

### 2. Seam / branch by abstraction — poné una interfaz delante
Metés una abstracción entre los callers y el legacy. El código nuevo depende de la interfaz, no de la clase de 900 líneas. Es tu regla de inversión de dependencias aplicada a legacy.
```
interface BadooService:          # nueva, define el contrato
    function process(input)

class LegacyBadooService implements BadooService:   # la de 900 líneas, sin tocar adentro
class NewBadooService    implements BadooService:   # crece acá, por partes
```

### 3. Strangler Fig — crecés al lado, no reescribís en el lugar
La implementación nueva vive JUNTO a la vieja. Vas desviando un pedacito de las llamadas a la nueva, la hacés crecer, retirás la vieja por partes. El contrato queda estable → el resto del sistema nunca se rompe. Podés tardar meses con el sistema andando todo el tiempo.

### 4. Tranching — 1 flujo = 1 PR = 1 unidad de rollback
Usá los flujos conectados que detectó `explore` para cortar. Cada incremento toca un flujo, se revisa solo, se revierte solo. Nunca un PR gigante irrevisable.

### 5. Orden — valor alto / riesgo bajo primero
Arrancá por un pedazo chico para montar el arnés de tests y agarrar confianza. El monstruo va al final, cuando ya tenés red.

## Cada paso declara su rollback
"Es riesgoso" no alcanza. Cada incremento dice cómo vuelve atrás: revert de PR, feature flag para apagarlo, o corrida en paralelo (nueva y vieja a la vez, comparando salida) antes de cortar la vieja. Riesgo sin rollback = miedo, no ingeniería.

## Ejemplo de aplicación (servicio grande tipo "BadooService, 959 líneas")
1. NO lo migrás entero.
2. Interfaz `BadooService` delante; los callers nuevos dependen de ella.
3. Tests de caracterización sobre lo que hace hoy.
4. Cuando un feature te obliga a tocar la función X → sacás SOLO X a `NewBadooService`, detrás de la interfaz.
5. El resto de las 959 líneas sigue vivo en `LegacyBadooService`. Migración total: solo si el dev la pide y tras discutir costo.

## Verificación
- [ ] Hay tests de caracterización del comportamiento actual antes de tocar
- [ ] El código nuevo depende de una interfaz, no de la clase legacy
- [ ] El cambio está cortado en incrementos rollbackeables (1 flujo por paso)
- [ ] Cada paso tiene su camino de rollback declarado
- [ ] No se migró más de la rebanada que el objetivo necesitaba
- [ ] El contrato hacia el resto del sistema quedó estable (nada se rompió afuera)
