Actúa como diseñador UI senior mobile-first. Genera wireframes de baja fidelidad (blanco/negro) para las 5 pantallas descritas abajo. Cada pantalla debe tener versión **mobile 375px** y **desktop 1280px** cuando el layout lo requiera. Prioriza claridad del estado del juego sobre decoración. Cumple WCAG 2.1 AA y los estados obligatorios.

## Reglas de negocio que no puedes romper

- Elo inicial 1200, K=32, empate técnico = 0 cambio de Elo.
- Matchmaking: ventanas acumulativas ±100 (0-15s) → ±150 (15-25s) → ±200 (25-35s) → ±250 (35-40s). Compatible solo si ambos dentro. Timeout 40s sin bot.
- Ciclo oficial: EN_COLA → EMPAREJAMIENTO_ENCONTRADO → PERIODO_DE_GRACIA (15s sin envíos) → PARTIDA_ACTIVA → FINALIZADA.
- Variante dinámica idéntica para ambos (solo cambian nombres de vars/funcs). Casos ocultos 3-5 nunca se muestran al cliente.
- Telemetría: 1 señal leve/moderada aislada no derrota; 3 moderadas de foco o 1 grave = derrota automática.
- El estado oficial y el resultado vienen solo del servidor. La UI solo refleja.

## Reglas transversales para todas las pantallas

- Mobile-first. Diseña primero en 375px, luego escala.
- Estados visuales obligatorios donde apliquen: `loading`, `error`, `empty`, `disabled`, `success`.
- Accesibilidad: contraste 4.5:1 texto / 3:1 UI grande, foco visible, todo operable con teclado, labels explícitos, objetivo táctil ≥44px, nunca usar solo color para informar.
- Timers con `role="timer"` y anuncio de cambios críticos.
- Nunca mostrar código del oponente ni casos ocultos. Nunca decidir el resultado en el cliente.

---

## PANTALLA 1: Autenticación

**Objetivo:** Registro e inicio de sesión con correo y contraseña.

**Debe contener:**
- Formulario con campos de correo, contraseña y nombre de usuario (registro) o solo correo y contraseña (login).
- Control para alternar entre registro y login.
- Mensajes de error específicos y comprensibles sin revelar si un correo existe.
- Estado de carga en el botón al enviar.

**Flujo:** Éxito → va a Pantalla 2 (Perfil).

**Qué entregar:** Wireframe mobile y desktop de ambas variantes (registro y login). Mostrar estados idle, loading y error.

---

## PANTALLA 2: Perfil (mínimo)

**Objetivo:** Mostrar perfil mínimo del usuario autenticado.

**Debe contener:**
- Avatar genérico o con iniciales (sin personalización ampliada).
- Nombre de usuario.
- Puntuación Elo actual destacada.
- Acción para cerrar sesión.

**No incluir:** Historial de partidas, estadísticas avanzadas, edición de nombre/foto, insignias. Eso es post-MVP.

**Flujo:** Desde aquí el usuario inicia "Buscar duelo" → va a Pantalla 3.

**Qué entregar:** Wireframe mobile y desktop. Solo estado idle y loading.

---

## PANTALLA 3: Cola de Matchmaking

**Objetivo:** Buscar oponente real.

**Debe contener siempre:**
- Cronómetro de búsqueda que inicia en 00:00 y cuenta hacia arriba.
- Indicador del rango Elo activo actual (ej. "Rango: ±100" y se actualiza según tiempo).
- Barra de progreso sutil de la ventana actual.
- Botón para cancelar la búsqueda.

**Estados a generar:**
- Buscando: cronómetro corriendo, rango visible, botón cancelar habilitado.
- Timeout a los 40s: cronómetro detenido en 00:40, mensaje "No se encontró oponente" con botones "Reintentar" y "Cancelar".
- Error de conexión: banner de error con acción para reintentar.

**Flujo:** Al encontrar oponente → va automáticamente a Pantalla 4.

**Qué entregar:** Wireframe mobile y desktop. Generar las 3 variantes de estado arriba. Mostrar cómo cambia el indicador de rango en 0-15s, 15-25s, 25-35s, 35-40s.

---

## PANTALLA 4: Arena de Duelo

**Objetivo:** Duelo 1v1 en tiempo real. Es una sola pantalla que cambia de contenido según la fase.

