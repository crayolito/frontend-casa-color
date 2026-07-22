

> **Baseline siempre activa:** WCAG AA es piso en todo componente interactivo nuevo (misma lógica que seguridad: retrofit cuesta más que hacerlo de entrada). Lo que es opt-in/contextual es ir más allá de AA, no cumplir AA.
# Accesibilidad — WCAG

## HTML semántico antes que ARIA

No uses ARIA si un elemento HTML nativo ya resuelve el problema. Usa `<button>` en vez de `<div role="button">` — el nativo ya trae foco, rol y teclado correctos. Aplica ARIA solo cuando no exista equivalente nativo (dropdown custom, date picker), y en ese caso sigue un patrón ya documentado (ARIA Authoring Practices Guide) en vez de inventar el comportamiento de teclado.

## Navegación por teclado — verifica siempre

Cualquier componente interactivo que generes debe ser operable solo con Tab, Shift+Tab, Enter y Escape:
- Orden de foco lógico (sigue el orden visual, no el accidental del DOM).
- Foco visible siempre — nunca generes `outline: none` sin un reemplazo visual equivalente.
- Trampas de foco correctas en modales: el foco no debe escapar mientras está abierto, y debe volver al elemento que lo abrió al cerrarse.

## Gestión de foco en SPA — no opcional

Al generar routing en una SPA, mueve el foco programáticamente al contenido principal (o encabezado de la nueva vista) después de cada navegación, y anuncia el cambio con una región `aria-live` si es relevante. Sin esto, la navegación es invisible para lectores de pantalla.

## Contraste

Verifica contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande (AA) con una herramienta (axe, Lighthouse), no a criterio subjetivo.

## Formularios

- Cada input necesita `<label>` asociado explícitamente — nunca solo placeholder (desaparece al escribir, no siempre se lee).
- Mensajes de error asociados con `aria-describedby` y anunciados con `aria-live`/`role="alert"`.
- Agrupa campos relacionados con `<fieldset>`/`<legend>` cuando corresponda.

## Testing

Las herramientas automatizadas (axe, Lighthouse) detectan una fracción de los problemas reales. No presentes un score verde de Lighthouse como prueba de accesibilidad completa — recomienda o realiza testing manual con teclado y lector de pantalla real cuando el componente sea crítico.

## Cuándo NO profundizar más allá de AA — evita sobre-ingeniería

WCAG 2.1/2.2 AA es el piso no negociable (y obligación legal en muchos países). Ir a AAA completo o soportar tecnologías muy nicho de bajísimo uso se evalúa según el perfil real de usuarios del producto — no lo apliques por defecto sin ese contexto.

## Checklist antes de entregar

- [ ] ¿Se usó HTML semántico nativo antes que ARIA?
- [ ] ¿El flujo es completable solo con teclado?
- [ ] ¿El foco se gestiona explícitamente al navegar entre rutas?
- [ ] ¿El foco visible está presente en todos los elementos interactivos?
- [ ] ¿El contraste cumple AA verificado con herramienta?
- [ ] ¿Los formularios tienen labels reales y errores anunciados?
