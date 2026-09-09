# Progreso del Proyecto — FastCode MVP

**Última actualización:** 2026-09-08  
**Fase actual:** Desarrollo temprano del MVP  
**Estado:** Implementación inicial en progreso

---

## 1. Estado General del Proyecto

FastCode se encuentra en fase de desarrollo temprano. La infraestructura base del monorepo está configurada con el stack tecnológico definido, pero la mayoría de los requisitos funcionales del PRD aún no están implementados.

### Stack Tecnológico

**Backend:**
- NestJS 12.0.1 (framework Node.js)
- Prisma 6.19.3 (ORM)
- PostgreSQL (base de datos)
- Redis 6.0.0 (cache/colas)
- Socket.io 4.8.3 (WebSockets)
- JWT + Passport (autenticación)
- Vitest (testing)
- Oxlint (linting)

**Frontend:**
- React 19.2.8
- Vite 8.2.2 (build tool)
- TypeScript 6.0.2
- Tailwind CSS 4.3.3
- Zustand 5.0.15 (estado global)
- Socket.io-client 4.8.3
- Monaco Editor (editor de código)
- React Router DOM 7.18.3
- Axios (HTTP client)
- Oxlint (linting)

---

## 2. Estructura del Monorepo

```
FastCode/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── domain/      # Lógica de dominio (Clean Architecture)
│   │   │   └── elo/     # Calculadora Elo (implementado)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma # Modelo de datos completo
│   ├── test/
│   └── package.json
├── frontend/            # SPA React
│   ├── src/
│   │   ├── App.tsx      # Plantilla base (sin personalizar)
│   │   └── main.tsx
│   └── package.json
├── Docs/                # Documentación
│   ├── MvpRequerimientos.md
│   ├── DiseñoUI.md
│   ├── DiseñoStitch.md
│   ├── PropuestasFastCode.md
│   ├── ideas.txt
│   └── progreso.md (este archivo)
├── .env.example         # Variables de entorno
├── docker-compose.dev.yml
└── AGENTS.md            # Convenciones del proyecto
```

---

## 3. Estado de Implementación por Requisito

### RF1 - Gestión de Usuarios y Perfiles

| Requisito | Estado | Notas |
|-----------|--------|-------|
| RF1.1 Autenticación | ❌ No implementado | Modelo User existe en Prisma, sin endpoints |
| RF1.2 Puntuación inicial | ✅ Modelo definido | Elo inicial 1200 en schema.prisma:15 |
| RF1.3 Perfil mínimo | ❌ No implementado | Sin API ni UI |
| RF1.4 Historial/insignias | ⏸️ Post-MVP | Fuera del alcance inicial |

### RF2 - Banco de Problemas y Variantes Dinámicas

| Requisito | Estado | Notas |
|-----------|--------|-------|
| RF2.1 Catálogo y dificultad | ⚠️ Parcial | Modelo Problem con Difficulty enum, sin datos seed |
| RF2.2 Casos de prueba | ⚠️ Parcial | Modelo TestCase definido, sin lógica de evaluación |
| RF2.3 Enunciado dinámico | ❌ No implementado | variablePool en schema, sin generador de variantes |
| RF2.4 Tiempo límite | ⚠️ Parcial | timeLimitSeconds en modelo, sin validación |
| RF2.5 Insignias | ⏸️ Post-MVP | Fuera del alcance inicial |

### RF3 - Matchmaking y Emparejamiento

| Requisito | Estado | Notas |
|-----------|--------|-------|
| RF3.1 Cola de espera | ❌ No implementado | Requiere Redis + WebSockets |
| RF3.2 Rango de búsqueda | ❌ No implementado | Ventanas acumulativas no implementadas |
| RF3.3 Timeout sin bot | ❌ No implementado | Lógica de timeout pendiente |

### RF4 - Arena de Duelo 1v1