**Layout:**
- Mobile: contenido apilado vertical.
- Desktop: dos columnas 50/50 con separación de 24px.
- Encabezado fijo con cronómetro oficial del duelo (igual para ambos) y chip de fase actual.

**Columna Izquierda (Tú):**
- Avatar y nombre de usuario.
- Badge con Elo actual.
- Enunciado del problema dinámico (idéntico para ambos).
- Editor de código con altura mínima para 6 líneas visibles. Nunca ocultable durante el duelo.
- Botón para enviar solución.
- Mensaje de estado debajo del botón.

**Columna Derecha (Oponente):**
- Avatar y nombre de usuario.
- Badge con Elo actual.
- Indicador abstracto del progreso del oponente. Puede ser barra horizontal, secuencia de puntos o círculo que se llena. Nunca mostrar código, casos ni porcentaje exacto por caso. Debe llevar etiqueta accesible "Progreso del oponente".

**Banner de reconexión (solo cuando aplica, fijo arriba):**
- Texto "Conexión perdida" con contador "Reconectando en XXs..." y botón "Intentar ahora".

**Fases a generar como variantes de esta misma pantalla:**
- Periodo de gracia (15s): chip "Periodo de gracia", contador de gracia visible, botón de enviar deshabilitado con explicación "Espera el periodo de gracia", editor habilitado para escribir.
- Partida activa: chip "Partida activa", botón habilitado "Enviar solución", al enviar muestra estado de evaluación y luego éxito o error. En los últimos 60s el cronómetro cambia visualmente para alertar.
- Desconexión: banner de reconexión activo, progreso congelado, señal visual de desconexión en el avatar.
- Reconexión exitosa: banner cambia a "Reconectado" y desaparece, estado del juego sincronizado sin recargar.

**Flujo:** Al finalizar por cualquier motivo → va automáticamente a Pantalla 5.

**Qué entregar:** Wireframe mobile y desktop. Generar 4 variantes: gracia, activa, desconexión y reconexión exitosa.

---

## PANTALLA 5: Resultado

**Objetivo:** Mostrar resultado oficial y estadísticas.

**Debe contener:**
- Encabezado "Duelo finalizado" con ícono según motivo.
- Dos tarjetas de jugador (lado a lado en desktop, apiladas en mobile). Cada tarjeta con avatar, nombre, Elo antes → después con cambio (+32 / -32 / 0 en empate), progreso en casos (ej. "3/5 casos") y cantidad de envíos fallidos.
- Tarjeta de motivo de finalización a ancho completo con mensaje específico.
- Acciones centradas: "Volver a jugar" como acción principal, "Ver perfil oponente" y "Ir al inicio" como secundarias.

**Motivos a generar como variantes:**
- Completitud: gana el primero en resolver 100% de casos. Mensaje "¡Ganaste por resolver todos los casos primero!".
- Progreso parcial: al agotarse el tiempo gana quien tiene mayor porcentaje. Mensaje "Ganaste por resolver más casos en el tiempo límite".
- Empate técnico: mismo progreso y mismos envíos fallidos. Mensaje "Empate técnico" y cambio de Elo 0 para ambos.
- Desconexión: sin reconexión en 15s. Mensaje "Derrota por desconexión".
- Integridad: derrota por evidencia grave. Mensaje "Derrota por integridad". Nunca mostrar detalles privados al oponente, solo texto genérico.

**Flujo:** "Volver a jugar" → regresa a Pantalla 3. "Ver perfil oponente" → muestra información pública mínima.

**Qué entregar:** Wireframe mobile y desktop. Generar 5 variantes, una por cada motivo.

---

## Qué debe entregar la IA

1. Wireframes de baja fidelidad en blanco y negro para las 5 pantallas en 375px y 1280px.
2. Para Pantalla 4: 4 variantes (gracia, activa, desconexión, reconexión).
3. Para Pantalla 5: 5 variantes (una por motivo).
4. Anotaciones breves de flujo entre pantallas (flechas o notas de navegación).
5. Verificación de que se cumplen los estados obligatorios y las reglas de negocio listadas arriba.

## Criterio de éxito

Un desarrollador puede mirar los wireframes y decir sin dudas: "Estas son las 5 pantallas del MVP de FastCode con todos sus estados, listas para implementar, sin nada fuera de alcance".
