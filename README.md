# FlowMind

> Plataforma de gestión de proyectos con IA — proyecto portfolio de [Eudald Bosch](https://github.com/Eudald2000)

FlowMind es una aplicación SaaS full-stack donde los equipos pueden organizar workspaces, proyectos y tareas a través de una interfaz tradicional — y próximamente a través de un agente de IA en lenguaje natural. Construido como portfolio principal para demostrar ingeniería full-stack de nivel producción.

---

## Funcionalidades (Fase 1 — implementadas)

### Autenticación
- Registro e inicio de sesión con email y contraseña via Supabase Auth
- OAuth con Google
- Sesión gestionada con cookies httpOnly (seguro, sin localStorage)
- Refresco automático de sesión en cada request via middleware de Next.js

### Workspaces
- Crear y gestionar múltiples workspaces
- Cambiar de workspace desde el sidebar
- Control de acceso por roles: **owner**, **admin**, **member**
- Los owners pueden eliminar el workspace

### Proyectos
- Crear, editar y eliminar proyectos dentro de un workspace
- Eliminación con control de rol (solo admin/owner)
- Estado activo/inactivo

### Tareas
- Crear tareas con título, descripción, estado, prioridad y fecha límite
- Editar y eliminar tareas
- Cuatro estados: `Todo`, `En progreso`, `Hecho`, `Cancelado`
- Cuatro niveles de prioridad: `Baja`, `Media`, `Alta`, `Urgente`

### Vistas
- **Kanban** — drag-and-drop de tareas entre columnas de estado
- **Lista** — vista tabular de todas las tareas

### Observabilidad
- **Sentry** — captura automática de errores (cliente, servidor y edge runtime)
- **PostHog** — analíticas de producto y tracking de páginas vistas

---

## Stack técnico

### Frontend
| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 (modo estricto) |
| Estilos | Tailwind CSS v4 |
| Componentes | shadcn/ui (primitivos Radix UI) |
| Iconos | Lucide React |
| Formularios | React Hook Form + Zod |
| Drag & Drop | @dnd-kit |

### Backend
| Capa | Tecnología |
|---|---|
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| API | Next.js Server Actions + Route Handlers |
| Validación | Zod |

### Infraestructura
| Capa | Tecnología |
|---|---|
| Hosting | Vercel |
| Base de datos | Supabase Cloud |
| Tracking de errores | Sentry |
| Analíticas | PostHog |

---

## Arquitectura

```
Navegador
  └── Middleware de Next.js (refresco de sesión)
        └── Server Component (guard de auth + fetch de datos)
              ├── Server Actions (mutaciones)
              └── Client Components (UI interactiva)
                    └── Supabase (PostgreSQL + RLS)
```

**Decisiones de diseño clave:**
- Los Server Components obtienen los datos — sin loading spinners en el renderizado inicial
- Los Server Actions gestionan las mutaciones — sin endpoints REST separados para los formularios
- Row Level Security (RLS) aplicado a nivel de base de datos en todas las tablas
- La service role key es solo del servidor — nunca expuesta al navegador

---

## Instalación local

### Requisitos
- Node.js 22+
- Un proyecto en [Supabase](https://supabase.com)
- Un proyecto en [Sentry](https://sentry.io)
- Un proyecto en [PostHog](https://posthog.com)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Eudald2000/flowmind.git
cd flowmind

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Rellena con tus credenciales de Supabase, Sentry y PostHog

# 4. Arrancar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno principales

```bash
NEXT_PUBLIC_SUPABASE_URL=       # URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Anon key de Supabase (segura para el navegador)
SUPABASE_SERVICE_ROLE_KEY=      # Solo servidor — nunca exponer al cliente
NEXT_PUBLIC_SENTRY_DSN=         # DSN de Sentry
NEXT_PUBLIC_POSTHOG_KEY=        # API key del proyecto PostHog
```

---

## Roadmap

### Fase 1 — Base ✅
- Auth, workspaces, proyectos, tareas
- Kanban board con drag-and-drop
- Permisos basados en roles
- Sentry + PostHog

### Fase 2 — Agente IA (próximamente)
- `POST /api/agent` con streaming via Server-Sent Events
- Claude claude-sonnet-4-6 con tool use: crear, actualizar, eliminar y consultar tareas
- Interfaz en lenguaje natural en cada proyecto
- Trazabilidad con Langfuse en cada llamada al agente

### Fase 3 — RAG + Documentos (próximamente)
- Subida de PDFs y extracción de texto
- Embeddings con Voyage AI + búsqueda semántica con pgvector
- El agente responde preguntas sobre documentos subidos con atribución de fuente

### Fase 4 — Pulido (próximamente)
- Tests E2E con Playwright
- Feature flags de PostHog para el rollout de IA
- Dominio personalizado + Lighthouse ≥ 90

---

## Licencia

MIT
