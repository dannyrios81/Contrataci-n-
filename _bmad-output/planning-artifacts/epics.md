---
status: final
stepsCompleted: [validate-prerequisites, design-epics, create-stories, final-validation]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# SICOP - Epic Breakdown

## Overview

Descomposición de los requisitos del PRD y de la arquitectura de SICOP en épicas e historias implementables.

## Requirements Inventory

### Functional Requirements

FR-1..FR-36 según `prd.md` §4.

### NonFunctional Requirements

NFR-1..NFR-8 según `prd.md` §8.

### Additional Requirements

- AD-1..AD-7 de `architecture.md` (motor puro, parámetros como datos, dinero en enteros, fechas civiles, decisiones citables, bitácora append-only, dirección de dependencias).

### UX Design Requirements

No hay documento UX todavía; se recomienda ejecutar `bmad-ux` antes de la Épica 6.

### FR Coverage Map

| FR | Épica |
| --- | --- |
| FR-2, FR-4, FR-5, FR-8, FR-9, FR-10, FR-11, FR-22 (reglas), FR-27 (reglas), FR-28 (reglas) | 1 |
| FR-1, FR-3, FR-31, FR-33 | 2 |
| FR-6, FR-7, FR-12..FR-20 | 3 |
| FR-21..FR-29 | 4 |
| FR-30, FR-32, FR-34..FR-36 | 5 |
| UI de todos los anteriores | 6 |

## Epic List

1. Motor Normativo
2. Plataforma API, seguridad y parámetros
3. Plan Anual de Adquisiciones y Procesos de selección
4. Contratos y ejecución
5. Expediente, alertas e interoperabilidad
6. Interfaz web

## Epic 1: Motor Normativo

Paquete `packages/normativa`, puro y probado, que implementa las reglas legales de la contratación estatal colombiana: calendario de días hábiles, cuantías, recomendación de modalidad, cronogramas, garantías mínimas, límites de modificaciones y plazos de liquidación.

### Story 1.1: Estructura del monorepo y tipos base del motor

As a desarrollador,
I want un monorepo TypeScript con el paquete `normativa` y sus tipos base,
So that las demás historias tengan una base común y verificable.

**Acceptance Criteria:**

**Given** el repositorio clonado
**When** ejecuto `npm install && npm test`
**Then** se ejecutan las pruebas de Vitest del paquete `normativa` sin errores
**And** existen los tipos `FechaCivil`, `Pesos` (bigint), `Fundamento` y `ErrorNormativo`
**And** `npm run typecheck` pasa en modo estricto.

### Story 1.2: Calendario de festivos de Colombia

As a abogado de contratación,
I want que el sistema conozca todos los festivos colombianos de cualquier año,
So that los plazos legales se calculen sin errores.

**Acceptance Criteria:**

**Given** un año entre 1984 y 2100
**When** consulto `festivosDeColombia(anio)`
**Then** obtengo 18 festivos con nombre y fecha
**And** los festivos de la Ley Emiliani se trasladan al lunes siguiente cuando no caen en lunes
**And** los resultados de 2024, 2025 y 2026 coinciden con el calendario oficial.

### Story 1.3: Aritmética de días hábiles

As a abogado de contratación,
I want sumar y contar días hábiles,
So that pueda calcular términos legales.

**Acceptance Criteria:**

**Given** una fecha y un número de días hábiles
**When** llamo `sumarDiasHabiles(fecha, n)`
**Then** el resultado excluye sábados, domingos y festivos (y festivos adicionales configurados)
**And** `n` negativo resta días hábiles
**And** `contarDiasHabiles(desde, hasta)` cuenta los días hábiles en el intervalo `(desde, hasta]`.

### Story 1.4: Cálculo de menor y mínima cuantía

As a abogado de contratación,
I want calcular la menor y mínima cuantía de la entidad,
So that pueda determinar la modalidad correcta.

**Acceptance Criteria:**

**Given** el presupuesto anual en pesos y el SMMLV de la vigencia
**When** llamo `calcularCuantias({ presupuestoAnual, smmlv })`
**Then** obtengo la menor cuantía en SMMLV y en pesos según la tabla del art. 2 num. 2 lit. b Ley 1150/2007
**And** la mínima cuantía es el 10 % de la menor cuantía (art. 94 Ley 1474/2011)
**And** las fronteras exactas (120.000, 400.000, 850.000, 1.200.000 SMMLV) quedan en el tramo superior.

