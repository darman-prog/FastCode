# Guia de Desarrollo FastCode - Decisiones Finales

**Version:** 1.0
**Fecha:** 2026-09-08
**Audiencia:** Equipo de desarrollo junior
**Proposito:** Documento de referencia para entender la arquitectura, convenciones y flujo de trabajo del proyecto FastCode

---

## Tabla de Contenidos

1. [Introduccion al Proyecto](#1-introduccion-al-proyecto)
2. [Stack Tecnologico](#2-stack-tecnologico)
3. [Estructura del Monorepo](#3-estructura-del-monorepo)
4. [Arquitectura Backend - Clean Architecture](#4-arquitectura-backend---clean-architecture)
5. [Arquitectura Frontend - Por Features](#5-arquitectura-frontend---por-features)
6. [Convenciones de Codigo](#6-convenciones-de-codigo)
7. [Setup Local](#7-setup-local)
8. [Flujo de Trabajo](#8-flujo-de-trabajo)
9. [Proximos Pasos](#9-proximos-pasos)
10. [Recursos](#10-recursos)
11. [Glosario](#11-glosario)

---

## 1. Introduccion al Proyecto

### Que es FastCode?

FastCode es una plataforma de programacion competitiva 1v1 en tiempo real. Dos usuarios reciben el mismo problema con una variante dinamica, compiten durante un tiempo limitado y obtienen un resultado oficial basado en la evaluacion de sus soluciones.

### Objetivo del MVP

Validar estas hipotesis:
1. Los usuarios encuentran valor en resolver problemas contra un oponente real
2. La variante dinamica dificulta el uso de respuestas pre-generadas
3. Un resultado calculado de forma transparente genera experiencia competitiva confiable

### Documentacion Relacionada

- **PRD Completo:** [MvpRequerimientos.md](./MvpRequerimientos.md)
- **Diseno UI/UX:** [DisenoUI.md](./DiseñoUI.md)
- **Wireframes:** [DisenoStitch.md](./DiseñoStitch.md)
- **Progreso del Proyecto:** [progreso.md](./progreso.md)

---

## 2. Stack Tecnologico

### Backend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **NestJS** | 12.0.1 | Framework Node.js para construir APIs escalables |
| **Prisma** | 6.19.3 | ORM para base de datos |
| **PostgreSQL** | 16 | Base de datos relacional |
| **Redis** | 7 | Cache y colas de matchmaking |
| **Socket.io** | 4.8.3 | WebSockets para tiempo real |
| **JWT + Passport** | - | Autenticacion y autorizacion |
| **Vitest** | 4.1.2 | Testing unitario y de integracion |
| **Oxlint** | 1.58.0 | Linting de codigo |

### Frontend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **React** | 19.2.8 | Libreria UI para construir interfaces |
| **Vite** | 8.2.2 | Build tool y dev server |
| **TypeScript** | 6.0.2 | Tipado estatico |
| **Tailwind CSS** | 4.3.3 | Framework CSS utility-first |
| **Zustand** | 5.0.15 | Estado global ligero |
| **Socket.io-client** | 4.8.3 | Cliente WebSockets |
| **Monaco Editor** | 4.7.0 | Editor de codigo (el mismo que VSCode) |
| **React Router** | 7.18.3 | Routing de la aplicacion |
| **Axios** | 1.20.0 | Cliente HTTP |

### Por que React + Vite y NO Next.js?

| Factor | React + Vite | Next.js |
|--------|-------------|---------|
| **Tiempo real** | WebSocket nativo sin complicaciones | Requiere configuracion especial (App Router no ideal para WebSockets) |
| **Complejidad** | Minimalista, solo lo necesario | Overkill para MVP (SSR, routing complejo) |
| **Matchmaking/Arena** | SPA pura, estado en cliente con Zustand | SSR no aporta valor (todo es dinamico post-login) |
| **Build time** | Rapido (<2s HMR) | Mas lento |
| **Curva de aprendizaje** | Simple para juniors | Conceptos adicionales (Server Components, etc.) |
| **Socket.io integration** | Directo | Requiere bypass de API routes |
| **SEO** | No necesario (todo es post-login) | Aporta valor cuando hay contenido publico |

**Conclusion:** FastCode es una **SPA (Single Page Application) de tiempo real** donde todo es post-autenticacion y dinamico. Next.js aporta valor cuando necesitas SEO, pero aqui no lo necesitamos.

### Herramientas de Desarrollo

- **Docker Compose:** Para levantar PostgreSQL y Redis localmente
- **Prettier:** Formateo automatico de codigo
- **Husky + lint-staged:** Pre-commit hooks (pendiente de configurar)

---

## 3. Estructura del Monorepo

### Diagrama de Carpetas

```
FastCode/
|
|-- backend/                    # API NestJS (Clean Architecture)
|   |-- src/
|   |   |-- domain/            # Capa 1: Reglas de negocio puras
|   |   |-- application/       # Capa 2: Casos de uso
|   |   |-- adapters/          # Capa 3: Controllers, DTOs
|   |   +-- infrastructure/    # Capa 4: Prisma, Redis, etc.
|   |-- prisma/
|   |   +-- schema.prisma      # Modelo de datos
|   |-- test/                  # Tests E2E
|   +-- package.json
|
|-- frontend/                   # SPA React + Vite
|   |-- src/
|   |   |-- features/          # Logica por feature (auth, arena, etc.)
|   |   |-- core/              # Singletons (axios, socket, config)
|   |   +-- shared/            # Componentes reutilizables
|   +-- package.json
|
|-- Docs/                       # Documentacion
|   |-- MvpRequerimientos.md
|   |-- DisenoUI.md
|   |-- DisenoStitch.md
|   |-- progreso.md
|   +-- DecisionesFinales.md   # Este documento
|
|-- .env.example                # Variables de entorno
|-- docker-compose.dev.yml      # Docker para desarrollo
+-- AGENTS.md                   # Convenciones del proyecto
```

### Responsabilidades de Cada Paquete

**Backend:**
- `domain/`: Entidades, value objects, interfaces de repositorios (logica pura)
- `application/`: Casos de uso que orquestan el dominio
- `adapters/`: Controllers HTTP, WebSockets, DTOs, mapeadores
- `infrastructure/`: Implementaciones de Prisma, Redis, servicios externos

**Frontend:**
- `features/`: Logica especifica de cada feature (auth, matchmaking, arena, etc.)
- `core/`: Configuracion global, interceptores, instancias singleton
- `shared/`: Componentes UI reutilizables (Button, Input, Modal)

---

## 4. Arquitectura Backend - Clean Architecture

### Analogia para Entender Clean Architecture

Imagina una **cebolla** con capas:

```
+-------------------------------------------------+
|  infrastructure (capa externa)                  |  <- Prisma, Redis, APIs externas
|  +-------------------------------------------+  |
|  |  adapters (capa media-externa)            |  |  <- Controllers, DTOs, WebSockets
|  |  +-------------------------------------+  |  |
|  |  |  application (capa media)           |  |  |  <- Casos de uso
|  |  |  +-------------------------------+  |  |  |
|  |  |  |  domain (capa interna)        |  |  |  |  <- Reglas de negocio puras
|  |  |  |                               |  |  |  |
|  |  |  +-------------------------------+  |  |  |
|  |  +-------------------------------------+  |  |
|  +-------------------------------------------+  |
+-------------------------------------------------+
```

**Regla de oro:** Las dependencias apuntan **hacia adentro**. La capa interna (domain) NO conoce las capas externas.

### Las 4 Capas Explicadas

#### Capa 1: `domain/` (Reglas de Negocio Puras)

**Que es?** El corazon del sistema. Contiene la logica de negocio pura, sin dependencias externas.

**Que contiene?**
- **Entidades:** Objetos con identidad y ciclo de vida (User, Match, Problem)
- **Value Objects:** Objetos inmutables que representan conceptos (Email, Elo, MatchStatus)
- **Interfaces de repositorios:** Contratos para persistir datos (sin implementacion)
- **Servicios de dominio:** Logica de negocio compleja (calculadora de Elo)

**Por que esta aqui?** Si manana cambias de PostgreSQL a MongoDB, o de NestJS a Express, el dominio NO cambia.

#### Capa 2: `application/` (Casos de Uso)

**Que es?** Orquesta el dominio para resolver casos de uso especificos. No contiene logica de negocio, solo coordina.

**Que contiene?**
- **Comandos:** Acciones que modifican estado (RegisterUser, CreateMatch)
- **Queries:** Acciones que solo leen datos (GetUserProfile)
- **Handlers:** Implementaciones de comandos/queries que usan repositorios

**Por que esta aqui?** Separa la intencion (que quiero hacer) de la implementacion (como lo hago).

#### Capa 3: `adapters/` (Controllers, DTOs)

**Que es?** Adaptadores que conectan el mundo externo (HTTP, WebSockets) con el dominio.

**Que contiene?**
- **Controllers:** Manejan requests HTTP
- **DTOs:** Data Transfer Objects (validacion de inputs)
- **Mapeadores:** Convierten entre DTOs y entidades de dominio
- **Gateways:** Manejan WebSockets

**Por que esta aqui?** Aisla el dominio de detalles tecnicos como HTTP, JSON, validacion, etc.

#### Capa 4: `infrastructure/` (Prisma, Redis, etc.)

**Que es?** Implementaciones concretas de las interfaces definidas en el dominio.

**Que contiene?**
- **Repositorios Prisma:** Implementan las interfaces del dominio
- **Servicios Redis:** Cache y colas
- **Servicios externos:** APIs de terceros
- **Configuracion:** Variables de entorno, conexiones

**Por que esta aqui?** Es la unica capa que conoce detalles tecnicos como SQL, Redis, etc.

### Dependency Rule (Regla de Dependencia)

```
infrastructure
    |
    v depende de
adapters
    |
    v depende de
application
    |
    v depende de
domain (NO depende de nada)
```

**Regla:** Las capas externas dependen de las internas, NUNCA al reves.

### Por que Clean Architecture y NO Arquitectura Modular?

| Criterio | Clean Architecture | Arquitectura Modular |
|----------|-------------------|---------------------|
| **Separacion de responsabilidades** | Muy clara: dominio puro sin dependencias externas | Mezcla logica de negocio con framework en services |
| **Testabilidad** | Excelente: dominio aislado, tests sin mocks de framework | Requiere mocks de NestJS/DI para tests de services |
| **Escalabilidad** | Crece bien con dominios complejos | Puede volverse caotico con +10 modulos |
| **Acoplamiento** | Bajo: dominio no conoce framework | Alto: services dependen de NestJS |
| **Reutilizacion** | Dominio portable a otros frameworks | Ligado a NestJS |
| **Curva de aprendizaje** | Requiere entender Clean Architecture | Familiar para devs de NestJS |
| **Velocidad inicial** | Mas lento al inicio (mas archivos) | Rapido para empezar |
| **Adecuacion para FastCode** | **Ideal**: dominios claros (users, matches, problems, elo) | Aceptable para MVP simple |

**Ejemplo de Arquitectura Modular (lo que NO usamos):**
```
src/
|-- users/
|   |-- users.module.ts
|   |-- users.controller.ts      # Mezcla HTTP + logica
|   |-- users.service.ts         # Mezcla dominio + Prisma + Redis
|   +-- dto/
|       +-- create-user.dto.ts
```

**Problema:** En `users.service.ts` mezclas logica de negocio, persistencia, cache y validacion. Esto hace dificil testear y mantener.

### Ejemplo Completo: Dominio `users`

#### Estructura de Archivos

```
backend/src/
|
|-- domain/
|   +-- users/
|       |-- entities/
|       |   +-- user.entity.ts              # Entidad User
|       |-- value-objects/
|       |   |-- email.vo.ts                 # Value Object Email
|       |   +-- elo.vo.ts                   # Value Object Elo
|       |-- repositories/
|       |   +-- user.repository.ts          # Interface
|       |-- services/
|       |   +-- password-hasher.ts          # Interface
|       +-- errors/
|           +-- user.errors.ts              # Errores de dominio
|
|-- application/
|   +-- users/
|       |-- commands/
|       |   +-- register-user.command.ts    # Comando
|       +-- handlers/
|           +-- register-user.handler.ts    # Handler
|
|-- adapters/
|   +-- http/
|       |-- controllers/
|       |   +-- auth.controller.ts          # Controller
|       +-- dto/
|           +-- register-user.dto.ts        # DTO
|
+-- infrastructure/
    +-- persistence/
        |-- prisma.service.ts               # Servicio Prisma
        +-- prisma-user.repository.ts       # Implementacion
```

#### Archivos con Explicaciones

**1. Value Object: Email**
```typescript
// domain/users/value-objects/email.vo.ts

/**
 * Que es? Un Value Object que representa un email valido.
 * Para que sirve? Encapsula la validacion del email.
 * En que capa esta? Domain (capa interna).
 * Por que esta aqui? La validacion del email es una regla de negocio.
 */

export class Email {
  constructor(public readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Email invalido');
    }
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

**2. Value Object: Elo**
```typescript
// domain/users/value-objects/elo.vo.ts

/**
 * Que es? Un Value Object que representa la puntuacion Elo de un usuario.
 * Para que sirve? Encapsula las reglas del Elo (no negativo, entero).
 * En que capa esta? Domain (capa interna).
 * Por que esta aqui? Las reglas del Elo son logica de negocio pura.
 */

export class Elo {
  constructor(public readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new Error('El Elo debe ser un numero entero');
    }
    if (value < 0) {
      throw new Error('El Elo no puede ser negativo');
    }
  }

  // Elo inicial segun PRD RF1.2
  static initial(): Elo {
    return new Elo(1200);
  }
}
```

**3. Entidad: User**
```typescript
// domain/users/entities/user.entity.ts

/**
 * Que es? La entidad User representa a un usuario del sistema.
 * Para que sirve? Contiene la logica de negocio del usuario.
 * En que capa esta? Domain (capa interna).
 * Por que esta aqui? Es el corazon del dominio de usuarios.
 */

import { Email } from '../value-objects/email.vo';
import { Elo } from '../value-objects/elo.vo';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly username: string,
    public readonly elo: Elo,
    public readonly createdAt: Date,
  ) {}

  // Factory method para crear un nuevo usuario
  static create(id: string, email: string, username: string): User {
    return new User(
      id,
      new Email(email),
      username,
      Elo.initial(),  // Elo inicial 1200 segun PRD
      new Date(),
    );
  }

  // Regla de negocio: Actualizar Elo
  public withElo(newElo: number): User {
    return new User(
      this.id,
      this.email,
      this.username,
      new Elo(newElo),
      this.createdAt,
    );
  }
}
```

**4. Interface de Repositorio**
```typescript
// domain/users/repositories/user.repository.ts

/**
 * Que es? Un contrato (interface) para persistir usuarios.
 * Para que sirve? Define operaciones sin especificar como se implementan.
 * En que capa esta? Domain (capa interna).
 * Por que esta aqui? El dominio define que operaciones necesita, no como se implementan.
 */

import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
```

**5. Error de Dominio**
```typescript
// domain/users/errors/user.errors.ts

/**
 * Que es? Errores especificos del dominio de usuarios.
 * Para que sirve? Representan errores de negocio (no tecnicos).
 * En que capa esta? Domain (capa interna).
 * Por que esta aqui? Son errores de negocio, no de infraestructura.
 */

export class UserAlreadyExistsError extends Error {
  constructor() {
    super('El usuario ya existe');
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciales invalidas');
    this.name = 'InvalidCredentialsError';
  }
}
```

**6. Comando**
```typescript
// application/users/commands/register-user.command.ts

/**
 * Que es? Un comando que representa la intencion de registrar un usuario.
 * Para que sirve? Transporta los datos necesarios para el caso de uso.
 * En que capa esta? Application (capa media).
 * Por que esta aqui? Separa la intencion de la implementacion.
 */

export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly username: string,
  ) {}
}
```

**7. Handler del Comando**
```typescript
// application/users/handlers/register-user.handler.ts

/**
 * Que es? El handler que ejecuta el caso de uso de registrar usuario.
 * Para que sirve? Orquesta el dominio para resolver el caso de uso.
 * En que capa esta? Application (capa media).
 * Por que esta aqui? Coordina el dominio sin conocer detalles tecnicos.
 */

import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { RegisterUserCommand } from '../commands/register-user.command';
import { User } from '../../../domain/users/entities/user.entity';
import { Email } from '../../../domain/users/value-objects/email.vo';
import { UserRepository } from '../../../domain/users/repositories/user.repository';
import { UserAlreadyExistsError } from '../../../domain/users/errors/user.errors';

@Injectable()
export class RegisterUserHandler {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    // 1. Verificar que el usuario no existe
    const existingUser = await this.userRepository.findByEmail(
      new Email(command.email),
    );
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    // 2. Crear entidad User (dominio)
    const user = User.create(uuid(), command.email, command.username);

    // 3. Persistir
    return await this.userRepository.save(user);
  }
}
```

**8. DTO**
```typescript
// adapters/http/dto/register-user.dto.ts

/**
 * Que es? Data Transfer Object para validar el input del cliente.
 * Para que sirve? Valida que los datos enviados sean correctos.
 * En que capa esta? Adapters (capa media-externa).
 * Por que esta aqui? La validacion es responsabilidad del adaptador HTTP.
 */

import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'El email debe ser valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El username no puede tener mas de 20 caracteres' })
  username: string;
}
```

**9. Controller**
```typescript
// adapters/http/controllers/auth.controller.ts

/**
 * Que es? Controller HTTP para autenticacion.
 * Para que sirve? Maneja requests HTTP y las convierte en comandos.
 * En que capa esta? Adapters (capa media-externa).
 * Por que esta aqui? Adapta HTTP al dominio.
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { RegisterUserCommand } from '../../../application/users/commands/register-user.command';
import { RegisterUserHandler } from '../../../application/users/handlers/register-user.handler';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly registerUserHandler: RegisterUserHandler,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    // 1. DTO ya valido los datos (class-validator)
    // 2. Convertir DTO a Command
    const command = new RegisterUserCommand(
      dto.email,
      dto.password,
      dto.username,
    );

    // 3. Ejecutar caso de uso
    const user = await this.registerUserHandler.execute(command);

    // 4. Devolver respuesta
    return {
      data: {
        id: user.id,
        email: user.email.value,
        username: user.username,
        elo: user.elo.value,
      },
    };
  }
}
```

**10. Implementacion del Repositorio**
```typescript
// infrastructure/persistence/prisma-user.repository.ts

/**
 * Que es? Implementacion del repositorio usando Prisma.
 * Para que sirve? Persiste usuarios en PostgreSQL.
 * En que capa esta? Infrastructure (capa externa).
 * Por que esta aqui? Es la unica capa que conoce Prisma/SQL.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserRepository } from '../../domain/users/repositories/user.repository';
import { User } from '../../domain/users/entities/user.entity';
import { Email } from '../../domain/users/value-objects/email.vo';
import { Elo } from '../../domain/users/value-objects/elo.vo';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: Email): Promise<User | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!userRecord) return null;

    return new User(
      userRecord.id,
      new Email(userRecord.email),
      userRecord.username,
      new Elo(userRecord.elo),
      userRecord.createdAt,
    );
  }

  async save(user: User): Promise<User> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email.value,
        username: user.username,
        elo: user.elo.value,
      },
    });

    return user;
  }
}
```

### Resumen Visual del Flujo

```
+-------------------------------------------------------------+
| 1. Cliente HTTP envia POST /api/v1/auth/register            |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
| 2. AuthController recibe el request                         |
|    - Valida DTO (class-validator)                           |
|    - Convierte DTO -> Command                               |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
| 3. RegisterUserHandler ejecuta el caso de uso               |
|    - Usa interfaces del dominio (UserRepository)            |
|    - Crea entidad User (dominio)                            |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
| 4. PrismaUserRepository persiste en PostgreSQL              |
|    - Convierte entidad User -> modelo Prisma                |
|    - Ejecuta SQL                                            |
+-------------------------------------------------------------+
                            |
                            v
+-------------------------------------------------------------+
| 5. AuthController devuelve respuesta HTTP                   |
|    - Convierte entidad User -> JSON                         |
+-------------------------------------------------------------+
```

---

## 5. Arquitectura Frontend - Por Features

### Analogia para Entender Arquitectura por Features

Imagina un **supermercado**:

```
+-------------------------------------------------+
|  Supermercado (Frontend)                        |
|                                                 |
|  +----------+  +----------+  +----------+      |
|  | Fruteria |  | Panaderia|  | Carnic.  |      |
|  | (feature)|  | (feature)|  | (feature)|      |
|  |          |  |          |  |          |      |
|  | - Manzanas| | - Pan   |  | - Pollo  |      |
|  | - Peras  |  | - Croissant|| - Carne  |      |
|  +----------+  +----------+  +----------+      |
|                                                 |
|  +-----------------------------------------+   |
|  | Mostrador de cobro (core)               |   |
|  | - Caja unica para todo el super         |   |
|  +-----------------------------------------+   |
|                                                 |
|  +-----------------------------------------+   |
|  | Bolsas reutilizables (shared)           |   |
|  | - Las usan todas las secciones          |   |
|  +-----------------------------------------+   |
+-------------------------------------------------+
```

**Regla de oro:** Cada feature es autocontenida. La fruteria no depende de la carniceria.

### Las 3 Capas Explicadas

#### Capa 1: `features/` (Logica por Feature)

**Que es?** Cada feature contiene TODO lo necesario para funcionar: componentes, hooks, services, stores, types.

**Que contiene?**
- `components/`: Componentes React especificos de la feature
- `hooks/`: Custom hooks para logica reutilizable
- `services/`: Llamadas HTTP/WebSocket
- `stores/`: Estado global con Zustand (si es necesario)
- `types/`: Tipos TypeScript especificos
- `index.ts`: Public API (que exportar)

**Por que esta aqui?** Si manana eliminas la feature de matchmaking, solo borras esa carpeta.

#### Capa 2: `core/` (Singletons y Configuracion)

**Que es?** Servicios globales que se instancian una sola vez y se comparten en toda la app.

**Que contiene?**
- `api/`: Instancia de Axios con interceptores
- `ws/`: Instancia de Socket.io
- `config/`: Configuracion global (variables de entorno)
- `router/`: Configuracion de React Router

**Por que esta aqui?** Son servicios transversales que todas las features necesitan.

#### Capa 3: `shared/` (Componentes Reutilizables)

**Que es?** Componentes UI genericos sin logica de negocio.

**Que contiene?**
- `components/`: Button, Input, Modal, etc.
- `hooks/`: useTimer, useDebounce, etc.
- `utils/`: Funciones utilitarias (cn, formatDate, etc.)
- `types/`: Tipos comunes

**Por que esta aqui?** Son componentes que NO tienen logica de negocio especifica.

### Por que Por Features y NO Por Tipos Tecnicos?

| Criterio | Por Features | Por Tipos Tecnicos |
|----------|-------------|-------------------|
| **Co-localizacion** | Todo lo de un dominio en un solo lugar | Hay que buscar en multiples carpetas |
| **Escalabilidad** | Crece bien con mas features | Carpetas gigantes con +20 componentes |
| **Lazy loading** | Facil hacer load por feature | Mas dificil identificar boundaries |
| **Ownership** | Equipos pueden owning features | Todos tocan todo |
| **Testing** | Tests co-localizados con feature | Tests dispersos |
| **Refactoring** | Cambios contenidos en feature | Efectos cascada mas comunes |
| **Curva de aprendizaje** | Requiere entender boundaries | Estructura familiar |
| **Adecuacion para FastCode** | **Ideal**: dominios claros (auth, queue, arena, result) | Aceptable para MVP pequeno |

**Ejemplo de Por Tipos Tecnicos (lo que NO usamos):**
```
src/
|-- components/      # Todos los componentes de todas las features
|-- services/        # Todos los services de todas las features
|-- hooks/           # Todos los hooks de todas las features
+-- types/           # Todos los types de todas las features
```

**Problema:** Cuando la app crece, tienes 50 componentes en `components/` y no sabes cual pertenece a que feature.

### Ejemplo Completo: Feature `auth`

#### Estructura de Archivos

```
frontend/src/
|
|-- features/
|   +-- auth/
|       |-- components/
|       |   |-- login-form.tsx              # Componente de login
|       |   +-- register-form.tsx           # Componente de registro
|       |-- hooks/
|       |   +-- use-auth.ts                 # Hook para autenticacion
|       |-- services/
|       |   +-- auth.service.ts             # Llamadas HTTP
|       |-- stores/
|       |   +-- auth.store.ts               # Estado global (Zustand)
|       |-- types/
|       |   +-- auth.types.ts               # Tipos TypeScript
|       +-- index.ts                        # Public API
|
|-- core/
|   +-- api/
|       +-- axios.instance.ts               # Instancia de Axios
|
+-- shared/
    |-- components/
    |   |-- button.tsx                      # Componente reutilizable
    |   +-- input.tsx                       # Componente reutilizable
    +-- utils/
        +-- cn.ts                           # Utilidad para clases
```

#### Archivos con Explicaciones

**1. Tipos**
```typescript
// features/auth/types/auth.types.ts

/**
 * Que es? Tipos TypeScript especificos de la feature auth.
 * Para que sirve? Define la estructura de datos de autenticacion.
 * En que parte esta? features/auth/types/
 * Por que esta aqui? Son tipos especificos de auth, no globales.
 */

export interface User {
  id: string;
  email: string;
  username: string;
  elo: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}
```

**2. Service**
```typescript
// features/auth/services/auth.service.ts

/**
 * Que es? Servicio que hace llamadas HTTP relacionadas con auth.
 * Para que sirve? Aisla las llamadas HTTP de los componentes.
 * En que parte esta? features/auth/services/
 * Por que esta aqui? Es especifico de auth, no de otras features.
 */

import { api } from '../../../core/api/axios.instance';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout');
  },
};
```

**3. Store (Zustand)**
```typescript
// features/auth/stores/auth.store.ts

