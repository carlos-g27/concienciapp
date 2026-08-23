# Concienciapp: arquitectura, recomendaciones y seguridad

## Propósito de este documento

Este archivo resume el contexto técnico de Concienciapp para que desarrolladores y otras IAs puedan entender rápidamente la aplicación, sus límites actuales, sus riesgos y la dirección recomendada.

**Fecha del análisis:** 2026-08-23  
**Tipo de análisis:** revisión estática del código del workspace  
**Estado:** no se modificó código como parte de este análisis.

# nota impotante escrita por el desarrollador: todo lo escrito en este archivo md no debe ser usado como una verdad absoluta, si no como un contexto para entender la funcionalidad de la aplicacion, la ultima palabra siempre la tendra el desarrollador y debera consultarle a este mismo cualquier cambio antes de editar el codigo.

## Resumen ejecutivo

Concienciapp es un monolito web construido con Next.js App Router y React, con Supabase como proveedor de autenticación, base de datos y almacenamiento. La aplicación tiene dos perfiles principales:

- Usuarios: dashboard, perfil, pilares físico, nutrición y mental, configuración y registros de peso.
- Administradores: dashboard de usuarios, catálogos de ejercicios y recetas, edición de rutinas y planes nutricionales, perfiles y configuración de pilares.

La organización actual funciona como un **monolito frontend modular**, pero la mayor parte de la lectura y escritura de datos vive en Client Components. La autorización visible de `/admin` está en `proxy.ts`, mientras que las mutaciones administrativas se ejecutan directamente desde el navegador contra Supabase.

La seguridad real depende de las políticas RLS y Storage de Supabase. Esas políticas no están presentes en el repositorio analizado, por lo que no se puede afirmar que el control de acceso sea seguro. La prioridad máxima es auditar RLS, impedir que un usuario cambie su propio rol y proteger todas las mutaciones administrativas en la base de datos o en un backend confiable.

## Stack y configuración

- Next.js App Router.
- React 19.
- TypeScript en modo `strict`.
- Supabase Auth, Postgres y Storage.
- `@supabase/ssr` para sesiones mediante cookies.
- Tailwind CSS 3 y CSS Modules.
- Componentes UI propios y componentes basados en Radix/shadcn.
- `next-themes` para tema claro/oscuro.
- `lucide-react` instalado, aunque todavía existen muchos SVG escritos manualmente.
- Alias TypeScript `@/*` apuntando a la raíz.
- `proxy.ts` para refresco de sesión y redirecciones.

### Dependencias relevantes

El `package.json` declara `next: "latest"`, mientras que el lockfile observado instala Next `16.2.7`. El lockfile también instala `eslint-config-next` `15.3.1`. Estas versiones deben alinearse para evitar reglas o diagnósticos incompatibles.

## Arquitectura actual

### App Router

Las rutas viven bajo `app/` y usan layouts por sección:

```text
app/
  layout.tsx
  page.tsx
  auth/
  dashboard/
  profile/
  settings/
  pilar-fisico/
  pilar-nutricion/
  pilar-mental/
  admin/
    layout.tsx
    page.tsx
    catalog/
    exercises/
    recipes/
    settings/
    users/[userId]/
```

Muchas páginas son wrappers muy pequeños que importan componentes grandes desde `components/`. Por ejemplo, `app/dashboard/page.tsx` delega a `components/user-component/dashboard-logic/dashboard.page`, y las páginas de pilares delegan a componentes equivalentes.

### Capas observadas

- `app/`: routing y layouts.
- `components/user-component/`: experiencia del usuario.
- `components/admin-component/`: experiencia administrativa.
- `components/ui/`: componentes visuales reutilizables.
- `hooks/`: Context Providers para perfil y configuración de pilares.
- `lib/supabase/`: clientes de Supabase para navegador y servidor.
- `proxy.ts`: sesión, redirección y comprobación superficial de rol.

No es actualmente Clean Architecture, Hexagonal Architecture ni una arquitectura por capas backend. Es un monolito modular con lógica de dominio embebida en componentes React.

### Flujo de autenticación