### Story 1.5: Recomendación de modalidad de selección

As a abogado de contratación,
I want una recomendación de modalidad con su fundamento legal,
So that reduzca el riesgo de elegir mal la modalidad.

**Acceptance Criteria:**

**Given** tipo de objeto, valor estimado, cuantías y causales/banderas opcionales
**When** llamo `recomendarModalidad(entrada)`
**Then** se aplican las reglas en el orden de FR-4
**And** cada recomendación trae al menos un fundamento y la versión de reglas
**And** se generan las advertencias de FR-5 (pliego tipo, Mipyme, acuerdo marco, Ley de Garantías)
**And** un valor igual a la mínima cuantía resulta en Mínima Cuantía y un peso más no.

### Story 1.6: Generación y validación de cronogramas

As a abogado de contratación,
I want generar el cronograma de cada modalidad en días hábiles y validarlo si lo edito,
So that cumpla los términos legales mínimos.

**Acceptance Criteria:**

**Given** una modalidad y una fecha de inicio
**When** llamo `generarCronograma({ modalidad, inicio })`
**Then** obtengo hitos ordenados, todos en días hábiles, con fundamento legal
**And** `validarCronograma` reporta violaciones de términos mínimos y fechas no hábiles.

### Story 1.7: Validación de garantías mínimas

As a abogado de contratación,
I want validar los amparos de las garantías frente a los mínimos legales,
So that no apruebe pólizas insuficientes.

**Acceptance Criteria:**

**Given** un contrato con valor, fecha de terminación y garantías registradas
**When** llamo `validarGarantias(entrada)`
**Then** se reportan violaciones de valor asegurado o vigencia mínima para cumplimiento, anticipo, salarios y estabilidad de obra
**And** en Mínima Cuantía y Contratación Directa se indica que las garantías no son obligatorias si la entidad no las exigió.

### Story 1.8: Límite de adiciones y plazos de liquidación

As a supervisor,
I want saber si una adición supera el límite legal y cuándo vence cada plazo de liquidación,
So that evite modificaciones ilegales y pérdida de competencia para liquidar.

**Acceptance Criteria:**

**Given** el valor inicial y las adiciones con el SMMLV de su fecha
**When** llamo `validarAdicion(entrada)`
**Then** se rechaza si el acumulado en SMMLV supera el 50 % del valor inicial en SMMLV (parágrafo art. 40 Ley 80/1993)
**And** `calcularPlazosLiquidacion(entrada)` retorna fechas de liquidación bilateral, unilateral y límite final, e indica cuándo no es obligatoria.

## Epic 2: Plataforma API, seguridad y parámetros

API NestJS con PostgreSQL, autenticación, roles, parámetros anuales y bitácora de auditoría.

### Story 2.1: Esqueleto de la API con base de datos

As a desarrollador,
I want una API NestJS con Prisma y PostgreSQL ejecutable localmente con Docker Compose,
So that podamos construir los módulos de negocio.

**Acceptance Criteria:**

**Given** Docker disponible
**When** ejecuto `docker compose up` y `npm run dev -w apps/api`
**Then** `GET /salud` responde 200
**And** las migraciones se aplican automáticamente en desarrollo.

### Story 2.2: Autenticación y roles

As a administrador,
I want gestionar usuarios con los roles de FR-33,
So that cada persona solo haga lo que le corresponde.

**Acceptance Criteria:**

**Given** un usuario con rol Auditor
**When** intenta modificar un Proceso
**Then** recibe 403 en formato problem+json
**And** las contraseñas se guardan con argon2.

### Story 2.3: Parámetros anuales

As a administrador,
I want registrar SMMLV, presupuesto anual, umbral Mipyme y calendario electoral por vigencia,
So that el motor use valores vigentes.

**Acceptance Criteria:**

**Given** una vigencia sin SMMLV
**When** intento crear un Proceso
**Then** el sistema lo impide indicando el parámetro faltante
**And** `GET /vigencias/{anio}/cuantias` devuelve la menor y mínima cuantía calculadas por el motor.

### Story 2.4: Bitácora de auditoría

As a auditor,
I want que cada cambio relevante quede registrado de forma inmutable,
So that pueda reconstruir lo ocurrido.

