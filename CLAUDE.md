# CLAUDE.md — Guía de trabajo para Concienciapp

> Este archivo define **cómo debe trabajar la IA (Claude)** en este proyecto. Las reglas de la sección
> "Reglas de trabajo obligatorias" tienen prioridad y deben cumplirse en **cada** interacción.

---

## 1. Sobre el proyecto

**Concienciapp** es una app híbrida para la empresa **Conciencia**, dedicada a la venta de asesorías.
Cada asesoría incluye tres pilares: **entrenamiento físico**, **nutrición** y ayuda para integrar la
**meditación** en el día a día. La empresa hoy hace todo manualmente; esta app cubre sus necesidades,
automatiza procesos y mejora la organización.

Hay dos perfiles:

- **Usuario:** ve su progreso mediante gráficos en el dashboard principal, y consulta sus pilares
  (físico, nutrición, mental), su perfil y su configuración.
- **Admin (dueños de la empresa):** agregan y asignan a cada usuario los ejercicios, recetas y planes,
  gestionan los catálogos y la configuración de pilares.

---

## 2. Stack y estructura

**Stack:**

- Next.js **App Router** (Next 16 — por eso el archivo es `proxy.ts`, no `middleware.ts`).
- React 19.
- TypeScript en modo `strict`.
- Supabase (Auth, Postgres, Storage) mediante `@supabase/ssr`.
- Tailwind CSS 3 + **CSS Modules**.
- Componentes propios + Radix / shadcn (`components/ui/`).
- `next-themes` (tema claro/oscuro), `lucide-react` (iconos).
- `next.config.ts` con `cacheComponents: true` y `remotePatterns` para Storage de Supabase.
- Alias TypeScript `@/*` apuntando a la raíz.

**Estructura de carpetas:**

```text
app/                 # Routing y layouts. Las páginas suelen ser wrappers finos que delegan a components/
  auth/              # Login, sign-up, forgot/update-password, confirm
  dashboard/         # Dashboard del usuario
  pilar-fisico/  pilar-nutricion/  pilar-mental/
  profile/  settings/
  admin/             # Área de administración (protegida en proxy.ts)
    users/[userId]/  catalog/  exercises/  recipes/  settings/
components/
  user-component/    # Experiencia del usuario
  admin-component/   # Experiencia del admin
  ui/                # Componentes visuales reutilizables
hooks/               # Context Providers (perfil, configuración de pilares)
lib/
  supabase/          # client.ts (browser) y server.ts (server)
  utils.ts
proxy.ts             # Sesión, redirecciones y protección de rutas /admin (middleware de Next 16)
```

**Idioma del código:** todo el proyecto (código, comentarios, UI, nombres de dominio) está en **español**.

---

## 3. Reglas de trabajo obligatorias

Estas reglas son innegociables y aplican siempre:

- **R1 — Plan antes de actuar.** Antes de hacer **cualquier** cambio en el código, plantea un plan claro
  y espera la aprobación del desarrollador. No edites nada sin plan aprobado.
- **R2 — Preguntar siempre lo necesario.** Haz todas las preguntas que consideres necesarias antes de
  asumir. No des por sentada la intención del desarrollador; ante la duda, pregunta.
- **R3 — Ediciones quirúrgicas.** **Nunca reescribas por completo un archivo que ya funciona.** Agrega o
  elimina **únicamente** lo que se pide. Una reescritura mayor solo procede si forma parte de un plan
  explícitamente aprobado en R1.
- **R4 — Idioma español.** Mantén el español en código, comentarios, UI y nombres de dominio, coherente
  con lo existente.
- **R5 — Respetar convenciones existentes.** Sigue el estilo, naming y patrones ya presentes (CSS Modules,
  alias `@/*`, páginas como wrappers finos, tipos e interfaces al inicio de cada componente, etc.).
- **R6 — Gestor de paquetes.** Usa **siempre pnpm** (nunca npm ni yarn) para instalar dependencias y
  ejecutar scripts.

---