1. Supabase mantiene la sesión mediante cookies.
2. `lib/supabase/server.ts` crea un cliente server-side.
3. `lib/supabase/client.ts` crea un cliente browser-side.
4. `proxy.ts` ejecuta `auth.getClaims()` y refresca cookies.
5. Las rutas privadas redirigen a `/auth/login` si no hay sesión.
6. Las rutas `/admin` consultan `profiles.role` y redirigen a `/dashboard` si el rol no es `admin`.
7. El formulario de login vuelve a consultar el rol para elegir la ruta inicial.

### Flujo de datos

Actualmente los componentes cliente llaman directamente a Supabase:

- `profiles`: datos de usuarios.
- `user_routines`: ejercicios asignados.
- `user_routine_focus`: enfoque por día.
- `user_meals`: recetas asignadas.
- `user_meditations`: conteos de meditaciones.
- `weight_logs`: historial de pesos.
- `exercises`: catálogo de ejercicios.
- `recipes`: catálogo de recetas.
- `recipe_ingredients`: ingredientes.
- `pilar_settings`: activación de pilares.
- Storage `avatars`: imágenes de perfil.

## Hallazgos de seguridad

Los niveles son una priorización del riesgo potencial. Deben validarse contra la configuración real de Supabase.

### S1 - Crítico: la protección de `/admin` no protege por sí sola las mutaciones

**Ubicación:**

- `proxy.ts`.
- `components/admin-component/admin-fisico/admin-fisico.tsx`.
- `components/admin-component/admin-meals/admin-nutricion.tsx`.
- `components/admin-component/admin-user/admin-user-profile.tsx`.
- `components/admin-component/admin-settings/admin-settings.tsx`.

Las operaciones administrativas se ejecutan desde Client Components con el publishable key de Supabase. Un atacante puede invocar las mismas tablas directamente sin navegar primero por `proxy.ts`.

La aplicación solo es segura si las políticas RLS garantizan como mínimo:

- Un usuario normal solo puede leer y modificar sus propios datos.
- Un usuario normal no puede modificar `profiles.role`.
- Solo administradores pueden leer todos los perfiles.
- Solo administradores pueden escribir en catálogos.
- Solo administradores pueden insertar, borrar o modificar asignaciones de otros usuarios.
- Solo administradores pueden modificar `pilar_settings`.
- Las políticas no deben confiar únicamente en filtros enviados por el cliente como `.eq("user_id", userId)`.

**Acción:** añadir migraciones SQL al repositorio y probar explícitamente cada política con usuario normal, administrador y usuario no autenticado.

### S2 - Alto: posible escalada de privilegios mediante `profiles.role`

La aplicación decide si alguien es administrador leyendo `profiles.role` en `proxy.ts` y en el login. Si las políticas permiten a un usuario actualizar ese campo, puede cambiar su rol a `admin`.

**Acciones:**

- Prohibir que el usuario modifique `role` mediante RLS.
- Usar una función SQL `is_admin(auth.uid())` para las políticas administrativas.
- Cambiar roles únicamente desde una operación administrativa controlada.
- Considerar mantener el rol en `app_metadata` de Supabase Auth o sincronizarlo de manera segura.
- No confiar en el rol enviado por el navegador.

### S3 - Alto: redirección abierta en confirmación de autenticación

**Ubicación:** `app/auth/confirm/route.ts`.

El parámetro `next` se obtiene de la query string y se usa directamente en `redirect(next)`. Un enlace válido de la aplicación podría redirigir a un dominio externo y facilitar phishing.

También se concatena el mensaje de error de Supabase en una URL:

```ts
redirect(`/auth/error?error=${error?.message}`)
```

Esto puede exponer detalles en historial, logs o encabezados de referencia.

**Acciones:**

- Aceptar únicamente rutas internas que empiecen por `/` y no por `//`.
- O usar una lista blanca de destinos.
- Codificar parámetros con `encodeURIComponent`.
- Mostrar un código de error genérico en lugar del mensaje interno.

### S4 - Alto/medio: Storage de avatares público y validado solo en cliente

**Ubicación:**

- `components/user-component/profile-component/profile.tsx`.
- `components/admin-component/settings/admin-profile.tsx`.

Se comprueba en navegador que el archivo parezca una imagen y que pese menos de 2 MB. El nombre de extensión viene del usuario y se publica una URL de Storage.

Riesgos:

- El MIME del navegador no es una validación de contenido confiable.
- Se permiten tipos como SVG salvo que Storage los restrinja.
- Un archivo público puede ser reutilizado o servido fuera de la aplicación.
- La extensión y el nombre originales son controlables por el usuario.