/**
 * Que es? Estado global de autenticacion con Zustand.
 * Para que sirve? Maneja el estado del usuario autenticado.
 * En que parte esta? features/auth/stores/
 * Por que esta aqui? Es estado especifico de auth.
 */

import { create } from 'zustand';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),

  setUser: (user) => set({ user }),

  setToken: (token) => {
    localStorage.setItem('auth_token', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

**4. Hook**
```typescript
// features/auth/hooks/use-auth.ts

/**
 * Que es? Custom hook que encapsula la logica de autenticacion.
 * Para que sirve? Reutiliza logica en multiples componentes.
 * En que parte esta? features/auth/hooks/
 * Por que esta aqui? Es logica especifica de auth.
 */

import { useState } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser, setToken, logout: logoutStore } = useAuthStore();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      setToken(response.data.token);
    } catch (err) {
      setError('Credenciales invalidas');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register({ email, password, username });
      setUser(response.data.user);
      setToken(response.data.token);
    } catch (err) {
      setError('Error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      logoutStore();
    }
  };

  return { login, register, logout, isLoading, error };
}
```

**5. Componente**
```tsx
// features/auth/components/login-form.tsx

/**
 * Que es? Componente de formulario de login.
 * Para que sirve? UI para que el usuario inicie sesion.
 * En que parte esta? features/auth/components/
 * Por que esta aqui? Es un componente especifico de auth.
 */

import { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Button } from '../../../shared/components/button';
import { Input } from '../../../shared/components/input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electronico"
        required
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contrasena"
        required
      />
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Iniciando sesion...' : 'Iniciar sesion'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
```

**6. Public API**
```typescript
// features/auth/index.ts

/**
 * Que es? Public API de la feature auth.
 * Para que sirve? Define que se puede importar desde fuera de la feature.
 * En que parte esta? features/auth/
 * Por que esta aqui? Controla el acceso a la feature.
 */

// Solo exporta lo necesario
export { LoginForm } from './components/login-form';
export { RegisterForm } from './components/register-form';
export { useAuth } from './hooks/use-auth';
export type { User } from './types/auth.types';

// NO exporta internals
// export { authService } from './services/auth.service';  // No exportar
// export { useAuthStore } from './stores/auth.store';     // No exportar
```

### Reglas de Importacion

**LO QUE SI:**
```typescript
// Desde una feature, puedes importar de:
import { Button } from '../../../shared/components/button';  // shared
import { api } from '../../../core/api/axios.instance';      // core
import { useAuth } from '../hooks/use-auth';                 // misma feature
```

**LO QUE NO:**
```typescript
// Desde una feature, NO puedes importar de otra feature:
import { useMatch } from '../../arena/hooks/use-match';      // arena
import { QueueScreen } from '../../matchmaking/components/queue-screen'; // matchmaking
```

**Por que?** Las features deben ser independientes. Si necesitas compartir logica, extraela a `shared/` o `core/`.

---

## 6. Convenciones de Codigo

### Naming Conventions

| Tipo | Convencion | Ejemplo |
|------|-----------|---------|
| **Archivos (Backend)** | kebab-case | `user.entity.ts`, `auth.controller.ts` |
| **Archivos (Frontend)** | kebab-case | `login-form.tsx`, `use-auth.ts` |
| **Clases** | PascalCase | `UserEntity`, `AuthController` |
| **Interfaces** | PascalCase | `UserRepository`, `PasswordHasher` |
| **Funciones** | camelCase | `calculateElo`, `findByEmail` |
| **Variables** | camelCase | `currentUser`, `matchStatus` |
| **Constantes** | UPPER_SNAKE_CASE | `INITIAL_ELO`, `K_FACTOR` |
| **Enums** | PascalCase (valores) | `MatchStatus.ACTIVE` |
| **Componentes React** | PascalCase | `LoginForm`, `ArenaScreen` |
| **Hooks React** | camelCase con `use` | `useAuth`, `useMatch` |

### Estructura de API REST

**Base URL:** `/api/v1`

**Endpoints:**

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Registrar usuario |
| POST | `/api/v1/auth/login` | Iniciar sesion |
| POST | `/api/v1/auth/logout` | Cerrar sesion |
| GET | `/api/v1/users/profile` | Obtener perfil propio |
| GET | `/api/v1/users/:id` | Obtener perfil publico |
| GET | `/api/v1/problems` | Listar problemas |
| POST | `/api/v1/matches/queue` | Entrar a cola de matchmaking |
| DELETE | `/api/v1/matches/queue` | Salir de cola |
| GET | `/api/v1/matches/:id` | Obtener estado de partida |
| POST | `/api/v1/matches/:id/submissions` | Enviar solucion |

**Estructura de Respuesta Exitosa:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "player1",
    "elo": 1200
  }
}
```

**Estructura de Respuesta de Error:**
```json
{
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "El correo ya esta registrado",
    "details": {}
  },
  "meta": {
    "traceId": "abc-123-def"
  }
}
```

### Codigos HTTP

| Codigo | Significado | Cuando usar |
|--------|-------------|-------------|
| 200 | OK | GET exitoso, PUT exitoso |
| 201 | Created | POST exitoso (recurso creado) |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Validacion de input fallida |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | No autorizado |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto (ej: usuario ya existe) |
| 422 | Unprocessable | Input valido pero semantica invalida |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Error | Error inesperado del servidor |

### Manejo de Errores

**Backend - Custom Exceptions:**
```typescript
// domain/shared/errors/domain-error.ts
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

