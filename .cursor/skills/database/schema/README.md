# schema/ — el apartado del esquema del proyecto

Poné acá el esquema de LA base de datos de ESTE proyecto:

- `schema.sql` / `schema.prisma` / `schema.js` / el formato de tu motor — el script real.
- `notes.md` (opcional) — decisiones o particularidades del esquema.

Reglas (las completas están en SKILL.md):
- Esto es la fuente de verdad: el agente lee de acá antes de escribir queries, migraciones o entidades.
- Carpeta vacía = el agente NO asume nada y te pregunta.
- Cambiás de motor o de proyecto → reemplazás el contenido. Nada más depende de esto.