**Acciones:**

- Preferir bucket privado y URLs firmadas.
- Permitir explícitamente JPEG, PNG y WebP.
- Validar tipo real, tamaño y contenido en backend o mediante una función de procesamiento.
- Generar nombres aleatorios.
- Definir políticas de Storage basadas en `auth.uid()`.
- Configurar correctamente `Content-Type` y `Content-Disposition`.

### S5 - Medio: URLs externas de vídeo sin lista blanca

**Ubicación:** `components/user-component/fisico-component/exercise-panel.tsx`.

La aplicación transforma URLs de YouTube y Vimeo, pero cualquier otra URL se trata como vídeo directo. Un administrador puede guardar la URL desde el formulario de ejercicios.

**Acciones:**

- Validar URL en servidor.
- Usar lista blanca de dominios.
- Preferir Supabase Storage o un proveedor controlado.
- Añadir políticas CSP adecuadas si se mantienen iframes externos.

### S6 - Medio: errores internos enviados al usuario

Hay varios `catch` que muestran `error.message` directamente. Los mensajes de Postgres o Supabase pueden revelar nombres de tablas, restricciones o detalles operativos.

**Acciones:** registrar el detalle solo en servidor y mostrar mensajes públicos genéricos. Añadir un identificador de error para soporte.

### S7 - Medio: no hay evidencia versionada de RLS, Storage ni pruebas de autorización

No se encontraron archivos SQL, migraciones, tests o specs en el workspace. Esto impide revisar controles que son esenciales para la seguridad de Supabase.

**Acciones:** incorporar `supabase/migrations/`, políticas, seed de pruebas y pruebas de autorización.

## Malas prácticas o riesgos de Next.js/React

### N1 - Clientes Supabase creados durante cada render

Muchos componentes hacen esto dentro del componente:

```ts
const supabase = createClient();
```

Ejemplos: `hooks/use-profile.tsx`, `hooks/use-pilar-settings.tsx`, `profile.tsx`, `pilar-fisico.tsx`, `admin-dashboard.tsx` y varios formularios administrativos.

Esto puede crear referencias nuevas en cada render y producir efectos repetidos o peticiones duplicadas cuando el cliente forma parte de dependencias.

**Recomendación:** crear un singleton estable para el cliente de navegador o usar una instancia estable mediante `useRef`/`useState`, siguiendo el patrón oficial de `@supabase/ssr`.

### N2 - Exceso de Client Components

Dashboard, administración, perfil y pilares cargan datos desde el navegador mediante `useEffect`. Esto aumenta JavaScript enviado al cliente y hace que la seguridad y autorización estén distribuidas entre muchos componentes.

**Recomendación:**

- Server Components para carga inicial y lecturas.
- Client Components solo para interacción.
- Server Actions o Route Handlers para mutaciones.
- Funciones server-side centralizadas para autorización.

### N3 - Lecturas y escrituras administrativas desde el navegador

Aunque RLS debe seguir siendo la barrera definitiva, la lógica administrativa debería tener una frontera server-side clara. Esto facilita validar el rol, validar inputs, agrupar operaciones y registrar auditoría.

### N4 - Operaciones destructivas no transaccionales

En rutinas y planes nutricionales se borra toda la asignación y después se insertan las nuevas filas. Si el segundo paso falla, el usuario queda sin datos.

**Recomendación:** función RPC transaccional o Server Action que llame a una operación atómica. Debe incluir validación de duplicados y límites.

### N5 - Uso de `any` en resultados de Supabase

Hay transformaciones con `any` en componentes de físico, nutrición y administración. Esto reduce la seguridad de tipos y oculta cambios de esquema.

**Recomendación:** generar tipos con Supabase CLI y tipar las relaciones devueltas por las consultas.

### N6 - `Suspense` usado como envoltorio general

Algunas páginas y el layout de admin envuelven Client Components en `Suspense`, pero no todos los contenidos tienen una carga suspendible real. Esto no reemplaza estados de carga ni error boundaries.

**Recomendación:** usar `loading.tsx`, `error.tsx` y Suspense alrededor de operaciones realmente asíncronas o segmentos concretos.

### N7 - Imágenes sin `next/image`

Hay varias etiquetas `<img>` en componentes de administración y nutrición. Se pierde optimización, control de tamaños y parte de la protección integrada de Next.js.