## 4. Buenas prácticas de Next.js

Basadas en <https://urianviera.com/nextjs/buenas-practicas-nextjs> y adaptadas a este proyecto. Aplícalas
en código nuevo y, según R1/R3, al refactorizar:

- **Server Components por defecto.** Usa `"use client"` solo cuando haya interacción real (formularios,
  modales, tabs, estado efímero del navegador).
- **Mutaciones con Server Actions.** Prefiere Server Actions (`"use server"`) o Route Handlers para
  escrituras, en lugar de escribir a Supabase directamente desde el navegador cuando se pueda evitar.
  Retorna objetos con `success` / `error` / `message`.
- **Data fetching centralizado y reutilizable.** Agrupa la lógica de consultas en funciones reutilizables;
  haz la carga inicial en el servidor. Maneja errores de forma robusta.
- **Caché y revalidación.** Usa correctamente `next.revalidate` y `next.tags` en los fetch, y
  `revalidatePath` / `revalidateTag` para revalidación on-demand tras cambios en datos.
- **Variables de entorno.** Prefijo `NEXT_PUBLIC_` **solo** para valores que deben llegar al navegador; los
  secretos van sin prefijo y nunca se suben al control de versiones (`.env.local`).
- **Imágenes con `next/image`.** Evita `<img>`; declara los dominios remotos en `next.config.ts`
  (`images.remotePatterns`).
- **Tipado fuerte.** Evita `any`; prefiere tipos generados de Supabase para las consultas y sus relaciones.
- **Cliente de Supabase estable.** No recrees el cliente en cada render; usa una instancia estable siguiendo
  el patrón de `@supabase/ssr` (`lib/supabase/client.ts` en navegador, `lib/supabase/server.ts` en servidor).
- **Estados de carga y error.** Usa `loading.tsx` y `error.tsx`, y `Suspense` solo alrededor de operaciones
  realmente asíncronas.
- **Organización por funcionalidad.** Agrupa componentes y lógica relacionados; mantén las acciones de
  servidor juntas.
- **`proxy.ts` (middleware de Next 16).** Úsalo para sesión, redirecciones y protección de rutas; no pongas
  código entre `createServerClient` y `supabase.auth.getUser()` (patrón oficial de `@supabase/ssr` para
  middleware: refresca la sesión y persiste las cookies rotadas), y retorna siempre `supabaseResponse` para no
  romper cookies. Además, toda redirección del middleware debe copiar las cookies de `supabaseResponse` en la
  respuesta de redirect (si no, se pierde la rotación del refresh token y se produce el loop `/admin` ⇄ `/auth/login`).

---

## 5. Estrategia de refactor progresivo

Al tocar un archivo para una tarea, se puede migrar hacia **server-first** (Server Components + Server Actions)
y aplicar las buenas prácticas anteriores, **aunque implique una reescritura mayor** — pero siempre dentro de
un **plan aprobado (R1)**. Fuera de un plan aprobado, se respeta R3 (cambios quirúrgicos, sin reescribir
archivos que ya funcionan).

---

## 6. Flujo de trabajo esperado

En cada tarea:

1. **Entender** la petición y leer el código relacionado.
2. **Preguntar** las dudas necesarias (R2).
3. **Plantear un plan** y esperar aprobación (R1).
4. Hacer **cambios quirúrgicos** (R3), respetando convenciones (R5) e idioma (R4).
5. **Verificar** (lint / build / prueba manual).

---

## 7. Comandos útiles

Este proyecto usa **pnpm** siempre:

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm build
```

```bash
pnpm lint
```

---

## 8. Referencias

- [ARCHITECTURE-SECURITY-ANALYSIS.md](ARCHITECTURE-SECURITY-ANALYSIS.md) — análisis técnico y de arquitectura
  ampliado (contexto, no verdad absoluta; la última palabra siempre la tiene el desarrollador).
- Buenas prácticas de Next.js: <https://urianviera.com/nextjs/buenas-practicas-nextjs>

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
