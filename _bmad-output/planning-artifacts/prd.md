---
title: SICOP — Sistema de Gestión de Contratación Pública
created: 2026-10-06
updated: 2026-10-06
status: final
changelog:
  - 2026-10-06: FR-4 reordenado durante la Story 1.5 (mínima cuantía aplica sin importar el objeto; acuerdo marco prevalece).
workflow: bmad-prd
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief.md
---

# PRD: SICOP — Sistema de Gestión de Contratación Pública (Colombia)
*Nombre de trabajo — confirmar.*

## 0. Propósito del documento

Este PRD es para el PM, el abogado experto en contratación que valida el dominio, el arquitecto y los agentes de desarrollo BMAD. Usa un vocabulario anclado en el Glosario (§3), agrupa los requisitos funcionales (FR) por funcionalidad, numerados de forma global, y marca los supuestos en línea con `[SUPUESTO: …]`, indexados en §9. Se construye sobre `product-brief.md`.

> **Advertencia jurídica.** Las citas normativas de este documento orientan el diseño; **todas deben ser validadas por un abogado especialista en contratación estatal** antes de usarse en producción. Las que tienen menor certeza llevan `[VERIFICAR]`. El sistema es una herramienta de apoyo: la decisión jurídica la toma y firma la entidad.

## 1. Visión

SICOP es la herramienta de gestión interna de la contratación de una entidad estatal colombiana sometida al Estatuto General de Contratación de la Administración Pública. Acompaña al equipo de contratación desde el Plan Anual de Adquisiciones hasta la liquidación del contrato, recomendando la modalidad de selección correcta con su fundamento legal, generando cronogramas en días hábiles con el calendario de festivos colombiano, y manteniendo un expediente electrónico trazable.

La normativa (Ley 80/1993, Ley 1150/2007, Ley 1474/2011, Ley 1882/2018, Ley 2022/2020, Ley 2195/2022, Decreto 1082/2015) se implementa como un **motor normativo** independiente, puro y probado, cuyos parámetros anuales (SMMLV, presupuesto de la entidad, umbrales) son datos versionados.

## 2. Usuario objetivo

### 2.1 Jobs To Be Done
- *Funcional:* “Cuando estructuro un proceso, quiero saber con certeza qué modalidad aplica y qué plazos debo respetar, para no viciar el proceso.”
- *Funcional:* “Cuando un órgano de control pide un expediente, quiero entregarlo completo en minutos.”
- *Emocional:* “Quiero dormir tranquilo sabiendo que ninguna garantía o plazo de liquidación se me vence sin aviso.”
- *Social:* “Como ordenador del gasto, quiero demostrar transparencia ante la comunidad y los entes de control.”

### 2.2 No usuarios (v1)
- Proponentes/contratistas externos (interactúan por SECOP II, no por SICOP).
- Entidades con régimen especial de contratación (ESP, universidades públicas autónomas, EICE en competencia, Ecopetrol, etc.).

### 2.3 Recorridos de usuario clave

- **UJ-1. Laura determina la modalidad de un proceso de obra.**
  Laura, abogada de la Secretaría Jurídica de un municipio de 5.ª categoría, inicia sesión y crea un Proceso desde una línea del PAA: “Pavimentación vía rural”, obra pública, $ 1.200 millones. El sistema toma el presupuesto anual de la entidad en SMMLV, calcula la menor cuantía (280 SMMLV) y recomienda **Licitación Pública** citando el art. 2 de la Ley 1150/2007, e indica que debe usar el **pliego tipo** de obra (Ley 2022/2020). Laura acepta la recomendación y queda registrada con su usuario y fecha. **Caso borde:** si el objeto es consultoría, el motor recomienda Concurso de Méritos sin importar la cuantía.

- **UJ-2. Laura genera el cronograma.**
  Desde el Proceso, pulsa “Generar cronograma” con fecha de publicación del proyecto de pliego 2026‑11‑03. El sistema calcula cada hito en días hábiles (excluyendo sábados, domingos y festivos, incluyendo los trasladados por Ley Emiliani), muestra la norma de cada plazo y advierte si un hito cae en un día no hábil o viola un término mínimo. Laura ajusta el plazo de cierre y el sistema revalida.