// domain/users/errors/user.errors.ts
export class UserAlreadyExistsError extends DomainError {
  constructor() {
    super('USER_ALREADY_EXISTS', 'El correo ya esta registrado', 409);
  }
}
```

**Frontend - Error Types:**
```typescript
// core/api/api-error.ts
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
}

// features/auth/hooks/use-auth.ts
const login = async (email: string, password: string) => {
  try {
    await authService.login({ email, password });
  } catch (err) {
    const apiError = err as ApiError;
    if (apiError.code === 'USER_ALREADY_EXISTS') {
      setError('El correo ya esta registrado');
    } else {
      setError('Error inesperado. Intenta de nuevo.');
    }
  }
};
```

### Validacion de Inputs

Usamos **class-validator** en el backend (ya instalado).

```typescript
// adapters/http/dto/register-user.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'El email debe ser valido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El username no puede tener mas de 20 caracteres' })
  username: string;
}
```

### WebSockets (Socket.io)

**Backend - Gateway:**
```typescript
// adapters/ws/gateways/match.gateway.ts
@WebSocketGateway()
export class MatchGateway {
  @SubscribeMessage('match:submission')
  handleSubmission(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubmissionDto,
  ) {
    // Procesar envio
  }
}
```

**Frontend - Hook:**
```typescript
// features/arena/hooks/use-match-socket.ts
import { useEffect, useRef } from 'react';
import { socket } from '../../../core/ws/socket.instance';