**Recomendación:** usar `next/image` cuando sea viable y configurar dominios remotos de forma estricta.

### N8 - Posible bug funcional tras cambiar contraseña

`components/update-password-form.tsx` redirige a `/protected`, pero no existe esa ruta en la estructura observada. El usuario puede recibir un 404 después de una operación exitosa.

**Corrección recomendada:** redirigir a `/dashboard` o a una ruta existente.

### N9 - Validación insuficiente de formularios

La validación está principalmente en el cliente. Faltan reglas uniformes para rangos numéricos, longitudes, URLs, arrays, duplicados y límites.

**Recomendación:** esquemas compartidos, por ejemplo con Zod, validados tanto en Server Actions/RPC como en la UI.

### N10 - Dependencias desalineadas

El lockfile muestra Next `16.2.7` y `eslint-config-next` `15.3.1`. Además, `package.json` usa `next: "latest"`, lo cual hace que futuras instalaciones puedan cambiar de versión inesperadamente.

**Recomendación:** fijar una versión compatible y actualizar Next y eslint-config-next conjuntamente.

## Arquitectura recomendada

Se recomienda evolucionar hacia un **monolito modular por dominios, server-first**, manteniendo Supabase y evitando microservicios por ahora.

### Estructura sugerida

```text
app/
  (public)/
  (auth)/
  (user)/
    dashboard/
    fisico/
    nutricion/
    mental/
    profile/
    settings/
  admin/
    users/
    catalog/
    settings/
  api/

features/
  auth/
  profile/
  physical/
  nutrition/
  mental/
  admin/

lib/
  supabase/
    browser.ts
    server.ts
    middleware.ts
  auth/
    require-user.ts
    require-admin.ts
  dal/
    profiles.ts
    routines.ts
    meals.ts
    catalog.ts
  validation/
    profile.ts
    exercise.ts
    recipe.ts

supabase/
  migrations/
  functions/
  seed.sql

tests/
  authorization/
  integration/
```

### Reglas de la arquitectura propuesta

1. Las páginas y layouts server-side realizan la carga inicial.
2. Los Client Components gestionan formularios, modales, tabs y estado efímero.
3. Todas las mutaciones importantes pasan por Server Actions, Route Handlers o RPC.
4. `requireUser()` comprueba sesión en servidor.
5. `requireAdmin()` comprueba sesión y rol en servidor.
6. RLS permanece activo como segunda barrera, no se sustituye por el backend.
7. Las entradas se validan con esquemas compartidos.
8. Supabase genera los tipos de base de datos.
9. Operaciones que afectan varias tablas son transaccionales.
10. Las acciones administrativas generan auditoría.
11. Los datos de usuarios se minimizan en consultas y respuestas.
12. Cada dominio mantiene sus consultas, tipos y reglas cerca de su feature.

### Por qué no microservicios todavía

El proyecto tiene un dominio relativamente compacto y usa un único proveedor backend. Microservicios añadirían despliegues, observabilidad, comunicación distribuida y complejidad operativa sin resolver los problemas principales. Primero conviene establecer fronteras claras dentro del monolito.

## Modelo de autorización recomendado

### Usuario normal

Puede:

- Leer su propio perfil.
- Actualizar campos personales permitidos.
- Leer su rutina, plan nutricional y meditaciones asignadas.
- Crear y borrar sus propios registros de peso.
- Leer configuración pública de pilares.

No puede:

- Leer perfiles de otros usuarios.
- Cambiar roles.
- Modificar catálogos.
- Modificar asignaciones de otros usuarios.
- Cambiar configuración global.

### Administrador

Puede, sujeto a políticas explícitas:

- Leer perfiles de usuarios.
- Editar campos permitidos de usuarios.
- Gestionar catálogo.
- Gestionar asignaciones.
- Gestionar configuración de pilares.
- Gestionar su propio perfil.

La autorización debe ser comprobada en tres niveles:

1. UI: ocultar acciones no permitidas.
2. Servidor: rechazar la operación si no corresponde al rol.
3. Base de datos/Storage: aplicar RLS y políticas independientemente del cliente.

## Plan de implementación priorizado

### Fase 0: comprobar la seguridad real