- **UJ-3. Carlos, supervisor, registra un informe y solicita una adición.**
  Carlos sube el informe mensual de supervisión y solicita una adición del 30 %. El sistema calcula el acumulado de adiciones expresado en SMMLV frente al valor inicial y bloquea si supera el 50 % (parágrafo art. 40 Ley 80/1993).

- **UJ-4. Marta, jefe de contratación, revisa alertas.**
  En su tablero ve: 2 garantías que vencen en 15 días, 1 contrato que entra en los últimos 2 meses del plazo de liquidación unilateral, y un aviso de que la Ley de Garantías (Ley 996/2005) restringirá la contratación directa a partir de una fecha configurada.

- **UJ-5. Control interno exporta un expediente.**
  Un auditor con rol de solo lectura abre un Contrato y descarga el Expediente completo (índice, documentos, bitácora de auditoría) en un ZIP con índice PDF.

## 3. Glosario

- **Entidad** — Entidad estatal que usa SICOP. Tiene un Presupuesto Anual por Vigencia. Una instalación v1 atiende una Entidad `[SUPUESTO: monoentidad en v1]`.
- **Vigencia** — Año fiscal (1 ene – 31 dic).
- **SMMLV** — Salario Mínimo Mensual Legal Vigente de una Vigencia, fijado por decreto.
- **Presupuesto Anual** — Presupuesto de la Entidad para una Vigencia, expresado en pesos y en SMMLV; determina la Menor Cuantía.
- **Menor Cuantía** — Tope en SMMLV calculado según el Presupuesto Anual (art. 2 num. 2 lit. b Ley 1150/2007).
- **Mínima Cuantía** — Valor que no excede el 10 % de la Menor Cuantía (art. 94 Ley 1474/2011).
- **Modalidad** — Una de: Licitación Pública, Selección Abreviada (con Causal), Concurso de Méritos, Contratación Directa (con Causal), Mínima Cuantía.
- **Causal** — Supuesto legal específico que habilita una Modalidad (p. ej., “prestación de servicios profesionales” para Contratación Directa).
- **Tipo de Objeto** — Clasificación del objeto contractual: obra, consultoría, prestación de servicios, suministro/compraventa, bienes de características técnicas uniformes, arrendamiento, interadministrativo, etc.
- **Recomendación de Modalidad** — Salida del Motor Normativo: Modalidad, Causal, fundamento legal y advertencias.
- **Motor Normativo** — Componente puro que implementa las reglas legales; no tiene acceso a base de datos ni red.
- **Día Hábil** — Día de lunes a viernes que no es Festivo.
- **Festivo** — Día feriado en Colombia según Ley 51/1983 y Ley 37/1905, incluidos los trasladados al lunes.
- **Cronograma** — Lista ordenada de Hitos de un Proceso.
- **Hito** — Actuación del Proceso con fecha, fundamento legal y regla de plazo (p. ej., “traslado del informe de evaluación: 5 Días Hábiles”).
- **PAA** — Plan Anual de Adquisiciones de una Vigencia; compuesto por Líneas PAA.
- **Línea PAA** — Necesidad planeada con códigos UNSPSC, valor estimado, Modalidad estimada y fuente de recursos.
- **Proceso** — Proceso de contratación de una Modalidad, desde estudios previos hasta adjudicación/declaratoria de desierto. Se origina en una Línea PAA.
- **Estado del Proceso** — Etapa del flujo de la Modalidad (borrador, publicado, en evaluación, adjudicado, desierto, …).
- **CDP** — Certificado de Disponibilidad Presupuestal; requisito previo a abrir un Proceso.
- **RP** — Registro Presupuestal; requisito de ejecución del Contrato.
- **Contrato** — Resultado de un Proceso adjudicado; tiene Contratista, valor inicial, plazo, Supervisor y Garantías.
- **Garantía** — Póliza/amparo (cumplimiento, salarios, estabilidad, calidad, RCE, anticipo, seriedad) con valor y vigencia.
- **Modificación** — Adición, prórroga, suspensión, cesión o modificación de cláusulas de un Contrato.
- **Supervisor** — Servidor que vigila la ejecución; registra Informes de Supervisión.
- **Liquidación** — Corte de cuentas final del Contrato (bilateral, unilateral o judicial).
- **Expediente** — Conjunto ordenado de Documentos y Eventos de Auditoría de un Proceso y su Contrato.
- **Evento de Auditoría** — Registro inmutable de quién hizo qué y cuándo.
- **Alerta** — Notificación generada por el sistema por un vencimiento o restricción.
- **Ley de Garantías** — Restricciones de la Ley 996/2005 en periodos preelectorales.