export function useMatchSocket(matchId: string) {
  const callbackRef = useRef<(data: any) => void>();

  useEffect(() => {
    socket.emit('match:join', { matchId });

    socket.on('match:update', (data) => {
      callbackRef.current?.(data);
    });

    return () => {
      socket.emit('match:leave', { matchId });
      socket.off('match:update');
    };
  }, [matchId]);

  return { sendSubmission: (code: string) => socket.emit('match:submission', { matchId, code }) };
}
```

---

## 7. Setup Local

### Prerrequisitos

Antes de empezar, necesitas instalar:

| Herramienta | Version minima | Donde descargar |
|-------------|---------------|-----------------|
| **Node.js** | 20.x | https://nodejs.org |
| **Docker Desktop** | Ultima | https://docker.com/products/docker-desktop |
| **Git** | 2.x | https://git-scm.com |
| **npm** | 10.x | Viene con Node.js |

### Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd FastCode
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

El archivo `.env` ya tendra valores por defecto para desarrollo:
```
DATABASE_URL=postgresql://fastcode:devpassword@localhost:5432/fastcode
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=change-me-to-a-random-secret-at-least-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Paso 3: Levantar Base de Datos con Docker

```bash
# Levantar PostgreSQL y Redis
docker compose -f docker-compose.dev.yml up -d

# Verificar que estan corriendo
docker compose -f docker-compose.dev.yml ps
```