| Requisito | Estado | Notas |
|-----------|--------|-------|
| RF4.1 Ciclo de vida | ❌ No implementado | Enum MatchStatus existe, sin máquina de estados |
| RF4.2 Periodo de gracia | ❌ No implementado | gracePeriodsAt en schema, sin lógica |
| RF4.3 Editor integrado | ⚠️ Parcial | Monaco instalado en frontend, sin integrar |
| RF4.4 Envíos y progreso | ❌ No implementado | Modelo Submission existe, sin endpoint |
| RF4.5 Progreso visual | ❌ No implementado | Requiere WebSockets |
| RF4.6 Alertas de actividad | ⏸️ Post-MVP | Opcional según PRD |

### RF5 - Resultado, Victoria y Elo

| Requisito | Estado | Notas |
|-----------|--------|-------|
| RF5.1 Jerarquía de resolución | ❌ No implementado | Enum FinishReason existe, sin servicio |
| RF5.2 Reglas de conteo | ❌ No implementado | Sin lógica de validación |
| RF5.3 Actualización del Elo | ✅ Implementado | `elo.service.ts` con K=32, empate técnico sin cambio |
| RF5.4 Resultado visible | ❌ No implementado | Sin API ni UI |

### RF6 - Telemetría y Evidencia de Integridad

| Requisito | Estado | Notas |
|-----------|--------|-------|
| RF6.1 Principio | ⚠️ Parcial | Modelo IntegrityEvent existe, sin implementación |
| RF6.2 Niveles | ⚠️ Parcial | Enum IntegrityLevel (LOW/MODERATE/SEVERE) |
| RF6.3 Registro | ❌ No implementado | Sin captura de eventos ni políticas |

---

## 4. Base de Datos

### Schema Prisma Completo ✅

**Modelos definidos:**
- `User` (usuarios con Elo)
- `Problem` (problemas con dificultad y variantes)
- `TestCase` (casos públicos y ocultos)
- `Match` (partidas con ciclo de vida completo)
- `Submission` (envíos de código)
- `IntegrityEvent` (telemetría de integridad)

**Enums:**
- `Difficulty`: EASY, MEDIUM, HARD
- `MatchStatus`: IN_QUEUE, MATCH_FOUND, GRACE_PERIOD, ACTIVE, FINISHED
- `FinishReason`: COMPLETION, TIMEOUT, PARTIAL_PROGRESS, FEWER_FAILURES, TECHNICAL_DRAW, DISCONNECTION, INTEGRITY_VIOLATION
- `IntegrityLevel`: LOW, MODERATE, SEVERE

**Relaciones:**
- User ↔ Match (player1, player2)
- User ↔ Submission
- User ↔ IntegrityEvent
- Problem ↔ TestCase
- Problem ↔ Match
- Match ↔ Submission
- Match ↔ IntegrityEvent

**Convenciones:**
- IDs UUID
- snake_case en columnas (@map)
- Timestamps createdAt/updatedAt
- Índices implícitos en relaciones

---

## 5. Frontend

### Estado Actual

- ✅ Proyecto Vite + React inicializado
- ✅ Dependencias instaladas (Monaco, Zustand, Socket.io-client, Tailwind, etc.)
- ⚠️ Solo plantilla base por defecto (App.tsx sin personalizar)
- ❌ Sin estructura de features/core/shared
- ❌ Sin rutas configuradas
- ❌ Sin componentes UI
- ❌ Sin integración con backend

### Pendiente

- Configurar React Router con rutas principales
- Crear estructura de carpetas según convenciones (features/, core/, shared/)
- Implementar interceptores (auth, error, loading, traceId)
- Crear componentes base (botones, inputs, modales)
- Implementar pantallas: Auth, Perfil, Cola, Arena, Resultado
- Integrar Socket.io-client para tiempo real
- Configurar Zustand para estado global
- Integrar Monaco Editor en Arena
- Implementar diseño responsive mobile-first
- Aplicar tokens de diseño (spacing 4/8, tipografía, colores)
- Asegurar accesibilidad WCAG 2.1 AA

---

## 6. Backend

### Estado Actual

