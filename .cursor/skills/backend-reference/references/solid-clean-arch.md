# Referencia: SOLID y Clean Architecture

> Ejemplos en pseudocódigo agnóstico. Traducí la estructura al stack del proyecto.
> Si el proyecto ya tiene un ejemplo del mismo patrón, seguí ESE.

## Single Responsibility (S)

```
# MAL — un servicio que hace todo
class UserService:
    function register(data):
        validate(data)              # validación
        hash = hashPassword(data)   # seguridad
        query("INSERT INTO ...")    # acceso a datos
        sendEmail(data.email)       # notificación
        log("user created")         # logging
    # 5 responsabilidades. Imposible de testear por partes.

# BIEN — cada responsabilidad en su lugar
class RegisterUser:                    # caso de uso: orquesta
    function execute(data):
        user = User.create(data)       # dominio: reglas + validación
        userRepository.save(user)      # repository: persistencia
        eventBus.publish(UserRegistered(user))  # desacopla lo demás
```

## Open/Closed (O)

```
# MAL — agregar un método de pago obliga a editar la clase cada vez
class PaymentProcessor:
    function pay(type):
        if type == "card": ...
        else if type == "paypal": ...
        else if type == "crypto": ...   # crece sin fin, se toca lo que ya andaba

# BIEN — abierto a extensión, cerrado a modificación
interface PaymentMethod:
    function pay(amount)
class CardPayment implements PaymentMethod: ...
class PaypalPayment implements PaymentMethod: ...
# Sumar uno nuevo = una clase nueva, sin tocar las existentes.
```

## Liskov Substitution (L)

```
# MAL — la subclase rompe el contrato de la base
class Repository:
    function save(x)                    # promete persistir
class ReadOnlyRepository extends Repository:
    function save(x): throw Error()     # viola la promesa: no es sustituible

# BIEN — no fuerces una jerarquía donde el contrato no se cumple
interface ReadRepository:  function find(id)
interface WriteRepository: function save(x)
# Cada cosa implementa lo que de verdad cumple.
```

## Interface Segregation (I)

```
# MAL — interfaz gorda: el que la implementa carga métodos que no usa
interface UserRepository:
    find(id); save(u); delete(id); exportToCsv(); sendNewsletter(); buildReport()
    # un repo de lectura no debería arrastrar exportToCsv ni sendNewsletter

# BIEN — interfaces chicas y enfocadas
interface UserReader:  find(id)
interface UserWriter:  save(u); delete(id)
# El caso de uso depende solo de lo que usa. (El error típico en repos: interfaces gordas.)
```

## Dependency Inversion (D)

```
# MAL — el caso de uso conoce la implementación concreta
class CreateOrder:
    function execute(data):
        db = new PostgresConnection()   # acoplado a Postgres
        db.query("INSERT ...")          # acoplado a SQL

# BIEN — el caso de uso depende de una abstracción
interface OrderRepository:              # definido en el DOMINIO
    function save(order)

class CreateOrder:                      # en APLICACIÓN
    constructor(orderRepository: OrderRepository)
    function execute(data):
        order = Order.create(data)
        this.orderRepository.save(order)  # no sabe qué BD es
```

## El caso de uso no conoce HTTP

```
# MAL — caso de uso acoplado al transporte
class GetUser:
    function execute(req, res):
        id = req.params.id
        res.json(repository.find(id))   # responde HTTP directo

# BIEN — caso de uso independiente del transporte
class GetUser:
    function execute(userId):           # dato plano
        user = repository.find(userId)
        if user is null:
            throw UserNotFound(userId)  # error de negocio
        return user                     # devuelve dato

class UserController:                   # el controller traduce HTTP
    function handle(req, res):
        try:
            user = getUser.execute(req.params.id)
            res.status(200).json({ data: user })
        catch UserNotFound:
            res.status(404).json({ error: { code: "USER_NOT_FOUND" } })
```

## Transacciones / Unit of Work — atomicidad sin acoplar el dominio a la infra

```
# Problema: un caso de uso toca varios repositories en UNA operación.
# Crear orden + descontar stock + registrar pago: o pasa todo, o no pasa nada.

# MAL — cada save commitea por su cuenta; si el 3ro falla, quedaste a medias
class PlaceOrder:
    function execute(data):
        orderRepo.save(order)       # commit
        stockRepo.discount(items)   # commit
        paymentRepo.charge(pay)     # ❌ falla acá → orden y stock ya quedaron inconsistentes

# BIEN — el caso de uso define el LÍMITE de la transacción; la infra la implementa
interface UnitOfWork:               # definido hacia el dominio/aplicación
    function run(work)              # ejecuta todo dentro de una transacción

class PlaceOrder:
    constructor(uow: UnitOfWork)
    function execute(data):
        this.uow.run(() => {
            orderRepo.save(order)
            stockRepo.discount(items)
            paymentRepo.charge(pay)
        })                          # todo junto: commit al final, rollback si algo falla
```
- El caso de uso decide QUÉ es atómico. CÓMO se hace la transacción (BD, ORM) vive en infra.
- No metas lógica de transacción en controllers ni en el dominio.
- Regla DDD relacionada: una transacción modifica un solo aggregate; entre aggregates → eventos (`references/ddd.md`).

## Verificación
- [ ] Cada clase tiene una sola razón para cambiar (S)
- [ ] Extender no obliga a modificar lo que ya funciona (O)
- [ ] Las subclases/implementaciones cumplen el contrato de su interfaz (L)
- [ ] Las interfaces son chicas y enfocadas; sin repos con interfaces gordas (I)
- [ ] Los casos de uso reciben datos planos, no req/res; dependen de abstracciones (D)
- [ ] El dominio define interfaces, los adapters las implementan; dependencias hacia adentro
- [ ] Operaciones multi-repository son atómicas vía Unit of Work, no commits sueltos