## 4. Funcionalidades

### 4.1 Parámetros normativos y Entidad
**Descripción:** El administrador registra los datos de la Entidad y, por cada Vigencia, el SMMLV y el Presupuesto Anual. El Motor Normativo nunca usa constantes para valores que cambian por año. Realiza UJ-1.

#### FR-1: Registrar SMMLV por Vigencia
El administrador puede registrar el SMMLV de cada Vigencia con el decreto que lo fija.
**Consecuencias (verificables):**
- No se puede abrir un Proceso en una Vigencia sin SMMLV registrado.
- El sistema trae precargados los SMMLV históricos conocidos.

#### FR-2: Registrar Presupuesto Anual
El administrador puede registrar el Presupuesto Anual de la Entidad por Vigencia; el sistema lo expresa en SMMLV y calcula la Menor Cuantía y la Mínima Cuantía.
**Consecuencias:**
- Tabla de Menor Cuantía aplicada exactamente: ≥ 1.200.000 SMMLV → 1.000; ≥ 850.000 → 850; ≥ 400.000 → 650; ≥ 120.000 → 450; < 120.000 → 280 SMMLV.
- Mínima Cuantía = 10 % de la Menor Cuantía, en pesos, sin redondeos que la superen.

#### FR-3: Parámetros configurables adicionales
El administrador puede configurar: umbral Mipyme en pesos (Decreto 1860/2021), calendario electoral para la Ley de Garantías, y festivos adicionales decretados.

### 4.2 Motor de Modalidad de Selección
**Descripción:** Dados Tipo de Objeto, valor estimado, Vigencia, Causal opcional y banderas (urgencia manifiesta, único oferente, etc.), el Motor Normativo devuelve una Recomendación de Modalidad con fundamento legal y advertencias. El abogado acepta o la reemplaza justificando. Realiza UJ-1.

#### FR-4: Recomendar Modalidad
El Motor Normativo aplica, en este orden:
1. Causales de Contratación Directa declaradas (art. 2 num. 4 Ley 1150/2007) → Contratación Directa.
2. Bienes de características técnicas uniformes cubiertos por Acuerdo Marco de Precios vigente → Selección Abreviada por acuerdo marco (art. 2 num. 2 lit. a Ley 1150/2007; art. 2.2.1.2.1.2.7 Decreto 1082/2015).
3. Valor ≤ Mínima Cuantía → Mínima Cuantía, independientemente del objeto (art. 94 Ley 1474/2011).
4. Tipo de Objeto consultoría o interventoría (art. 32 num. 2 Ley 80/1993) → Concurso de Méritos, sin importar la cuantía.
5. Bienes/servicios de características técnicas uniformes → Selección Abreviada por subasta inversa o bolsa de productos (art. 2 num. 2 lit. a Ley 1150/2007).
6. Otras causales de Selección Abreviada (salud, licitación desierta, enajenación, etc.) → procedimiento de menor cuantía.
7. Valor ≤ Menor Cuantía → Selección Abreviada de Menor Cuantía.
8. Otros casos → Licitación Pública (regla general, art. 2 num. 1 Ley 1150/2007).
**Consecuencias:**
- Cada recomendación incluye al menos una cita normativa.
- Las reglas son deterministas: mismas entradas → misma salida.
- Prueba de frontera: valor exactamente igual a la Mínima Cuantía → Mínima Cuantía; un peso más → siguiente regla.