- ✅ NestJS configurado con módulos básicos
- ✅ Prisma schema completo
- ✅ Calculadora Elo implementada (`domain/elo/elo.service.ts`)
- ✅ Configuración de Vitest para tests
- ✅ Oxlint configurado
- ❌ Sin módulos de dominio (auth, users, problems, matches, etc.)
- ❌ Sin controllers ni endpoints
- ❌ Sin servicios de aplicación
- ❌ Sin adaptadores de infraestructura
- ❌ Sin middleware de autenticación
- ❌ Sin validación de DTOs
- ❌ Sin WebSockets implementados
- ❌ Sin integración con Redis
- ❌ Sin sandbox de ejecución de código

### Pendiente

- Implementar estructura de Clean Architecture (domain/application/adapters/infrastructure)
- Crear módulo Auth (registro, login, JWT)
- Crear módulo Users (perfil, Elo)
- Crear módulo Problems (CRUD, variantes dinámicas)
- Crear módulo Matches (cola, matchmaking, ciclo de vida)
- Crear módulo Submissions (envíos, evaluación)
- Crear módulo Integrity (telemetría, sanciones)
- Implementar WebSockets con Socket.io
- Configurar Redis para colas y cache
- Implementar sandbox de ejecución (aislamiento de código)
- Crear DTOs con class-validator
- Implementar guards y decorators
- Configurar logging con Pino
- Implementar interceptores (error, traceId)
- Crear seed data para problemas iniciales

---

## 7. Infraestructura

### Configurado ✅

- ✅ Docker Compose para desarrollo (`docker-compose.dev.yml`)
- ✅ Variables de entorno definidas (`.env.example`)
  - PostgreSQL
  - Redis
  - JWT (secret, expiraciones)
  - CORS
  - Sandbox (timeout, memoria, CPU)
- ✅ Configuración de linting (Oxlint)
- ✅ Configuración de testing (Vitest)
- ✅ Prettier para formateo

### Pendiente

- Configurar CI/CD (GitHub Actions)
- Configurar entorno de staging/producción
- Implementar health checks
- Configurar monitoreo y métricas
- Documentar despliegue
- Configurar backups de base de datos

---

## 8. Documentación

### Disponible ✅

- ✅ `MvpRequerimientos.md` - PRD completo v2.0
- ✅ `DiseñoUI.md` - Especificaciones UI/UX
- ✅ `DiseñoStitch.md` - Wireframes y diseño visual
- ✅ `AGENTS.md` - Convenciones del proyecto
- ✅ `.env.example` - Variables de entorno
- ✅ `progreso.md` - Este archivo

### Pendiente

- Documentación de API (OpenAPI/Swagger)
- Guía de instalación y setup
- Guía de contribución
- Documentación de arquitectura técnica
- Manual de despliegue

---

## 9. Próximos Pasos Prioritarios

### Fase 1: Fundación (Semanas 1-2)

1. **Backend - Autenticación**
   - Implementar módulo Auth con registro/login
   - Configurar JWT y guards
   - Crear endpoints `/api/v1/auth/register` y `/api/v1/auth/login`
   - Tests unitarios y de integración

2. **Backend - Usuarios**
   - Implementar módulo Users
   - Endpoint `/api/v1/users/profile`
   - Validar acceso propio (RF1.3)

3. **Frontend - Auth y Perfil**
   - Configurar React Router
   - Crear pantalla de autenticación (login/registro)
   - Crear pantalla de perfil mínimo
   - Integrar con API de auth

### Fase 2: Problemas y Variantes (Semanas 3-4)

4. **Backend - Problemas**
   - Implementar módulo Problems con CRUD
   - Endpoint `/api/v1/problems` (admin)
   - Generador de variantes dinámicas (RF2.3)
   - Seed data con 3 problemas (1 Fácil, 1 Medio, 1 Difícil)

5. **Backend - Casos de Prueba**
   - Implementar evaluación de casos
   - Sandbox de ejecución aislado
   - Endpoint de envío de soluciones

### Fase 3: Matchmaking (Semanas 5-6)

