# Documento de Requisitos de Producto (PRD) - FastCode MVP

**Version:** 2.0

**Estado:** Borrador funcional revisado

**Alcance del documento:** Producto, reglas de negocio y criterios de aceptación.

**Fuera de esta versión:** Lenguajes de programación, frameworks, proveedores, arquitectura, infraestructura, persistencia, protocolos de comunicación y contratos técnicos. Estas decisiones se documentarán en una versión técnica posterior.

## Índice de Contenidos

1. [Resumen Ejecutivo](#section-1)
2. [Objetivo y Principios del MVP](#section-2)
3. [Alcance Priorizado](#section-3)
4. [Flujos Principales](#section-4)
5. [Requisitos Funcionales](#section-5)
6. [Requisitos No Funcionales](#section-6)
7. [Métricas de Éxito del MVP](#section-7)
8. [Riesgos, Supuestos y Mitigaciones](#section-8)
9. [Definición de Done del MVP](#section-9)
10. [Versión Técnica Posterior](#section-10)

## Índice de Requisitos

| Código | Bloque | Prioridad | Navegación |
| --- | --- | --- | --- |
| RF1 | Gestión de Usuarios y Perfiles | Debe | [Ir a RF1](#rf1) |
| RF2 | Banco de Problemas y Variantes Dinámicas | Debe | [Ir a RF2](#rf2) |
| RF3 | Matchmaking y Emparejamiento | Debe | [Ir a RF3](#rf3) |
| RF4 | Arena de Duelo 1v1 | Debe | [Ir a RF4](#rf4) |
| RF5 | Resultado, Victoria y Elo | Debe | [Ir a RF5](#rf5) |
| RF6 | Telemetría y Evidencia de Integridad | Debe | [Ir a RF6](#rf6) |
| RNF1 | Rendimiento y capacidad | Debe | [Ir a RNF1](#rnf1) |
| RNF2 | Seguridad y aislamiento | Debe | [Ir a RNF2](#rnf2) |
| RNF3 | Disponibilidad y reconexión | Debe | [Ir a RNF3](#rnf3) |
| RNF4 | Experiencia y accesibilidad | Debe | [Ir a RNF4](#rnf4) |
| RNF5 | Auditoría y privacidad | Debe | [Ir a RNF5](#rnf5) |

<a id="section-1"></a>
## 1. Resumen Ejecutivo

**FastCode** es una plataforma de programación competitiva 1v1 en tiempo real. Dos usuarios reciben el mismo problema con una variante dinámica, compiten durante un tiempo limitado y obtienen un resultado oficial basado en la evaluación de sus soluciones.

El MVP debe validar estas hipótesis:

1. Los usuarios encuentran valor en resolver problemas de programación contra un oponente real.
2. La variante dinámica del enunciado dificulta el uso de respuestas pre-generadas o copiadas textualmente sin alterar la dificultad del problema.
3. Un resultado calculado de forma oficial y transparente genera una experiencia competitiva confiable.

El MVP prioriza el flujo completo de un duelo sobre las funciones sociales, la variedad de autenticación y las herramientas avanzadas de moderación.

<a id="section-2"></a>
## 2. Objetivo y Principios del MVP

### 2.1 Objetivo

Permitir que dos usuarios autenticados entren en una cola, sean emparejados, resuelvan un problema dinámico en una arena 1v1, reciban un resultado determinista y actualicen su puntuación Elo.

### 2.2 Principios

* El estado oficial de la partida y el resultado no dependen de decisiones tomadas únicamente por el cliente.
* La variante dinámica debe conservar la lógica, dificultad, entradas, salidas y casos de prueba del problema original.
* Las reglas de victoria deben ser conocidas, medibles y reproducibles.
* Las señales de integridad son evidencia contextual, no una garantía absoluta contra trampas.
* El documento describe qué debe hacer el producto, no cómo se implementará.

<a id="section-3"></a>
## 3. Alcance Priorizado

### 3.1 Debe incluir el MVP

* Registro e inicio de sesión mediante correo y contraseña.
* Perfil mínimo con nombre de usuario y puntuación Elo.
* Banco inicial de al menos 3 problemas, con al menos 1 problema por cada dificultad: Fácil, Medio y Difícil.
* Enunciados dinámicos obligatorios en las partidas.
* Cola de emparejamiento entre usuarios reales.
* Duelo 1v1 con periodo de gracia, tiempo límite y finalización oficial.
* Editor de código integrado para el lenguaje que se defina en la versión técnica.
* Evaluación oficial de los casos ocultos fuera del control del cliente.
* Dashboard que recopile la informacion de partidas del usuario y informacion general
* Resolución del ganador según reglas jerárquicas de completitud, progreso y errores.
* Actualización del Elo después de una partida válida.
* Reconexión durante una ventana de 15 segundos.
* Telemetría de integridad, clasificación de evidencias y sanciones definidas en RF6.

### 3.2 Debería incluirse después del núcleo del MVP

* Historial detallado de los últimos 10 duelos.
* Insignias Oro, Plata y Bronce.
* Avatar y personalización ampliada del perfil.
* Alertas sonoras discretas, siempre acompañadas de una alternativa visual.
* Optimización de envíos repetidos mediante caché.
* Herramientas de consulta y revisión de evidencias de integridad.

### 3.3 Fuera del MVP

* Inicio de sesión mediante OAuth, incluyendo GitHub y Google.
* Oponente bot después del timeout de búsqueda.
* Torneos, equipos, salas privadas y temporadas competitivas.
* Sistema social, chat y mensajería entre usuarios.
* Anti-trampas basado únicamente en bloqueos del portapapeles o del foco.
* Selección definitiva de lenguaje, stack, arquitectura, proveedores y estrategia de despliegue.

<a id="section-4"></a>
## 4. Flujos Principales

### 4.1 Registro y entrada

1. El usuario crea una cuenta con correo, contraseña y nombre de usuario.
2. El sistema valida los datos y evita duplicidades.
3. El usuario inicia sesión y consulta su Elo.
4. El usuario puede entrar en la cola de búsqueda.

### 4.2 Emparejamiento

1. El usuario solicita un duelo.
2. El sistema muestra el estado de búsqueda y el tiempo transcurrido.
3. El sistema busca un oponente compatible según las ventanas de Elo definidas en RF3.
4. Al encontrarlo, ambos usuarios reciben la confirmación del emparejamiento.
5. Si no hay oponente a los 40 segundos, la búsqueda termina y se ofrecen las opciones de reintentar o cancelar.

### 4.3 Duelo

1. Ambos usuarios reciben el mismo problema dinámico.
2. Durante 15 segundos pueden leer la consigna, pero no pueden realizar envíos oficiales.
3. Comienza el tiempo activo y ambos pueden editar y enviar su solución.
4. El sistema informa del progreso oficial del oponente.
5. La partida finaliza por completitud, timeout, desconexión o sanción de integridad.

### 4.4 Resultado

1. El sistema calcula el resultado usando únicamente evaluaciones oficiales.
2. Se muestra el ganador, el motivo, el progreso de ambos y el cambio de Elo.
3. Las evidencias de integridad quedan asociadas a la partida para una posible revisión.

<a id="section-5"></a>
## 5. Requisitos Funcionales

<a id="rf1"></a>
### RF1. Gestión de Usuarios y Perfiles

#### RF1.1 Autenticación por correo y contraseña [Debe]

El sistema debe permitir registrar cuentas e iniciar sesión mediante correo y contraseña. OAuth no forma parte del MVP.

**Criterios de aceptación:**

* Un registro válido crea una cuenta con un nombre de usuario único.
* Un correo o nombre de usuario ya registrado produce un error comprensible y no crea una segunda cuenta.
* Las credenciales inválidas no revelan si una cuenta concreta existe.
* Solo un usuario autenticado puede entrar en la cola o participar en una partida.
* El usuario puede cerrar su sesión.

#### RF1.2 Puntuación inicial [Debe]

Todo usuario nuevo comienza con un Elo de 1200 puntos.

**Criterios de aceptación:**

* El Elo inicial se muestra antes de la primera partida.
* Una partida cancelada antes de comenzar no modifica el Elo.
* El cambio posterior se calcula según RF5.3.

#### RF1.3 Perfil mínimo [Debe]

El perfil muestra el nombre de usuario y el Elo actual.

**Criterios de aceptación:**

* El propietario puede consultar su propio perfil.
* Un usuario puede consultar la información pública mínima de otro usuario.
* El perfil no expone correo, credenciales ni evidencias privadas de integridad.

#### RF1.4 Historial e insignias [Debería]

El perfil podrá mostrar los últimos 10 duelos y el contador de insignias Oro, Plata y Bronce cuando estas funciones se incorporen al MVP extendido.

<a id="rf2"></a>
### RF2. Banco de Problemas y Variantes Dinámicas

#### RF2.1 Catálogo y dificultad [Debe]

El catálogo inicial debe contener al menos 3 problemas publicados: 1 Fácil, 1 Medio y 1 Difícil. Cada problema debe tener una dificultad, una descripción, restricciones, formato de entrada, formato de salida y límite de tiempo.

**Criterios de aceptación:**

* Un problema no puede publicarse sin todos los datos obligatorios.
* La dificultad visible debe coincidir con la clasificación del catálogo.
* La asignación de una partida selecciona un único problema y la misma dificultad para ambos jugadores.

#### RF2.2 Casos de prueba [Debe]

Cada problema debe incluir al menos 2 casos públicos y entre 3 y 5 casos ocultos.

**Criterios de aceptación:**

* Los casos públicos pueden consultarse antes o durante la partida.
* Los casos ocultos no se muestran al cliente ni al oponente.
* El resultado oficial se basa en los casos ocultos.
* Un error de evaluación del servicio de ejecución no se cuenta como un envío fallido del usuario.

#### RF2.3 Enunciado dinámico por partida [Debe]

Cada partida debe utilizar una variante dinámica del problema asignado. Como mínimo, la variante debe parametrizar los nombres de variables y funciones a partir de un conjunto de nombres válidos.

**Criterios de aceptación:**

* Los dos jugadores reciben exactamente la misma variante del problema.
* La variante conserva la lógica, restricciones, entradas, salidas, dificultad y límite de tiempo del problema base.
* Los casos públicos y ocultos corresponden a la variante entregada.
* Una misma plantilla puede generar más de una variante válida.
* La generación de una variante inválida impide iniciar la partida y muestra un error controlado.
* La variante dinámica reduce la utilidad de soluciones copiadas textualmente, pero no se presenta como una garantía absoluta contra trampas.

#### RF2.4 Tiempo límite [Debe]

Cada problema debe definir un timeout absoluto para la partida.

**Criterios de aceptación:**

* El timeout se muestra a ambos jugadores antes de comenzar la fase activa.
* El timeout es igual para ambos jugadores.
* Una vez agotado el tiempo no se aceptan nuevos envíos oficiales.

#### RF2.5 Insignias [Debería]

Cada problema podrá definir umbrales de tiempo para asignar insignias Oro, Plata y Bronce. Esta función no bloquea la validación del duelo principal.

<a id="rf3"></a>
### RF3. Matchmaking y Emparejamiento

#### RF3.1 Cola de espera [Debe]

El usuario puede entrar y salir de una cola de búsqueda de duelos.

**Criterios de aceptación:**

* El usuario ve que está en cola y el tiempo transcurrido.
* Un usuario no puede tener más de una solicitud activa de búsqueda.
* La cancelación antes del emparejamiento no genera resultado ni modifica el Elo.
* Una partida confirmada no puede asignarse simultáneamente a un tercer usuario.

#### RF3.2 Rango de búsqueda [Debe]

La búsqueda utiliza estas ventanas acumulativas:

| Tiempo transcurrido | Diferencia máxima de Elo |
| --- | ---: |
| 0 a 15 segundos | ±100 |
| Más de 15 a 25 segundos | ±150 |
| Más de 25 a 35 segundos | ±200 |
| Más de 35 a 40 segundos | ±250 |

Dos usuarios son compatibles cuando la diferencia de Elo se encuentra dentro del rango activo de búsqueda para ambos.

**Criterios de aceptación:**

* El rango se amplía según la tabla y no antes de tiempo.
* El sistema no empareja usuarios fuera del rango activo de ambos.
* El usuario recibe confirmación antes de entrar en la partida.

#### RF3.3 Timeout sin bot [Debe]

Después de 40 segundos sin un oponente compatible, la búsqueda termina. El sistema ofrece reintentar o cancelar, pero no ofrece un bot.

**Criterios de aceptación:**

* La búsqueda nunca inicia una partida contra un oponente automático.
* El usuario recibe una explicación clara de que no se encontró rival.
* Reintentar crea una nueva búsqueda sin conservar una solicitud anterior.

<a id="rf4"></a>
### RF4. Arena de Duelo 1v1

#### RF4.1 Ciclo de vida oficial [Debe]

La partida debe seguir este ciclo:

`EN_COLA -> EMPAREJAMIENTO_ENCONTRADO -> PERIODO_DE_GRACIA -> PARTIDA_ACTIVA -> FINALIZADA`

También puede finalizar como cancelada antes de comenzar, por desconexión o por sanción de integridad.

**Criterios de aceptación:**

* Una partida no puede pasar directamente de la cola a la fase activa.
* Solo una partida finalizada puede producir resultado y actualizar Elo.
* Una vez finalizada, la partida no acepta nuevos envíos ni cambios de resultado desde el cliente.

#### RF4.2 Periodo de gracia [Debe]

Los primeros 15 segundos permiten leer la consigna. Durante este periodo el editor puede mostrar la plantilla, pero no permite envíos oficiales y el cronómetro de resolución permanece pausado.

**Criterios de aceptación:**

* Ambos jugadores reciben el mismo periodo de gracia.
* El tiempo restante se muestra de forma visible.
* El primer envío oficial solo puede realizarse cuando comienza la fase activa.

#### RF4.3 Editor integrado [Debe]

La arena debe ofrecer un editor para escribir, modificar y enviar la solución en el lenguaje que se defina en la versión técnica posterior. Este PRD no fija un lenguaje concreto.

**Criterios de aceptación:**

* El usuario puede escribir y editar una solución durante la fase activa.
* El usuario puede enviar una solución y consultar su estado.
* Los resultados locales o preliminares nunca sustituyen al resultado oficial.
* El código de un jugador no se muestra al oponente.
* Los errores de entrada, ejecución o evaluación se presentan con mensajes comprensibles.

#### RF4.4 Envíos y progreso [Debe]

Cada envío oficial queda asociado al jugador, a la partida y a un instante. El sistema muestra al oponente el progreso agregado de casos aprobados, sin mostrar el código ni los casos ocultos.

**Criterios de aceptación:**

* Un envío recibido antes del timeout se procesa según las reglas de la partida.
* Un envío recibido después del timeout se rechaza.
* El progreso se actualiza solo con resultados oficiales.
* Un envío que no supera todos los casos ocultos cuenta como envío fallido para RF5.
* Los fallos del evaluador no incrementan los envíos fallidos del usuario.

#### RF4.5 Progreso visual en vivo [Debe]

El progreso del oponente debe comunicarse visualmente.

#### RF4.6 Alertas de actividad [Debería]

La arena podrá mostrar una alerta visual cuando el oponente realice un envío oficial. Las alertas sonoras son opcionales y nunca pueden ser el único medio de notificación.

<a id="rf5"></a>
### RF5. Resultado, Victoria y Elo

#### RF5.1 Jerarquía de resolución [Debe]

El resultado se determina en este orden:

1. **Completitud:** gana el primer jugador que valide el 100% de los casos ocultos.
2. **Progreso parcial:** si termina el tiempo sin completitud, gana quien tenga el mayor porcentaje de casos ocultos superados.
3. **Envíos fallidos:** si el porcentaje es igual, gana quien tenga menor cantidad de envíos fallidos.
4. **Empate técnico:** si el progreso y los envíos fallidos son iguales, la partida termina en empate.

**Criterios de aceptación:**

* La misma entrada produce siempre el mismo resultado oficial.
* El sistema muestra el motivo exacto de la resolución.
* Una partida no puede tener dos ganadores.
* En un empate técnico no hay variación de Elo.

#### RF5.2 Reglas de conteo [Debe]

* Un caso aprobado cuenta una sola vez para el progreso, aunque el usuario reenvíe la misma solución.
* Un envío fallido es un envío oficial que no valida todos los casos ocultos.
* Los borradores, las ejecuciones locales y los errores del evaluador no cuentan como envíos fallidos.

#### RF5.3 Actualización del Elo [Debe]

Todo usuario comienza con 1200 puntos y el MVP utilizará inicialmente un `K-factor` de 32.

Para una victoria o derrota se aplicará:

`Elo nuevo = Elo actual + K x (S - E)`

Donde `S` vale 1 para una victoria y 0 para una derrota, y `E` representa la expectativa calculada a partir del Elo de ambos jugadores. El resultado se redondea a un número entero. El empate técnico es una excepción: no modifica el Elo de ninguno de los jugadores.

**Criterios de aceptación:**

* El ganador recibe el resultado de victoria y el perdedor el de derrota.
* El Elo se actualiza una sola vez por partida.
* Las partidas canceladas antes de comenzar no actualizan el Elo.
* Una sanción grave de integridad o una desconexión que finalice la partida se considera derrota para el usuario sancionado o desconectado.

#### RF5.4 Resultado visible [Debe]

Al finalizar, cada jugador puede consultar ganador, motivo de finalización, progreso de ambos, envíos fallidos y variación de Elo. Los detalles sensibles de las evidencias de integridad no se muestran al oponente.

<a id="rf6"></a>
### RF6. Telemetría y Evidencia de Integridad

#### RF6.1 Principio de funcionamiento [Debe]

El módulo de integridad recopila telemetría y evidencia contextual. No se considera una garantía absoluta contra trampas y no debe depender de un bloqueo del cliente como única defensa.

**Criterios de aceptación:**

* Los intentos de pegar contenido, las pérdidas de foco y los patrones de inserción rápida pueden registrarse como eventos.
* Un evento generado en el cliente no modifica por sí solo el resultado oficial.
* La decisión de sanción se aplica según una política definida y registrada para la partida.
* El usuario recibe una notificación cuando una evidencia produce una advertencia o una derrota automática.

#### RF6.2 Niveles de evidencia [Debe]

| Nivel | Ejemplos | Acción inicial |
| --- | --- | --- |
| Leve | Intento de `paste`, pérdida de foco menor a 2 segundos o inserción rápida inferior a 300 ms | Registrar evidencia; sin derrota automática |
| Moderado | Pérdida de foco superior a 2 segundos o repetición de señales leves | Registrar evidencia y mostrar advertencia |
| Grave | Manipulación del estado oficial, alteración de un envío o acumulación de 3 infracciones moderadas de foco en la misma partida | Derrota automática por integridad |

Una sola señal leve o moderada no debe provocar una derrota automática. Una evidencia grave validada o la acumulación definida en la tabla sí puede finalizar la partida automáticamente.

#### RF6.3 Registro de evidencia [Debe]

Cada evento debe asociarse a la partida y al jugador, e incluir tipo, nivel, instante, duración cuando aplique y acción tomada.

**Criterios de aceptación:**

* La evidencia no almacena contraseñas, tokens ni código completo salvo que una política posterior lo autorice expresamente.
* El oponente no puede consultar los detalles privados de la evidencia.
* El resultado indica de forma general si terminó por integridad y quién recibió la sanción.
* Si ambos jugadores acumulan evidencia grave, la partida se marca para revisión y no modifica el Elo hasta resolverla.

<a id="section-6"></a>
## 6. Requisitos No Funcionales

<a id="rnf1"></a>
### RNF1. Rendimiento y capacidad

* **RNF1.1 Tiempo real:** Los eventos de estado y progreso deben alcanzar una latencia p95 inferior a 150 ms bajo la capacidad objetivo.
* **RNF1.2 Evaluación:** El 95% de los envíos oficiales debe devolver un resultado o estado controlado en menos de 5 segundos, excluyendo problemas externos documentados.
* **RNF1.3 Capacidad:** El producto debe soportar 100 partidas simultáneas, equivalentes a 200 participantes, sin pérdida de estado ni degradación que impida jugar.
* **RNF1.4 Límites:** La ejecución debe controlar tiempo máximo, memoria máxima, tamaño de código y tamaño de salida. Los valores concretos de recursos se fijarán en la versión técnica según el lenguaje seleccionado.

<a id="rnf2"></a>
### RNF2. Seguridad y aislamiento

* **RNF2.1 Ejecución aislada:** El código enviado no debe tener acceso a datos de otros usuarios ni a la red externa.
* **RNF2.2 Resultado oficial:** Los casos ocultos y el cálculo del resultado no pueden depender de información manipulable desde el cliente.
* **RNF2.3 Validación:** Toda entrada, envío y transición sensible debe validarse y autorizarse fuera del cliente.
* **RNF2.4 Abuso:** Debe existir limitación de frecuencia para autenticación, entradas a la cola y envíos oficiales.
* **RNF2.5 Sesiones:** Las sesiones deben protegerse con mecanismos seguros y no deben exponer credenciales en respuestas, mensajes o registros.
* **RNF2.6 Acceso por objeto:** Un usuario solo puede consultar y modificar su propio perfil y sus acciones dentro de partidas en las que participa.

<a id="rnf3"></a>
### RNF3. Disponibilidad y reconexión

* **RNF3.1 Reconexión:** Ante una pérdida abrupta de conexión, el usuario dispone de 15 segundos para volver a la partida.
* **RNF3.2 Estado durante la desconexión:** El oponente ve un indicador de desconexión y el tiempo oficial continúa según las reglas de la partida.
* **RNF3.3 Derrota por desconexión:** Si no hay reconexión dentro de la ventana, la partida finaliza con derrota por desconexión, salvo que ya exista un resultado oficial anterior.
* **RNF3.4 Recuperación:** Al reconectarse, el usuario recibe el estado actual, el tiempo restante y su progreso sincronizado.

<a id="rnf4"></a>
### RNF4. Experiencia y accesibilidad

* **RNF4.1 Estados de interfaz:** Cola, arena y resultado deben contemplar estados de carga, error, vacío, deshabilitado y éxito cuando correspondan.
* **RNF4.2 Responsive:** Los flujos principales deben funcionar en pantallas pequeñas y grandes.
* **RNF4.3 Accesibilidad:** La experiencia debe orientarse a WCAG 2.1 AA, incluyendo contraste suficiente, foco visible, navegación por teclado, etiquetas y mensajes claros.
* **RNF4.4 Feedback:** El usuario debe conocer siempre el estado de la partida, el tiempo restante, el resultado de un envío y el motivo de finalización.

<a id="rnf5"></a>
### RNF5. Auditoría y privacidad

* **RNF5.1 Trazabilidad:** Las acciones críticas deben conservar partida, usuario, instante, tipo de acción y resultado.
* **RNF5.2 Minimización:** La telemetría debe recoger únicamente los datos necesarios para resolver disputas y mejorar la integridad.
* **RNF5.3 Retención:** El periodo de conservación de evidencias debe definirse en la política de privacidad antes del lanzamiento y no superar el tiempo necesario para su finalidad.
* **RNF5.4 Transparencia:** El usuario debe conocer que se recopilan señales de foco, portapapeles e interacción durante un duelo.

<a id="section-7"></a>
## 7. Métricas de Éxito del MVP

Los siguientes valores son objetivos iniciales y deben revisarse después del primer piloto:

| Métrica | Objetivo inicial |
| --- | --- |
| Tiempo mediano de emparejamiento | Menor de 20 segundos |
| Partidas emparejadas dentro de 40 segundos | Al menos 70% de las búsquedas |
| Partidas completadas sin abandono | Al menos 60% |
| Latencia p95 de eventos de partida | Menor de 150 ms |
| Envíos con resultado o estado controlado en menos de 5 segundos | Al menos 95% |
| Partidas con error del evaluador | Menos del 5% |
| Partidas con disputa de integridad | Menos del 5% |
| Usuarios que vuelven a jugar dentro de 7 días | Medir durante el piloto y establecer línea base |

La hipótesis de los enunciados dinámicos debe evaluarse comparando la tasa de finalización, abandono y reportes de integridad frente a una línea base definida en pruebas internas.

<a id="section-8"></a>
## 8. Riesgos, Supuestos y Mitigaciones

| Tipo | Elemento | Mitigación o decisión requerida |
| --- | --- | --- |
| Riesgo | Las variantes dinámicas pueden alterar accidentalmente la dificultad o romper una solución válida | Validar cada variante contra casos públicos y ocultos antes de habilitarla |
| Riesgo | La telemetría puede generar falsos positivos y disputas | No sancionar por una señal aislada, mostrar el motivo y conservar evidencia contextual |
| Riesgo | Sin bot puede haber tiempos de espera altos en el lanzamiento | Mostrar el tiempo, permitir reintentar y medir la tasa de emparejamiento |
| Riesgo | La ejecución de código puede consumir recursos o intentar acceder a información externa | Aplicar aislamiento y límites antes de habilitar el lenguaje elegido |
| Riesgo | La evaluación puede fallar o quedar pendiente | Diferenciar error del evaluador de error del usuario y definir reintentos controlados |
| Riesgo | La recopilación de telemetría puede afectar privacidad | Publicar finalidad, datos recogidos, retención y acceso antes del lanzamiento |
| Supuesto | Existirá un catálogo inicial con problemas revisados y variantes válidas | Crear un proceso de revisión de contenido antes de publicar cada problema |
| Supuesto | El lenguaje y el stack se decidirán en una versión técnica posterior | No bloquear este PRD con nombres de tecnologías o proveedores |
| Supuesto | El piloto tendrá suficiente concurrencia para medir matchmaking y rendimiento | Instrumentar las métricas desde el primer entorno de validación |

<a id="section-9"></a>
## 9. Definición de Done del MVP

El MVP se considera listo cuando se cumplen todas estas condiciones:

* Un usuario puede registrarse, iniciar sesión y consultar su Elo.
* Dos usuarios reales pueden entrar en cola y emparejarse dentro de las reglas definidas.
* La búsqueda termina a los 40 segundos sin ofrecer un bot.
* Ambos jugadores reciben la misma variante dinámica válida del problema.
* El periodo de gracia dura 15 segundos y la fase activa respeta el timeout.
* El lenguaje seleccionado en la versión técnica permite editar, enviar y evaluar soluciones oficialmente.
* Los casos ocultos no quedan expuestos al cliente.
* El ganador se determina de forma reproducible según RF5.
* Los empates técnicos no modifican el Elo.
* Las derrotas por desconexión e integridad se aplican según las reglas documentadas.
* La reconexión funciona durante 15 segundos y sincroniza el estado de la partida.
* La telemetría registra evidencias sin almacenar secretos ni código completo innecesario.
* Los flujos principales contemplan errores, estados de carga y accesibilidad básica.
* Se han validado los objetivos de capacidad, evaluación y latencia con el entorno definido en la versión técnica.
* Las métricas de éxito pueden consultarse durante el piloto.

<a id="section-10"></a>
## 10. Versión Técnica Posterior

Una versión posterior debe definir, sin modificar las reglas funcionales de este PRD salvo decisión explícita:

* Lenguaje o lenguajes soportados y sus versiones.
* Stack de frontend, backend y servicios auxiliares.
* Arquitectura, persistencia, despliegue y observabilidad.
* Contratos de comunicación, eventos y manejo de errores.
* Estrategia de evaluación y aislamiento de código.
* Límites concretos de CPU, memoria, tiempo, código y salida.
* Política técnica de generación y validación de variantes dinámicas.
* Política de autenticación, sesiones y recuperación de cuentas.