Deberias ver:
```
NAME                  STATUS
fastcode-postgres     Up (healthy)
fastcode-redis        Up (healthy)
```

### Paso 4: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### Paso 5: Configurar Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones (crea tablas en PostgreSQL)
npx prisma migrate dev

# (Opcional) Ver la base de datos con Prisma Studio
npx prisma studio
```

### Paso 6: Correr el Backend

```bash
# Modo desarrollo (con hot reload)
npm run start:dev

# El servidor correra en http://localhost:3000
```

### Paso 7: Instalar Dependencias del Frontend

```bash
# En otra terminal
cd frontend
npm install
```

### Paso 8: Correr el Frontend

```bash
# Modo desarrollo (con hot reload)
npm run dev

# La app correra en http://localhost:5173
```

### Paso 9: Verificar que Todo Funciona

1. Abre http://localhost:5173 en tu navegador
2. Deberias ver la pagina de inicio de FastCode
3. Abre http://localhost:3000 en tu navegador
4. Deberias ver un mensaje de "Hello World!" del backend

### Comandos Utiles

| Comando | Descripcion |
|---------|-------------|
| `docker compose -f docker-compose.dev.yml up -d` | Levantar DB y Redis |
| `docker compose -f docker-compose.dev.yml down` | Bajar DB y Redis |
| `docker compose -f docker-compose.dev.yml logs` | Ver logs de containers |
| `npx prisma studio` | Ver base de datos visualmente |
| `npx prisma migrate dev` | Crear/ejecutar migraciones |
| `npx prisma generate` | Regenerar cliente Prisma |
| `npm run lint` | Ejecutar linter |
| `npm run test` | Ejecutar tests |
| `npm run build` | Compilar para produccion |

### Troubleshooting Comun

**Error: "Cannot connect to PostgreSQL"**
```bash
# Verificar que Docker esta corriendo
docker compose -f docker-compose.dev.yml ps

