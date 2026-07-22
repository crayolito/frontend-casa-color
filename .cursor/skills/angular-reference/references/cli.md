# Referencia: Angular CLI — comandos ejecutables

> `sdd-apply` carga esto al implementar: la arquitectura sin los comandos correctos se improvisa mal. Verificá la versión local ANTES de asumir flags: `ng version`. Si un flag no existe en la versión del proyecto, mandá `ng <comando> --help`, no adivines.

## Crear proyecto (día 0 — checklists.md tiene la lista completa)

```bash
ng new <nombre> --style=scss --ssr=false   # standalone y esbuild son default; SSR solo si el ADR lo decidió
# Zoneless: default en versiones nuevas; si el schematic pregunta o es versión previa: elegir zoneless / quitar zone.js de polyfills
```

## Generar (respetando la estructura de architecture.md)

```bash
ng g component features/<feature>/ui/<nombre>        # tonto → ui/
ng g component features/<feature>/feature/<nombre>   # smart → feature/
ng g service features/<feature>/data/<nombre>        # HTTP → data/
ng g service features/<feature>/state/<nombre>       # estado → state/
ng g guard core/auth/<nombre>          # elegir functional (CanActivateFn) — nunca clase
ng g interceptor core/http/<nombre>    # functional
ng g pipe shared/util/<nombre>
ng g environments                      # crea environments tipados si no existen
```

Los schematics generan standalone por default en versiones actuales. Si el proyecto tiene config vieja que genera NgModules → corregir `angular.json` (schematics defaults), no pelear comando a comando.

## Día a día

```bash
ng serve                        # dev
ng test                         # unit (Vitest si el proyecto ya está en Vitest)
ng test --watch=false           # CI / verify: corrida única — ESTE es el comando que sdd-verify ejecuta
ng build --configuration=production   # build prod con budgets activos (environments-deploy.md)
ng lint                         # angular-eslint
```

## Actualizar (política: cada major en sus primeros 3 meses)

```bash
ng update                                          # lista qué hay
ng update @angular/core@<N> @angular/cli@<N>       # de a UNA major, nunca saltar dos
# Después de cada update: correr suite completa + build prod. Leer el changelog oficial ANTES.
```

## Agregar capacidades

```bash
ng add @angular/material        # si el ADR eligió Material
ng add @angular/localize        # si el ADR de i18n eligió localize
```

`ng add` ejecuta schematics que TOCAN archivos: revisar el diff antes de commitear, como cualquier cambio.