#### FR-5: Advertencias normativas
La Recomendación incluye advertencias cuando aplique: obra pública/interventoría → pliego tipo obligatorio (Ley 2022/2020); valor < umbral Mipyme → posible convocatoria limitada a Mipyme; bienes cubiertos por acuerdo marco → verificar Tienda Virtual del Estado Colombiano; periodo de Ley de Garantías → restricción de Contratación Directa.

#### FR-6: Registrar decisión
El abogado puede aceptar la recomendación o elegir otra Modalidad con justificación obligatoria; ambas quedan como Evento de Auditoría.

#### FR-7: Detección de posible fraccionamiento
El sistema advierte cuando, en la misma Vigencia, existen Procesos con el mismo código UNSPSC (segmento-familia-clase) cuya suma superaría el tope de la Modalidad elegida. `[SUPUESTO: heurística, no decisión jurídica]`

### 4.3 Calendario de Días Hábiles y Cronogramas
**Descripción:** El sistema calcula Festivos de Colombia para cualquier año y genera Cronogramas por Modalidad. Realiza UJ-2.

#### FR-8: Calendario de Festivos
El Motor Normativo calcula los 18 festivos anuales: fijos (1 ene, 1 may, 20 jul, 7 ago, 8 dic, 25 dic), trasladables al lunes siguiente (6 ene, 19 mar, 29 jun, 15 ago, 12 oct, 1 nov, 11 nov) y los basados en Pascua (Jueves y Viernes Santo; Ascensión, Corpus Christi y Sagrado Corazón trasladados a lunes).
**Consecuencias:** coincide con el calendario oficial de 2024, 2025 y 2026 en las pruebas.

#### FR-9: Aritmética de Días Hábiles
El Motor Normativo suma/resta Días Hábiles y cuenta Días Hábiles entre dos fechas.

#### FR-10: Generar Cronograma por Modalidad
A partir de una fecha de inicio, el sistema genera los Hitos de la Modalidad con sus plazos mínimos:
- **Licitación Pública:** proyecto de pliego publicado ≥ 10 Días Hábiles antes de la apertura; audiencia de riesgos/aclaraciones dentro de 3 Días Hábiles siguientes a la apertura; adendas a más tardar 3 Días Hábiles antes del cierre; traslado del informe de evaluación 5 Días Hábiles; adjudicación en audiencia pública.
- **Selección Abreviada de Menor Cuantía:** proyecto de pliego ≥ 5 Días Hábiles; manifestaciones de interés dentro de 3 Días Hábiles siguientes a la apertura; traslado del informe 3 Días Hábiles.
- **Concurso de Méritos:** proyecto de pliego ≥ 5 Días Hábiles; traslado del informe 3 Días Hábiles.
- **Mínima Cuantía:** invitación con plazo ≥ 1 Día Hábil para ofertas; informe publicado 1 Día Hábil.
- **Contratación Directa:** acto de justificación (cuando aplique), estudios previos, contrato.
**Consecuencias:** cada Hito tiene fundamento legal; ninguna fecha de Hito cae en día no hábil. `[VERIFICAR]` términos exactos de Decreto 1082/2015 Subsección 2.

#### FR-11: Validar Cronograma editado
El usuario puede editar fechas; el sistema reporta violaciones de términos mínimos y fechas no hábiles sin impedir guardar como borrador, pero sí impide publicar.

### 4.4 Plan Anual de Adquisiciones
#### FR-12: Gestionar PAA
El usuario puede crear la Vigencia del PAA y sus Líneas PAA (descripción, UNSPSC, valor estimado, fecha estimada, duración, Modalidad estimada, fuente de recursos).
#### FR-13: Control de saldo
Cada Proceso consume valor de una o varias Líneas PAA; el sistema impide exceder el saldo salvo con modificación registrada del PAA.
#### FR-14: Exportar PAA
Exportar el PAA en el formato de cargue de SECOP II (CSV/Excel). `[VERIFICAR]` formato vigente.