- Exportar esquema, migraciones y políticas de Supabase.
- Confirmar RLS en cada tabla.
- Probar lecturas y escrituras como usuario anónimo, usuario normal y admin.
- Revisar políticas del bucket `avatars`.
- Confirmar que el cliente nunca usa una service role key.

### Fase 1: cerrar brechas críticas

- Proteger `profiles.role`.
- Corregir el redirect `next`.
- Mover mutaciones administrativas críticas a RPC o Server Actions.
- Corregir `/protected`.
- Sanitizar mensajes de error.

### Fase 2: estabilizar Next.js y React

- Alinear versiones de Next y ESLint.
- Estabilizar el cliente browser de Supabase.
- Añadir `loading.tsx` y `error.tsx`.
- Reducir Client Components.
- Sustituir `any` por tipos generados.

### Fase 3: robustez de dominio

- Añadir validación con esquemas.
- Hacer transaccionales las asignaciones.
- Añadir restricciones SQL, índices y claves únicas.
- Añadir auditoría de acciones administrativas.
- Añadir paginación y filtros server-side al panel admin.

### Fase 4: pruebas y operación

- Tests de RLS.
- Tests de Server Actions/RPC.
- Tests de flujos de autenticación.
- Tests de subida de archivos.
- Escaneo de dependencias.
- Logs y monitorización de errores.
- Política de backups y recuperación.

## Checklist para futuras IAs

Antes de modificar la aplicación, comprobar:

- [ ] La operación afecta a usuario propio o a otro usuario.
- [ ] La autorización existe en servidor y en RLS.
- [ ] El componente puede ser Server Component.
- [ ] La mutación necesita transacción.
- [ ] La entrada tiene esquema y límites.
- [ ] La consulta tiene tipos de Supabase.
- [ ] Los errores mostrados no filtran detalles internos.
- [ ] Las URLs externas están validadas.
- [ ] Los archivos subidos tienen política de Storage.
- [ ] La ruta y el redirect existen.
- [ ] Hay una prueba que cubre el cambio.

## Limitaciones del análisis

- No se inspeccionaron políticas RLS, Storage ni funciones SQL porque no hay migraciones o archivos SQL en el workspace mostrado.
- No se ejecutaron `pnpm lint` ni `pnpm build`: ambas ejecuciones fueron omitidas por el entorno.
- No se realizó una prueba dinámica de penetración ni una revisión de configuración del proyecto Supabase.
- Los hallazgos de autorización son riesgos potenciales hasta verificar las políticas reales de Supabase, pero deben tratarse como prioritarios.

## Archivos clave de referencia

- `app/layout.tsx`: metadata, fuente, tema global.
- `proxy.ts`: sesión, redirecciones y protección visible de rutas.
- `lib/supabase/client.ts`: cliente browser-side.
- `lib/supabase/server.ts`: cliente server-side.
- `hooks/use-profile.tsx`: contexto y lectura del perfil.
- `hooks/use-pilar-settings.tsx`: contexto y lectura de configuración global.
- `app/auth/confirm/route.ts`: confirmación de OTP y redirección.
- `components/admin-component/admin-fisico/admin-fisico.tsx`: asignación de rutinas.
- `components/admin-component/admin-meals/admin-nutricion.tsx`: asignación de comidas.
- `components/user-component/fisico-component/exercise-panel.tsx`: registros de peso.
- `components/user-component/profile-component/profile.tsx`: perfil y avatar.
- `components/admin-component/settings/admin-profile.tsx`: perfil administrativo y avatar.

## Conclusión

La base tecnológica es adecuada para el producto y no requiere un cambio de framework. La mejora más importante no es reescribir la interfaz, sino establecer una frontera de seguridad y dominio más fuerte: RLS verificable, autorización server-side, mutaciones transaccionales, validación compartida y menos lógica de datos en Client Components.

La arquitectura objetivo debe seguir siendo un monolito Next.js + Supabase, pero organizado por dominios y con un enfoque server-first. Esta evolución reduce superficie de ataque, mejora rendimiento, hace el sistema más testeable y permite crecer sin introducir complejidad innecesaria.

# nota impotante: todo lo escrito en este archivo md no debe ser usado como una verdad absoluta, si no como un contexto para entender la funcionalidad de la aplicacion, la ultima palabra siempre la tendra el desarrollador y debera consultarle a este mismo cualquier cambio antes de editar el codigo.
