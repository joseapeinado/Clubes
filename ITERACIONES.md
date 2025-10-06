# Historial de Iteraciones

Este documento resume el progreso del proyecto por iteraciones. Se irá actualizando en cada milestone.

## Iteración 1: Fundación Básica (Completada)
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Estructura base del proyecto y configuración:
  - ESLint, Jest (unit/integration), Playwright (e2e desatendido: list/json)
  - PostCSS, Tailwind, tsconfig
  - Docker para desarrollo: `Dockerfile.dev` + `docker-compose.yml` (frontend expuesto en `http://localhost:3001`)
  - Scripts: `docker:init`, `docker:dev`, `docker:down`, `run-unit-tests`, `run-e2e-tests`, `run-all-tests`
- Home básica con UI y estado “Iteración 1: Completada”

## Iteración 2: Autenticación Simple (Completada)
- API Auth:
  - `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`
- Lógica de autenticación:
  - JWT en cookie httpOnly (`auth-token`)
  - `bcryptjs` para hashing
  - Conexión a PostgreSQL
- Frontend:
  - `AuthContext` con `login/register/logout` y chequeo de sesión vía `/api/auth/me`
  - Rutas: `/auth/login`, `/auth/register`, `/dashboard` (protegida con `ProtectedRoute`)
  - Middleware (`src/middleware.ts`): redirección desde `/` a `/auth/login` o `/dashboard` según sesión
- Tests:
  - Unitarios pasando (Jest)
  - E2E configurados desatendidos (en Alpine faltan dependencias de browsers: pendiente de una imagen base distinta para ejecución CI/CD)
- Entornos:
  - `dev.env` y `prod.env`

Milestone: `milestone-iteracion-2` (commit `ef093bae997d7685b967cf0bbae950056ae12034`).

## Iteración 3: Gestión de Disciplinas (En curso)
Objetivo: CRUD de disciplinas con categorías por género y edad, visible sólo para roles con permisos (p. ej., admin/coach).

Alcance previsto:
- Backend (API Routes):
  - Endpoints CRUD: `/api/disciplines` (GET/POST), `/api/disciplines/[id]` (GET/PATCH/DELETE)
  - Modelo: `disciplines` (nombre, descripción opcional, activo), `discipline_categories` (disciplina_id, género, rango_edad)
  - Validación y control de permisos por rol
- Base de datos:
  - Migraciones SQL para tablas de disciplinas y categorías
- Frontend:
  - Página `/disciplines` protegida
  - Listado, creación/edición/eliminación
  - Formulario con validación (nombre requerido, categorías)
- Tests:
  - Unitarios para componentes y utils
  - Integración para API
  - E2E (flujo principal) desatendidos
- Observaciones:
  - Mantener logs verbosos para depuración
  - Respetar RBAC (admin/coach pueden administrar; athlete sólo lectura si aplica)

Se actualizará este bloque a medida que avancemos en la implementación.