### 4.5 Gestión de Procesos
#### FR-15: Crear Proceso
Crear un Proceso desde Líneas PAA con objeto, Tipo de Objeto, valor estimado, CDP y Modalidad (vía FR-4/FR-6).
#### FR-16: Flujo por Modalidad
Cada Modalidad tiene una máquina de estados propia; las transiciones exigen documentos obligatorios (estudios previos, análisis del sector, matriz de riesgos, CDP, pliegos/invitación, informe de evaluación, acto de adjudicación).
#### FR-17: Adendas
Registrar adendas validando la regla de oportunidad de FR-10.
#### FR-18: Proponentes y ofertas
Registrar proponentes, ofertas y resultados de verificación de requisitos habilitantes y ponderables.
#### FR-19: Adjudicación o declaratoria de desierto
Registrar el acto; si es desierto en Licitación, sugerir Selección Abreviada por declaratoria de desierta (art. 2 num. 2 lit. d Ley 1150/2007) `[VERIFICAR]`.
#### FR-20: Publicidad
Registrar la fecha de publicación en SECOP II de cada documento y alertar si supera 3 días desde su expedición (art. 2.2.1.1.1.7.1 Decreto 1082/2015).

### 4.6 Contratos y Garantías
#### FR-21: Crear Contrato
Desde un Proceso adjudicado (o Contratación Directa), con contratista (NIT/CC), valor, plazo, Supervisor, RP.
#### FR-22: Garantías
Registrar Garantías por amparo y validar mínimos: cumplimiento ≥ 10 % del valor; buen manejo de anticipo 100 % del anticipo; salarios y prestaciones ≥ 5 % con vigencia plazo + 3 años; estabilidad de obra vigencia ≥ 5 años. `[VERIFICAR]` art. 2.2.1.2.3.1.x Decreto 1082/2015.
#### FR-23: Aprobación de garantías
El usuario autorizado aprueba Garantías; el Contrato no pasa a ejecución sin RP y Garantías aprobadas (cuando sean exigidas).
#### FR-24: Acta de inicio
Registrar el acta de inicio, que fija las fechas de ejecución.

### 4.7 Ejecución, Modificaciones y Liquidación
#### FR-25: Informes de supervisión
El Supervisor registra informes periódicos con documentos soporte. Realiza UJ-3.
#### FR-26: Pagos
Registrar pagos contra el Contrato; impedir pagar más del valor total.
#### FR-27: Modificaciones
Registrar adición, prórroga, suspensión/reinicio, cesión. Las adiciones acumuladas, expresadas en SMMLV, no pueden superar el 50 % del valor inicial en SMMLV (parágrafo art. 40 Ley 80/1993). Realiza UJ-3.
#### FR-28: Liquidación
Calcular plazos: el pactado o 4 meses tras terminación (bilateral), 2 meses siguientes (unilateral), y límite de 30 meses en total (art. 11 Ley 1150/2007; art. 164 CPACA). Contratos de prestación de servicios profesionales y de apoyo a la gestión: liquidación no obligatoria (art. 217 Decreto 19/2012).
#### FR-29: Cierre del expediente
Registrar cierre una vez vencidas las garantías post-contractuales.

### 4.8 Expediente, Auditoría y Seguridad
#### FR-30: Documentos
Cargar documentos tipificados con versión, hash SHA‑256 y metadatos.
#### FR-31: Bitácora de auditoría
Cada cambio de estado o dato relevante genera un Evento de Auditoría inmutable (append-only).
#### FR-32: Exportar Expediente
Exportar ZIP con índice PDF, documentos y bitácora. Realiza UJ-5.
#### FR-33: Roles
Roles: Administrador, Abogado de Contratación, Ordenador del Gasto, Financiero, Supervisor, Auditor (solo lectura). Permisos por acción.