# Si no esta corriendo, levantarlo
docker compose -f docker-compose.dev.yml up -d

# Esperar 5 segundos y reintentar
```

**Error: "Port 5432 already in use"**
```bash
# Alguien mas esta usando el puerto 5432
# Opciones:
# 1. Matar el proceso que usa el puerto
# 2. Cambiar el puerto en docker-compose.dev.yml
```

**Error: "Prisma client not generated"**
```bash
cd backend
npx prisma generate
```

---

## 8. Flujo de Trabajo

### Ramas Git

| Tipo de Rama | Prefijo | Ejemplo |
|-------------|---------|---------|
| Feature | `feat/` | `feat/auth-register` |
| Bug fix | `fix/` | `fix/elo-calculation` |
| Refactor | `refactor/` | `refactor/user-entity` |
| Tests | `test/` | `test/matchmaking` |
| Chore | `chore/` | `chore/update-deps` |

### Commits Convencionales

Usamos **Conventional Commits**:

```
<tipo>: <descripcion corta>

Ejemplos:
feat: add user registration endpoint
fix: correct Elo calculation for draws
refactor: extract Email value object
test: add unit tests for EloCalculator
chore: update NestJS to v12
```

| Tipo | Descripcion |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Correccion de bug |
| `refactor` | Refactorizacion sin cambiar comportamiento |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento |
| `docs` | Documentacion |
| `style` | Formateo, punto y coma, etc. |

### Proceso Paso a Paso para Desarrollar una Feature

**1. Crear rama desde main:**
```bash
git checkout main
git pull origin main
git checkout -b feat/nombre-de-la-feature
```

**2. Desarrollar la feature:**
- Escribir codigo siguiendo las convenciones
- Hacer commits pequenos y descriptivos
- Escribir tests

**3. Antes de push, verificar:**
```bash
# Linter
npm run lint