**Acceptance Criteria:**

**Given** cualquier operación de escritura
**When** finaliza con éxito
**Then** existe un evento con usuario, acción, entidad afectada, fecha y diff
**And** el rol de base de datos de la app no puede actualizar ni borrar eventos.

## Epic 3: Plan Anual de Adquisiciones y Procesos de selección

### Story 3.1: Gestión del PAA

As a abogado de contratación,
I want crear y editar las líneas del PAA de una vigencia,
So that los procesos nazcan de una necesidad planeada.

**Acceptance Criteria:**

**Given** una vigencia con parámetros
**When** creo una línea PAA con UNSPSC y valor estimado
**Then** queda disponible con saldo igual a su valor.

### Story 3.2: Control de saldo del PAA

As a jefe de contratación,
I want que ningún proceso exceda el saldo de sus líneas PAA,
So that la planeación sea real.

**Acceptance Criteria:**

**Given** una línea con saldo $100
**When** un proceso intenta consumir $101
**Then** se rechaza salvo que exista una modificación del PAA registrada.

### Story 3.3: Crear proceso con recomendación de modalidad

As a abogado de contratación,
I want crear un proceso y aceptar o cambiar la modalidad recomendada,
So that la decisión quede justificada.

**Acceptance Criteria:**

**Given** un proceso nuevo
**When** el motor recomienda una modalidad y la cambio
**Then** la justificación es obligatoria y queda en la bitácora junto con entradas, salida y versión de reglas
**And** se muestran advertencias de posible fraccionamiento (FR-7).

### Story 3.4: Cronograma del proceso

As a abogado de contratación,
I want generar, editar y validar el cronograma del proceso,
So that no publique con términos violados.

**Acceptance Criteria:**

**Given** un cronograma con violaciones
**When** intento pasar el proceso a publicado
**Then** se impide y se listan las violaciones.

### Story 3.5: Flujos de estado por modalidad

As a abogado de contratación,
I want que cada modalidad siga su flujo con documentos obligatorios,
So that el proceso esté completo.

**Acceptance Criteria:**

**Given** un proceso de Licitación sin matriz de riesgos
**When** intento publicarlo
**Then** se impide indicando el documento faltante.

### Story 3.6: Adendas

As a abogado de contratación,
I want registrar adendas validando su oportunidad,
So that no expida adendas extemporáneas.

**Acceptance Criteria:**

**Given** una licitación con cierre en 2 días hábiles
**When** registro una adenda
**Then** se rechaza (mínimo 3 días hábiles antes del cierre).

### Story 3.7: Proponentes y evaluación

As a comité evaluador,
I want registrar ofertas y la verificación de requisitos habilitantes y puntajes,
So that el informe de evaluación sea trazable.

**Acceptance Criteria:**

**Given** ofertas registradas
**When** registro la evaluación
**Then** se calcula el orden de elegibilidad y se genera el informe con su término de traslado.

### Story 3.8: Adjudicación o declaratoria de desierto

As a ordenador del gasto,
I want adjudicar o declarar desierto el proceso,
So that se cierre la etapa de selección.

**Acceptance Criteria:**

**Given** una licitación declarada desierta
**When** registro el acto
**Then** el sistema sugiere iniciar Selección Abreviada por declaratoria de desierta.

## Epic 4: Contratos y ejecución

### Story 4.1: Crear contrato

As a abogado de contratación,
I want crear el contrato desde el proceso adjudicado,
So that inicie la etapa contractual.

**Acceptance Criteria:**

**Given** un proceso adjudicado
**When** creo el contrato
**Then** hereda contratista, valor y plazo, y exige supervisor y RP.

### Story 4.2: Garantías del contrato

As a abogado de contratación,
I want registrar y aprobar garantías validadas por el motor,
So that el contrato esté amparado.

**Acceptance Criteria:**

**Given** una garantía de cumplimiento por el 5 % del valor
**When** intento aprobarla
**Then** se rechaza por ser inferior al 10 %.

### Story 4.3: Acta de inicio

As a supervisor,
I want registrar el acta de inicio,
So that queden fijadas las fechas de ejecución.

**Acceptance Criteria:**

**Given** un contrato sin RP o garantías aprobadas exigidas
**When** intento registrar el acta de inicio
**Then** se impide.

### Story 4.4: Informes de supervisión