### 4.9 Alertas
#### FR-34: Alertas de vencimiento
Garantías, plazo de ejecución, plazos de liquidación, publicaciones en SECOP pendientes. Realiza UJ-4.
#### FR-35: Ley de Garantías
Con el calendario electoral configurado, alertar y bloquear (con anulación justificada) la Contratación Directa en los 4 meses anteriores a la elección presidencial y hasta la segunda vuelta (art. 33 Ley 996/2005), y los convenios interadministrativos de entes territoriales en los 4 meses anteriores a elecciones (parágrafo art. 38) `[VERIFICAR]` excepciones.

### 4.10 Datos e Interoperabilidad
#### FR-36: Exportación de datos
Exportar Procesos y Contratos en CSV/JSON con campos alineados a los datos abiertos de SECOP II.

## 5. No objetivos
- No reemplaza a SECOP II ni recibe ofertas de proponentes.
- No es un sistema de presupuesto público (solo registra CDP/RP).
- No emite conceptos jurídicos vinculantes.
- No cubre regímenes especiales de contratación.

## 6. Alcance del MVP

### 6.1 Dentro
- Épica 1: Motor Normativo (FR-1..FR-5, FR-8..FR-10) como paquete independiente con pruebas.
- Épicas 2–6: API, PAA, Procesos, Contratos, Ejecución, Expediente, Alertas.

### 6.2 Fuera del MVP
- Integración en línea con SECOP II (v2 — depende de APIs disponibles).
- Firma digital certificada (v2).
- Multientidad / SaaS (v2).
- Asistencia de IA para estudios previos (v3).

## 7. Métricas de éxito

**Primarias**
- **SM-1**: % de Recomendaciones de Modalidad aceptadas sin cambio, validadas por abogado revisor — meta ≥ 95 %. Valida FR-4.
- **SM-2**: Cronogramas sin observaciones por términos — meta 100 %. Valida FR-8..FR-11.

**Secundarias**
- **SM-3**: Tiempo de exportación del Expediente < 5 min. Valida FR-32.
- **SM-4**: Garantías vencidas sin alerta previa = 0. Valida FR-34.

**Contra-métricas**
- **SM-C1**: No optimizar “procesos creados por día”: la velocidad no debe sacrificar validaciones. Contrapesa SM-2.

## 8. Requisitos no funcionales transversales
- **NFR-1 Exactitud:** el Motor Normativo tiene cobertura de pruebas ≥ 95 % de líneas y pruebas de frontera para cada umbral.
- **NFR-2 Dinero:** los valores monetarios se manejan como enteros en pesos (sin flotantes).
- **NFR-3 Trazabilidad:** toda decisión del motor guarda entradas, salida y versión de reglas.
- **NFR-4 Seguridad:** autenticación con contraseñas hash (argon2/bcrypt), sesiones con expiración, OWASP ASVS nivel 2.
- **NFR-5 Datos personales:** cumplimiento de la Ley 1581/2012 (habeas data).
- **NFR-6 Accesibilidad:** WCAG 2.1 AA; idioma español (Colombia).
- **NFR-7 Archivo:** retención según tablas de retención documental (Ley 594/2000).
- **NFR-8 Zona horaria:** America/Bogota para todas las fechas legales.

## 9. Preguntas abiertas
1. ¿Una entidad o varias por instalación desde v1?
2. ¿Despliegue en la nube del cliente o on‑premise?
3. ¿Qué abogado/entidad valida el motor normativo antes de producción?
4. ¿Se requiere integración con el sistema financiero de la entidad (p. ej., SIIF Nación o software territorial)?
5. Confirmar el formato vigente de cargue del PAA en SECOP II.

## 10. Índice de supuestos
- §3 — Monoentidad en v1.
- §4.2 FR-7 — La detección de fraccionamiento es una heurística, no una decisión jurídica.
- Todas las citas con `[VERIFICAR]` en §4.3, §4.4, §4.5, §4.6 y §4.9 requieren validación jurídica.