# Tests
npm run test

# Build (solo backend)
npm run build
```

**4. Push y crear Pull Request:**
```bash
git add .
git commit -m "feat: descripcion de la feature"
git push origin feat/nombre-de-la-feature
```

**5. Pedir Code Review:**
- Asignar al menos 1 revisor
- Esperar aprobacion antes de merge

### Code Review Checklist

**Backend:**
- [ ] Sigue Clean Architecture (4 capas)
- [ ] No hay logica de negocio en controllers
- [ ] No hay SQL/Prisma en domain
- [ ] DTOs validan inputs
- [ ] Errores tienen formato estandar
- [ ] Tests unitarios para logica de dominio
- [ ] No hay secretos en el codigo

**Frontend:**
- [ ] Sigue estructura por features
- [ ] No hay imports entre features
- [ ] Componentes contemplan estados (loading, error, empty)
- [ ] Accesibilidad basica (labels, foco, teclado)
- [ ] Responsive mobile-first
- [ ] No hay logica de negocio en componentes

### Testing Strategy

| Tipo | Herramienta | Cobertura Objetivo | Que testear |
|------|-------------|-------------------|-------------|
| **Unit** | Vitest | 80% en domain/ | Entidades, value objects, servicios de dominio |
| **Integration** | Vitest + Supertest | Endpoints criticos | Auth, matchmaking, partidas |
| **E2E** | Vitest (config e2e) | Flujos principales | Registro -> Partida -> Resultado |

**Ejemplo de Test Unitario:**
```typescript
// domain/elo/elo.service.spec.ts
import { describe, it, expect } from 'vitest';
import { EloCalculator } from './elo.service';

