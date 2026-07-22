# Referencia: DDD táctico

> Opt-in. Se carga SOLO cuando el dominio es complejo (ver gating abajo). No por tamaño de tarea.
> Ejemplos agnósticos. Si el dominio es simple (CRUD, poco invariante), NO uses esto: es sobreingeniería.

## Gating — ¿este dominio amerita DDD?

DDD se aplica por **complejidad de dominio**, no por cuánto código hay. Señales de que SÍ amerita:
- Hay reglas de negocio con invariantes que se violan fácil (montos, estados, transiciones).
- El lenguaje del negocio es rico y los expertos usan términos propios (ubiquitous language).
- Varias entidades cambian juntas y deben quedar consistentes entre sí.

Si nada de eso aplica → es CRUD con reglas livianas. Usá entidades simples y listo. No sigas leyendo.

## Value Objects — el de mayor retorno, empezá por acá

```
# MAL — primitivos sueltos, la invariante se valida (o se olvida) en todos lados
function createUser(email: string):
    if not email.contains("@"): throw ...   # se repite en 5 lugares

# BIEN — el tipo se valida a sí mismo, una vez, y no puede existir inválido
class Email:
    constructor(value):
        if not isValid(value): throw InvalidEmail(value)
        this.value = value
# Ahora "Email" es siempre válido en todo el sistema. Imposible pasar uno roto.
```
> Encaja con "validación en el dominio" de la constitución. Barato, previene una clase entera de bugs.

## Aggregate — consistencia como una unidad

```
# El aggregate root es la única puerta de entrada al grupo de entidades.
# Garantiza invariantes del conjunto.
class Order:                      # root
    private items: OrderItem[]
    function addItem(product, qty):
        if this.status != "draft": throw CannotModifyConfirmedOrder()
        # la regla del conjunto vive acá, no afuera
```
- Una transacción modifica un aggregate. Entre aggregates → eventos, no llamadas directas.

## Domain Events — algo de negocio relevante pasó
```
# El dominio anuncia hechos en lenguaje de negocio; otros reaccionan desacoplados.
class Order:
    function confirm():
        this.status = "confirmed"
        this.record(OrderConfirmed(this.id))   # se publica al guardar
```
> Conecta con Observer/Event-driven de `patterns.md`. El límite del aggregate define qué es atómico
> y qué se resuelve por evento.

## Reglas clave
- Empezá por Value Objects. Aggregates y eventos solo si la complejidad los pide.
- Un aggregate por transacción. Entre aggregates, consistencia eventual vía eventos.
- El lenguaje del código = el lenguaje del negocio (ubiquitous language).
- DDD sin dominio complejo = ceremonia inútil. El gating no es opcional.

## Verificación
- [ ] El dominio pasó el gating (complejidad real, no tamaño)
- [ ] Los conceptos con invariante son Value Objects, no primitivos sueltos
- [ ] Cada transacción modifica un solo aggregate
- [ ] Los nombres del código coinciden con los términos del negocio