As a supervisor,
I want registrar informes periódicos con soportes,
So that quede evidencia del seguimiento.

**Acceptance Criteria:**

**Given** un contrato en ejecución
**When** registro un informe
**Then** queda en el expediente con su hash.

### Story 4.5: Pagos

As a financiero,
I want registrar pagos,
So that controle la ejecución financiera.

**Acceptance Criteria:**

**Given** un contrato de $100 con $90 pagados
**When** registro un pago de $20
**Then** se rechaza.

### Story 4.6: Modificaciones contractuales

As a supervisor,
I want registrar adiciones, prórrogas, suspensiones y cesiones,
So that el contrato refleje su estado real.

**Acceptance Criteria:**

**Given** adiciones acumuladas del 45 % en SMMLV
**When** registro una adición del 10 %
**Then** se rechaza por superar el 50 %.

### Story 4.7: Liquidación

As a abogado de contratación,
I want registrar la liquidación dentro de los plazos legales,
So that se cierre correctamente el contrato.

**Acceptance Criteria:**

**Given** un contrato terminado
**When** consulto su liquidación
**Then** veo los plazos bilateral, unilateral y límite calculados por el motor.

## Epic 5: Expediente, alertas e interoperabilidad

### Story 5.1: Documentos del expediente

As a abogado de contratación,
I want cargar documentos tipificados con versión y hash,
So that el expediente sea íntegro.

**Acceptance Criteria:**

**Given** un documento cargado
**When** cargo una nueva versión
**Then** se conservan ambas versiones con su SHA-256.

### Story 5.2: Exportar expediente

As a auditor,
I want descargar el expediente completo,
So that pueda revisarlo fuera del sistema.

**Acceptance Criteria:**

**Given** un contrato con documentos
**When** exporto el expediente
**Then** obtengo un ZIP con índice PDF, documentos y bitácora.

### Story 5.3: Alertas de vencimiento

As a jefe de contratación,
I want ver alertas de garantías, plazos y liquidaciones próximas a vencer,
So that actúe a tiempo.

**Acceptance Criteria:**

**Given** una garantía que vence en 15 días
**When** abro el tablero
**Then** aparece la alerta y se envía correo al responsable.

### Story 5.4: Ley de Garantías

As a jefe de contratación,
I want que el sistema restrinja la contratación directa en periodos electorales,
So that cumpla la Ley 996 de 2005.

**Acceptance Criteria:**

**Given** un calendario electoral configurado
**When** creo una Contratación Directa dentro del periodo restringido
**Then** se bloquea salvo excepción legal justificada.

### Story 5.5: Exportación de datos y PAA

As a jefe de contratación,
I want exportar el PAA y los datos de procesos y contratos,
So that los cargue en SECOP II y publique datos abiertos.

**Acceptance Criteria:**

**Given** un PAA con líneas
**When** lo exporto
**Then** obtengo un archivo en el formato de cargue de SECOP II.

## Epic 6: Interfaz web

### Story 6.1: Aplicación web y autenticación

As a usuario,
I want ingresar a una aplicación web en español,
So that use SICOP desde el navegador.

**Acceptance Criteria:**

**Given** credenciales válidas
**When** inicio sesión
**Then** veo el tablero según mi rol
**And** la interfaz cumple WCAG 2.1 AA en las pantallas base.

### Story 6.2: Tablero de alertas

As a jefe de contratación,
I want un tablero con alertas y estado de procesos y contratos,
So that tenga visibilidad general.

**Acceptance Criteria:**

**Given** alertas activas
**When** abro el tablero
**Then** las veo ordenadas por vencimiento.

### Story 6.3: Pantallas de PAA y procesos

As a abogado de contratación,
I want pantallas para PAA, procesos, modalidad y cronograma,
So that opere los flujos de la Épica 3.

**Acceptance Criteria:**

**Given** un proceso
**When** genero el cronograma
**Then** veo cada hito con su fundamento y las violaciones resaltadas.

### Story 6.4: Pantallas de contratos y ejecución

As a supervisor,
I want pantallas para contratos, garantías, informes, pagos y modificaciones,
So that opere los flujos de la Épica 4.

**Acceptance Criteria:**

**Given** un contrato en ejecución
**When** abro su ficha
**Then** veo garantías, pagos, modificaciones e informes con sus alertas.