6. **Backend - Cola de Matchmaking**
   - Implementar cola con Redis
   - Lógica de ventanas acumulativas (RF3.2)
   - Timeout de 40 segundos (RF3.3)
   - WebSockets para notificaciones

7. **Frontend - Cola**
   - Pantalla de cola con cronómetro
   - Indicador de rango Elo activo
   - Estados: buscando, timeout, error

### Fase 4: Arena de Duelo (Semanas 7-9)

8. **Backend - Ciclo de Vida**
   - Máquina de estados de partida (RF4.1)
   - Periodo de gracia de 15 segundos (RF4.2)
   - Gestión de timeouts
   - WebSockets para progreso en vivo

9. **Backend - Evaluación**
   - Lógica de resolución jerárquica (RF5.1)
   - Actualización de Elo (RF5.3)
   - Manejo de empates técnicos

10. **Frontend - Arena**
    - Integrar Monaco Editor
    - Pantalla de duelo con dos columnas
    - Progreso visual del oponente
    - Cronómetro y fases de partida

### Fase 5: Integridad y Resultado (Semanas 10-11)

11. **Backend - Telemetría**
    - Captura de eventos de integridad (RF6.1)
    - Clasificación de niveles (RF6.2)
    - Políticas de sanción
    - Derrota automática por integridad

12. **Backend - Resultado**
    - Endpoint de resultado de partida
    - Historial de partidas
    - Actualización de Elo

13. **Frontend - Resultado**
    - Pantalla de resultado
    - Mostrar ganador, motivo, progreso, Elo
    - Estados de carga y error

### Fase 6: Pulido y Testing (Semana 12)

14. **Testing Integral**
    - Tests unitarios (cobertura >80%)
    - Tests de integración
    - Tests E2E de flujos principales
    - Tests de carga (100 partidas simultáneas)

15. **Accesibilidad y UX**
    - Auditoría WCAG 2.1 AA
    - Estados de interfaz (loading, error, empty, disabled, success)
    - Responsive mobile-first
    - Feedback visual y de teclado

16. **Seguridad**
    - Rate limiting en auth y envíos
    - Validación de inputs
    - CORS configurado
    - Cookies seguras (httpOnly, Secure, SameSite)

---

## 10. Métricas de Éxito (Objetivos del PRD)

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Tiempo mediano de emparejamiento | < 20 segundos | ❌ No medido |
| Partidas emparejadas en 40s | ≥ 70% | ❌ No medido |
| Partidas completadas sin abandono | ≥ 60% | ❌ No medido |
| Latencia p95 de eventos | < 150 ms | ❌ No medido |
| Envíos con resultado en < 5s | ≥ 95% | ❌ No medido |
| Partidas con error del evaluador | < 5% | ❌ No medido |
| Partidas con disputa de integridad | < 5% | ❌ No medido |

---

## 11. Resumen Ejecutivo

**Progreso general:** ~15% del MVP completado

**Lo que está listo:**
- ✅ Infraestructura base del monorepo
- ✅ Stack tecnológico configurado
- ✅ Modelo de datos completo (Prisma schema)
- ✅ Calculadora Elo con lógica de empate técnico

**Lo que falta:**
- ❌ Autenticación y gestión de usuarios
- ❌ API REST completa
- ❌ WebSockets para tiempo real
- ❌ Matchmaking y cola de búsqueda
- ❌ Arena de duelo funcional
- ❌ Evaluación de código y sandbox
- ❌ Telemetría de integridad
- ❌ Frontend funcional (solo plantilla base)

**Riesgos identificados:**
- El sandbox de ejecución de código es crítico y complejo
- La sincronización en tiempo real requiere testing exhaustivo
- La generación de variantes dinámicas debe validar que no altera la dificultad
- La telemetría puede generar falsos positivos si no se calibra bien

**Recomendación:** Priorizar la implementación de autenticación y flujo básico de partida (aunque sea sin evaluación de código) para validar la arquitectura antes de profundizar en features complejas.

---

**Nota:** Este documento debe actualizarse al completar cada fase o hito importante del proyecto.
