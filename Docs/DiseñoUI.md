# Diseño UI/UX — FastCode MVP

**Versión:** 1.0
**Fecha:** 2026-08-30
**Basado en:** PRD FastCode MVP v2.0 (`MvpRequerimientos.md`) y convenciones frontend del proyecto.

> [!NOTE]
> Este documento define los requisitos de interfaz y experiencia de usuario para diseñar e implementar el frontend del MVP. Las decisiones de stack se rigen por una versión técnica posterior; aquí solo se especifica **qué** debe lograrse, no **con qué** herramientas.

---

## Índice

1. [Principios Generales](#principios)
2. [Estados de Interfaz](#estados)
3. [Sistema de Diseño Visual (Tokens)](#tokens)
4. [Componentes Reutilizables](#componentes)
5. [Especificación por Pantalla](#pantallas)
6. [Accesibilidad (WCAG 2.1 AA)](#accesibilidad)
7. [Rendimiento y Feedback](#rendimiento)
8. [Checklist de Revisión UI/UX](#checklist)

---

<a id="principios"></a>
## 1. Principios Generales

| Principio | Descripción | Origen |
|---|---|---|
| Mobile-first | Diseñar primero para pantallas pequeñas; escalar a desktop. | PRD RNF4.2 |
| Estado oficial primero | La UI nunca decide el resultado; solo refleja el estado del servidor. | PRD §2.2 |
| Feedback inmediato | Toda acción del usuario confirma visualmente en < 100 ms. | RNF4.4 |
| Claridad competitiva | El usuario siempre sabe: fase de la partida, tiempo restante, progreso y resultado. | RNF4.4 |
| Acceder antes que decorar | Contraste, foco y teclado antes que animaciones o efectos. | WCAG 2.1 AA |

### Organización del código frontend

- `features/` — funcionalidades específicas con carga diferida.
- `core/` — servicios singleton, configuración e interceptores (`auth`, `error`, `loading`, `traceId`).
- `shared/` — componentes y utilidades reutilizables sin lógica de negocio.
- Lógica de cada feature co-localizada (componentes, servicios, modelos, tests).
- Nombres de archivo `kebab-case`.
- No duplicar manejo transversal: usar los interceptores existentes.

---

<a id="estados"></a>
## 2. Estados de Interfaz

Toda pantalla, lista, formulario y control interactivo debe contemplar estos estados cuando correspondan:

| Estado | Descripción | Comportamiento UI |
|--------|-------------|-------------------|
| `loading` | Operación asíncrona en curso | Skeleton o spinner; bloquear acciones duplicadas. |
| `error` | Fallo de red, validación o servidor | Mensaje específico + acción de recuperación (reintentar). |
| `empty` | Colección intencionalmente vacía | Ilustración/texto breve + acción sugerida (ej. "Buscar duelo"). |
| `disabled` | Acción temporalmente no disponible | Apariencia atenuada + tooltip/aria que explique el motivo. |
| `success` | Acción confirmada | Notificación toast o estado visual en contexto. |

> [!IMPORTANT]
> Ninguna pantalla puede renderizarse como "caja vacía sin explicación". Si no hay datos, siempre se muestra el estado `empty` con orientación.

---

<a id="tokens"></a>
## 3. Sistema de Diseño Visual (Tokens)

### 3.1 Espaciado

Base de **4px y 8px**. Escala recomendada:

| Token | Valor | Uso típico |
|-------|-------|------------|
| `space-1` | 4px | Separación interna de iconos, micro-ajustes |
| `space-2` | 8px | Gap entre elementos relacionados |
| `space-3` | 12px | Padding interno de inputs pequeños |
| `space-4` | 16px | Padding estándar de tarjetas y secciones |
| `space-6` | 24px | Separación entre bloques de una vista |
| `space-8` | 32px | Margen entre secciones principales |

### 3.2 Tipografía

| Token | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| `text-xs` | 12px | 400 | Metadatos, timestamps |
| `text-sm` | 14px | 400–500 | Texto secundario, labels |
| `text-base` | 16px | 400 | Cuerpo principal (mínimo en mobile) |
| `text-lg` | 18px | 500–600 | Subtítulos |
| `text-xl` | 20–24px | 600 | Títulos de sección |
| `text-2xl` | 28–32px | 700 | Títulos de pantalla |

- Altura de línea: 1.4–1.6 para cuerpo; 1.2 para títulos.
- Familia monoespaciada exclusiva para código, temporizadores y números de Elo.

### 3.3 Color (roles semánticos)

| Rol | Uso | Contraste mínimo |
|-----|-----|------------------|
| Primario | Acciones principales (enviar, buscar duelo) | 4.5:1 sobre fondo |
| Secundario | Acciones alternativas | 4.5:1 |
| Éxito | Victoria, envío aceptado, conexión restablecida | 4.5:1 |
| Error | Derrota, error de envío, campo inválido | 4.5:1 |
| Advertencia | Aviso de integridad, timeout próximo | 4.5:1 |
| Información | Mensajes neutros del sistema | 4.5:1 |
| Neutro | Texto, fondos, bordes (escala de grises) | según jerarquía |

> [!CAUTION]
> Nunca usar color como único canal (ej. error solo en rojo). Complementar con icono y texto.

### 3.4 Otros tokens

| Token | Valores | Nota |
|-------|---------|------|
| Radio | `sm` (4px), `md` (8px), `lg` (12px), `full` | Consistente entre botones, inputs y tarjetas |
| Sombra | `sm`, `md`, `lg` | Solo para elevación real (modales, popovers) |
| Duración | `fast` 150ms, `base` 200ms, `slow` 300ms | Animaciones de entrada/salida; sin animaciones > 500ms |

---

<a id="componentes"></a>
## 4. Componentes Reutilizables (en `shared/`)

### 4.1 Botones

- Variantes: `primary`, `secondary`, `ghost` (texto), `danger`.
- Tamaños: `sm`, `base`, `lg` con altura mínima táctil de **44x44 px**.
- Estados: reposo, hover. foco visible, activo, `disabled`, `loading` (spinner interno + etiqueta conservada).

### 4.2 Campos de formulario

- Tipos: texto, contraseña (con toggle de visibilidad accesible), email, numérico, textarea.
- Label visible asociado (prohibido placeholder como sustituto del label).
- Mensajes de error inline, vinculados con `aria-describedby`.
- Estados: reposo, foco, error, éxito, disabled, loading.

### 4.3 Selectores y combobox

- Consistentes visualmente con inputs.
- Scroll interno para listas largas; virtualizar si > 100 opciones.
- Estado loading para opciones remotas.

### 4.4 Feedback

| Componente | Uso | Regla |
|------------|-----|-------|
| Toast | Confirmaciones y errores transitorios | Máx. 1 visible; duración 4–6s; rol `status`/`alert` |
| Banner | Avisos persistentes de la vista (ej. desconexión) | Dismissable; no usar para errores de campo |
| Inline | Errores de validación | Junto al campo; color + icono + texto |

### 4.5 Indicadores de carga

- **Spinner**: acciones puntuales (botones, envíos).
- **Skeleton**: contenido de página o tarjetas mientras cargan.
- **Barra de progreso**: solo para procesos con avance conocido (ej. % de casos evaluados).

### 4.6 Modales y diálogos

- Foco atrapado dentro del modal; al cerrar, devolver foco al disparador.
- Cierre con `Esc`, botón de cierre con label accesible y, si aplica, clic fuera.
- Títulos descriptivos (`aria-labelledby`), sin información crítica solo en el cuerpo.

### 4.7 Listas y tarjetas

- Estados `empty`, `error`, `loading` definidos para toda lista.
- Acciones de ítem en menú "más opciones" (kebab) con teclado y lector de pantalla.
- Divisores y jerarquía consistentes (título, dato primario, metadato).

### 4.8 Componentes de dominio

- **Temporizador de partida**: monoespaciado, anuncia cambios críticos (último minuto) vía `aria-live="polite"`.
- **Indicador de progreso del oponente**: % de casos superados agregado, sin código ni casos ocultos (PRD RF4.4).
- **Badge de Elo**: valor numérico + variación tras partida.
- **Editor de código**: tema claro/oscuro, tamaño de fuente configurable, respeto a `prefers-reduced-motion`.

---

<a id="pantallas"></a>
## 5. Especificación por Pantalla

### 5.1 Registro e inicio de sesión

- Formulario con validación en cliente + servidor (servidor manda).
- Errores específicos sin revelar si un correo existe (PRD RF1.1).
- Estado `loading` en el botón durante autenticación; deshabilitado para evitar doble envío.
- Tras éxito: redirección con feedback y sesión iniciada.

### 5.2 Perfil

- Datos mínimos: nombre de usuario + Elo actual (RF1.3).
- No exponer correo a terceros ni evidencias de integridad.

### 5.3 Cola de matchmaking

| Elemento | Requisito |
|----------|-----------|
| Estado | `loading` persistente mientras se busca |
| Tiempo | Cronómetro visible desde el inicio |
| Rango Elo | Mostrar la ventana activa (±100 → ±250 según tiempo, RF3.2) |
| Acciones | Cancelar siempre disponible; al timeout (40s) ofrecer **Reintentar** o **Cancelar** (nunca bot) |
| Empty | No aplica; siempre hay búsqueda activa o acción para iniciarla |

### 5.4 Arena de duelo (pantalla crítica)

#### Periodo de gracia (15 s)
- Enunciado de la variante dinámica visible y legible.
- Editor habilitado para leer/escribir, **botón de enviar deshabilitado** con razón visible.
- Temporizador de gracia destacado.

#### Fase activa
- Temporizador oficial (igual para ambos, RF2.4). Aviso visual + sonoro *opcional* al quedar 1 min.
- Botón **Enviar solución**: estados `loading` (evaluando), `success` (progreso), `error` (fallo con detalle no sensible).
- Progreso propio y del oponente (solo % agregado; sin código ni casos ocultos).
- Código del usuario nunca visible para el oponente.

#### Desconexión / reconexión
- Banner persistente de "Sin conexión" + contador de 15 s.
- Al reconectar: sincronizar fase, tiempo restante y progreso sin recargar la página.
- Si expira la ventana: pantalla de derrota por desconexión.

### 5.5 Pantalla de resultado

- Ganador y **motivo exacto**: completitud, progreso parcial, desempate por envíos, empate técnico, desconexión o integridad (RF5.1).
- Progreso de ambos: % de casos ocultos + envíos fallidos.
- Variación de Elo (0 en empate técnico).
- Acciones: volver a cola, ver perfil, ir al inicio.
- Evidencias de integridad: solo indicación general ("finalizada por integridad"), sin detalles privados al oponente (RNF5 / RF6.3).

### 5.6 Estados globales

- Error de red global: banner + botón reintentar.
- Mantenimiento/timeout de servidor: pantalla completa con acción de reintento.
- 404/permiso denegado: mensaje claro + enlace a inicio.

---

<a id="accesibilidad"></a>
## 6. Accesibilidad (WCAG 2.1 AA)

| Requisito | Criterio de aceptación |
|-----------|------------------------|
| Contraste | Texto ≥ 4.5:1; texto grande y componentes UI ≥ 3:1 |
| Foco visible | Outline perceptible en todo elemento interactivo (no depender del color) |
| Teclado | Orden lógico de tab; todas las acciones operables sin ratón; `Esc` cierra modales |
| Labels | Todo control con `<label>` o `aria-label`; errores vinculados con `aria-describedby` |
| Mensajes de estado | Cambios dinámicos (progreso, timers críticos, toasts) en regiones `aria-live` |
| Tamaño táctil | ≥ 44x44 px en elementos accionables |
| Reducción de movimiento | Respetar `prefers-reduced-motion`; ofrecer desactivar animaciones no esenciales |
| No depender del color | Iconografía + texto además del color semántico |
| Sonido | Alertas sonoras siempre con alternativa visual (PRD RF4.6) |

---

<a id="rendimiento"></a>
## 7. Rendimiento y Feedback

- **Respuesta visual inmediata** (< 100 ms) a clics/teclas; transiciones de 150–300 ms.
- **Carga diferida** de rutas/features y del editor de código.
- **Skeletons** sobre contenido que tarda; evitar pantallas en blanco.
- **Optimización de la arena**: minimizar re-renders del editor y del temporizador.
- **Consistencia con interceptores**: loading global, errores HTTP y `traceId` ya gestionados en `core/`; no reimplementar por pantalla.

---

<a id="checklist"></a>
## 8. Checklist de Revisión UI/UX

Antes de dar por terminada cualquier pantalla:

- [ ] Todos los estados (`loading`, `error`, `empty`, `disabled`, `success`) implementados donde aplican.
- [ ] Diseño verificado en ancho ≤ 375 px y en desktop.
- [ ] Contraste comprobado (herramienta tipo WebAIM).
- [ ] Navegación completa con teclado y foco visible.
- [ ] Labels asociados y errores con `aria-describedby`.
- [ ] Iconos informativos con texto/aria alternativo; decorativos con `aria-hidden="true"`.
- [ ] Mensajes de error específicos y accionables.
- [ ] Sin color como único canal de información.
- [ ] Animaciones suaves, cortas y desactivables.
- [ ] Se reutilizan componentes de `shared/` e interceptores de `core/`.
- [ ] La UI nunca decide el resultado oficial; solo refleja el estado del servidor.
