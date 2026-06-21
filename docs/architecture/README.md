# Architecture Documentation

This directory contains C4 architecture diagrams and architectural decision records for the skill usage
tracking system.

---

## C4 Architecture Diagrams

Diagrams are maintained as code in [`architecture.c4`](./architecture.c4)
using [LikeC4](https://likec4.dev).

### Viewing Diagrams Locally

#### Option 1: Live preview with LikeC4 CLI

```bash
npx likec4 start docs/architecture/
```

This starts a local server at `http://localhost:3000` with live reload. Edit `architecture.c4` and the
browser updates instantly.

#### Option 2: VS Code Extension (recommended)

Install [LikeC4 for VS Code](https://marketplace.visualstudio.com/items?itemName=likec4.likec4)
and open `architecture.c4`. Live preview is embedded in the editor with no CLI overhead.

### Exporting Diagrams as Images

Export all diagrams as PNG files:

```bash
npx likec4 export png docs/architecture/ -o docs/architecture/export/
```

Output is written to `docs/architecture/export/` — one PNG per view.

### Defined Views

The following C4 views are currently defined:

- **System Context (Level 1)** — `view context`
  - Shows: Developer → Telemetry Client Script → Telemetry Server, Developer → Dashboard
  - Use case: high-level system overview for stakeholders

- **Container (Level 2)** — `view containers of telemetryServer`
  - Shows: FastAPI Server, SQLite Database, React SPA, and their communication
  - Use case: understand major components and interactions

**Future**:

- **Component (Level 3)** — to be documented after the first implementation iteration
- **Code (Level 4)** — deferred (overkill for this system's scale)

---

## Architecture Decision Records

See [`decisions/`](./decisions/) for individual ADRs documenting all major design choices:

- **ADR-001 through ADR-014** — one file per decision
- **TEMPLATE.md** — template for future ADRs (MADR format)

Start with the [decisions index](./decisions/) to navigate by topic.

---

## Workflow

When updating architecture:

1. **Edit `architecture.c4`** with your changes
2. **View live in VS Code** (or `npx likec4 start`)
3. **Document the decision** in a new ADR if it's a major change
4. **Export images** if updating documentation:
   `npx likec4 export png docs/architecture/ -o docs/architecture/export/`
5. **Commit** both the `.c4` file and any new ADRs

---

## Resources

- [LikeC4 Documentation](https://likec4.dev) — DSL syntax, examples, advanced features
- [C4 Model](https://c4model.com) — conceptual background on the four abstraction levels
- [MADR (Markdown Architecture Decision Records)](https://adr.github.io/madr/) —
  format used for ADRs