describe('EloCalculator', () => {
  it('should calculate +16 for win between equal Elo players', () => {
    const result = EloCalculator.calculate(1200, 1200, 1);
    expect(result.delta).toBe(16);
    expect(result.newElo).toBe(1216);
  });

  it('PRD RF5.3: Technical draw must NOT alter Elo', () => {
    const result = EloCalculator.calculate(1200, 1200, 0.5);
    expect(result.delta).toBe(0);
    expect(result.newElo).toBe(1200);
  });
});
```

---

## 9. Proximos Pasos

### Fases del Proyecto

#### Fase 1: Fundacion (Semanas 1-2)
- [ ] Implementar modulo Auth (registro, login, JWT)
- [ ] Implementar modulo Users (perfil, Elo)
- [ ] Crear pantalla de autenticacion (frontend)
- [ ] Crear pantalla de perfil (frontend)

#### Fase 2: Problemas y Variantes (Semanas 3-4)
- [ ] Implementar modulo Problems (CRUD)
- [ ] Generador de variantes dinamicas
- [ ] Seed data con 3 problemas (1 Facil, 1 Medio, 1 Dificil)
- [ ] Sandbox de ejecucion de codigo

#### Fase 3: Matchmaking (Semanas 5-6)
- [ ] Cola de matchmaking con Redis
- [ ] Logica de ventanas acumulativas
- [ ] WebSockets para notificaciones
- [ ] Pantalla de cola (frontend)

#### Fase 4: Arena de Duelo (Semanas 7-9)
- [ ] Maquina de estados de partida
- [ ] Periodo de gracia de 15 segundos
- [ ] Integrar Monaco Editor
- [ ] Progreso visual del oponente
- [ ] Cronometro y fases de partida

#### Fase 5: Integridad y Resultado (Semanas 10-11)
- [ ] Captura de eventos de integridad
- [ ] Logica de resolucion jerarquica
- [ ] Actualizacion de Elo
- [ ] Pantalla de resultado

#### Fase 6: Pulido y Testing (Semana 12)
- [ ] Tests unitarios (cobertura >80%)
- [ ] Tests de integracion
- [ ] Tests E2E
- [ ] Auditoria WCAG 2.1 AA
- [ ] Rate limiting y seguridad

### Criterios de "Done"

Una feature se considera completa cuando:
- [ ] Codigo implementado siguiendo convenciones
- [ ] Tests unitarios escritos y pasando
- [ ] Linter pasando sin errores
- [ ] Code review aprobado
- [ ] Documentacion actualizada (si aplica)
- [ ] Merge a main

---

## 10. Recursos

### Documentacion Oficial

| Tecnologia | Enlace |
|------------|--------|
| NestJS | https://docs.nestjs.com |
| Prisma | https://www.prisma.io/docs |
| React | https://react.dev |
| Vite | https://vitejs.dev |
| Tailwind CSS | https://tailwindcss.com/docs |
| Zustand | https://github.com/pmndrs/zustand |
| Socket.io | https://socket.io/docs |
| Vitest | https://vitest.dev |

### Tutoriales Recomendados para Juniors

**Backend:**
- NestJS Fundamentals: https://docs.nestjs.com/fundamentals/custom-providers
- Prisma Quickstart: https://www.prisma.io/docs/getting-started/quickstart
- Clean Architecture en NestJS: Buscar en YouTube "NestJS Clean Architecture"

**Frontend:**
- React Tutorial: https://react.dev/learn
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Tailwind CSS: https://tailwindcss.com/docs/utility-first
- Zustand Guide: https://github.com/pmndrs/zustand#getting-started

**Git:**
- Conventional Commits: https://www.conventionalcommits.org
- Git Flow: https://nvie.com/posts/a-successful-git-branching-model

---

## 11. Glosario

| Termino | Definicion |
|---------|-----------|
| **API** | Application Programming Interface. Conjunto de reglas para que aplicaciones se comuniquen. |
| **Clean Architecture** | Patron de diseno que separa el codigo en capas con responsabilidades claras. |
| **DTO** | Data Transfer Object. Objeto que transporta datos entre procesos. |
| **Dependency Rule** | Regla de Clean Architecture: las dependencias apuntan hacia adentro. |
| **Domain** | Capa interna de Clean Architecture. Contiene la logica de negocio pura. |
| **Entity** | Objeto con identidad unica y ciclo de vida. Ej: User, Match. |
| **Elo** | Sistema de puntuacion para calcular el nivel relativo de jugadores. |
| **Feature** | Funcionalidad especifica de la aplicacion. Ej: auth, matchmaking, arena. |
| **Gateway** | Patron que permite comunicar dos sistemas independientes. |
| **HMR** | Hot Module Replacement. Recarga modulos sin reiniciar la app. |
| **Interceptor** | Patron que permite interceptar requests/responses para agregar logica transversal. |
| **Matchmaking** | Proceso de encontrar oponentes compatibles para una partida. |
| **MVP** | Minimum Viable Product. Version minima del producto para validar hipotesis. |
| **ORM** | Object-Relational Mapping. Mapea objetos de codigo a tablas de base de datos. |
| **PRD** | Product Requirements Document. Documento de requisitos del producto. |
| **Repository** | Patron que abstrae la persistencia de datos. |
| **Singleton** | Patron que asegura que una clase tenga solo una instancia. |
| **SPA** | Single Page Application. Aplicacion web que no recarga la pagina. |
| **Value Object** | Objeto inmutable que representa un concepto. Ej: Email, Elo. |
| **WebSocket** | Protocolo de comunicacion bidireccional en tiempo real. |
| **WCAG** | Web Content Accessibility Guidelines. Estndares de accesibilidad web. |
| **Zone** | Concepto de Angular, no aplica aqui. Ignorar. |

---

**Fin del documento.**

Para preguntas o aclaraciones, consultar con el lider tecnico del equipo.
