# Referencia: Testing

> Ejemplos agnósticos. Traducí al framework de testing del proyecto.

## Test de caso de uso (el más valioso)

```
# Testear comportamiento, no implementación.
# Mockear el repository por su interfaz, no la BD real.

describe("CancelOrder"):

    test("cancela una orden pendiente"):
        # Arrange
        repository = mockRepository()
        repository.find returns Order(id: 1, status: "pending")
        useCase = new CancelOrder(repository)

        # Act
        useCase.execute(1)

        # Assert
        expect(repository.saved.status).toBe("cancelled")

    test("no cancela una orden ya entregada"):
        repository = mockRepository()
        repository.find returns Order(id: 1, status: "delivered")
        useCase = new CancelOrder(repository)

        # Assert: el error de negocio esperado ocurre
        expect(() => useCase.execute(1)).toThrow(CannotCancelDeliveredOrder)
```

## Principio base

```
# MAL — el test depende de la implementación
test("guarda en la tabla users con INSERT"):
    # se rompe si cambiás de ORM o de BD, aunque el comportamiento sea igual

# BIEN — el test prueba el comportamiento
test("un usuario registrado puede recuperarse después"):
    # sobrevive a cambios de ORM, BD, o framework
```

## Reglas clave
- Tests de casos de uso primero: mockear repository, probar flujo feliz + cada error de negocio.
- No levantar BD ni servidor en tests unitarios.
- Un test prueba una sola cosa.
- El nombre del test describe comportamiento esperado, no código.
- Sin lógica compleja dentro del test (si el test necesita lógica, algo está mal).

## Verificación
- [ ] Los tests no dependen de implementaciones concretas
- [ ] Cada test prueba un solo comportamiento
- [ ] Los nombres describen qué debería pasar, no cómo
- [ ] Flujo feliz + errores de negocio cubiertos
