---
title: Revisión adversarial del PRD de SICOP
date: 2026-10-06
workflow: bmad-review
lenses: [adversarial]
content: _bmad-output/planning-artifacts/prd.md
findings: 26
---

# Revisión adversarial — PRD SICOP

Lente: **Adversarial** (solicitada explícitamente). Contenido: documento (PRD). 26 hallazgos, sin orden de severidad (convención BMAD). Las citas legales marcadas [VERIFICAR] son inciertas y requieren abogado.

## A. Contradicciones internas y con el código

**A1. §2.3 UJ-1 (caso borde) vs FR-4 regla 3**
- Problema: UJ-1 dice que la consultoría va a Concurso de Méritos "sin importar la cuantía", pero FR-4 reordenado (y `recomendar.ts` R3) aplica Mínima Cuantía antes.
- Corrección: "si es consultoría y supera la Mínima Cuantía → Concurso de Méritos; si no, Mínima Cuantía (art. 94 Ley 1474/2011)". Revisar el PRD contra cada entrada del changelog.
- Consecuencia: pruebas de aceptación y validación jurídica contradicen el motor; alguien "corrige" el motor hacia la versión errónea.

**A2. §4.7 FR-27 vs `ejecucion/adiciones.ts`**
- Problema: el motor exceptúa del tope del 50 % a la interventoría prorrogada con el vigilado (art. 85 Ley 1474/2011), pero el PRD no lo menciona.
- Corrección: añadir la excepción a FR-27 [VERIFICAR alcance], con criterio de aceptación y control de quién marca la bandera y con qué soporte.
- Consecuencia: comportamiento con efecto jurídico (saltarse el tope) sin requisito, validación ni control de permisos.

**A3. §4.2 FR-5 / UJ-1 (pliego tipo) vs `recomendar.ts`**
- Problema: el PRD dice "obligatorio" para obra/interventoría sin condiciones; el código lo extiende a consultoría y lo formula como "verifique si CCE adoptó un documento tipo".
- Corrección: FR-5 condicionado a un **catálogo versionado de documentos tipo** (objeto × modalidad × vigencia) como dato configurable (Ley 2022/2020; Ley 2195/2022 [VERIFICAR]).
- Consecuencia: advertencias falsas u omitidas; apartarse de un documento tipo obligatorio puede generar nulidad o sanción disciplinaria.

**A4. §6.1 Alcance MVP vs `epics.md` (mapa de cobertura)**
- Problema: §6.1 asigna FR-1..5 y FR-8..10 a la Épica 1; las épicas ponen FR-1/FR-3 en la Épica 2 y FR-11, 22, 27, 28 (reglas) en la Épica 1.
- Corrección: reemplazar §6.1 por la misma tabla FR→Épica de `epics.md` (o referenciarla) y explicitar los FR fuera del MVP.
- Consecuencia: alcance ambiguo, dos "fuentes de verdad", huecos de pruebas.

**A5. Frontmatter `status: final` / §9 / §10**
- Problema: "final" con preguntas que bloquean producción; la monoentidad es a la vez supuesto (§3) y pregunta abierta (§9.1); supuestos implícitos sin indexar (moneda COP, registro manual frente a SECOP II, definición de presupuesto, conteo de días hábiles).
- Corrección: estado "aprobado condicionado", con responsable y fecha por pregunta; la validación jurídica (§9.3) como condición de salida a producción; indexar todos los supuestos.
- Consecuencia: decisiones abiertas tratadas como cerradas; el motor llega a producción sin la validación jurídica de la que depende la advertencia de §0.

**A6. FR-6 vs FR-11, FR-27, FR-35 — política de bloqueo**
- Problema: no hay una regla coherente de bloquear o advertir: la modalidad se cambia libremente, las adiciones se bloquean sin anulación, la Ley de Garantías se bloquea con anulación y el cronograma solo bloquea al publicar.
- Corrección: política única de niveles (informar / advertir / bloquear con anulación / bloqueo duro), indicando quién puede anular y con qué evidencia, siempre con evento de auditoría.
- Consecuencia: bloqueos de actuaciones legales legítimas o anulaciones sin control; responsabilidad difusa entre proveedor y entidad.

## B. Vacíos normativos (funcionalidades ausentes)

**B1. Régimen sancionatorio (ausente)**: multas, cláusula penal, caducidad, siniestro, audiencia del art. 86 Ley 1474/2011, reporte a Cámara de Comercio/RUP y SECOP (art. 6 Ley 1150; art. 218 Decreto 19/2012 [VERIFICAR]). → Añadir una funcionalidad "Incumplimiento" con estados y alertas de plazos. *Consecuencia:* incumplimientos sin sancionar a tiempo o con debido proceso vulnerado.

**B2. Urgencia manifiesta**: solo es una bandera. Falta el acto motivado y la remisión inmediata al control fiscal (arts. 42-43 Ley 80). → Añadir un FR con tarea, alerta y evidencia de envío [VERIFICAR plazos]. *Consecuencia:* la modalidad más auditada queda sin controles.

**B3. FR-18 Proponentes**: no verifica RUP, inhabilidades (art. 8 Ley 80; Ley 1474), antecedentes ni desempate legal (Ley 816/2003, art. 35 Ley 2069/2020 [VERIFICAR]). → Añadir lista de chequeo de habilitantes por modalidad y desempate en el orden legal. *Consecuencia:* contratar con un inhábil, que es causal de nulidad absoluta (art. 44 Ley 80).

**B4. FR-22 Garantías incompletas**: faltan seriedad, RCE por tramos de SMMLV, calidad, pago anticipado y la ampliación de vigencia por suspensión, aunque el glosario los lista. → Añadir una tabla completa de amparos (valor, base, vigencia, norma). *Consecuencia:* pólizas insuficientes cuyo riesgo asume la entidad.

**B5. Anticipo y pagos (FR-21/FR-26)**: falta el tope de anticipo del 50 %, el patrimonio autónomo del art. 91 Ley 1474 y la verificación de aportes a seguridad social antes de cada pago (art. 50 Ley 789/2002; art. 23 Ley 1150). *Consecuencia:* pagos ilegales y hallazgos fiscales.

**B6. Supervisión vs interventoría**: no se exige interventoría para obra adjudicada por licitación (arts. 83-84 Ley 1474 [VERIFICAR]), no se registran la designación y el cambio de supervisor, ni se controla el doble rol. *Consecuencia:* obras sin la vigilancia legal y sin trazabilidad del responsable.

**B7. FR-35 Ley de Garantías**: no modela las excepciones del art. 33 ni las restricciones de nómina, y no define quién anula. → Usar periodos versionados, un catálogo de excepciones y anulación solo por el Ordenador del Gasto con soporte. *Consecuencia:* bloqueos indebidos o contratación prohibida autorizada con un clic.

**B8. FR-28 Liquidación**: no define el hecho que inicia el cómputo (terminación anticipada, caducidad) y mezcla los 30 meses con la caducidad del medio de control (art. 164 CPACA). → Definir la fecha de inicio y añadir casos de prueba con terminación anticipada. *Consecuencia:* alertas desde una fecha errónea y pérdida de competencia para liquidar.

**B9. Vigencias futuras y presupuesto**: el PAA, el CDP y el RP son de una sola vigencia, sin contratos plurianuales (Ley 819/2003; Ley 1483/2011 [VERIFICAR]); las adiciones no exigen nuevo CDP/RP. *Consecuencia:* compromisos sin respaldo presupuestal y control de saldo incorrecto.

**B10. FR-2 Presupuesto Anual ambiguo**: no dice si es el presupuesto inicial o el definitivo, ni qué pasa si cambia en la vigencia. → Cada Proceso guarda la cuantía vigente a su apertura; registrarlo como [SUPUESTO]. *Consecuencia:* modalidades distintas para el mismo valor sin poder explicárselo a un auditor.

**B11. FR-4 reglas 2 y 6**: la obligatoriedad del Acuerdo Marco depende del orden de la entidad (nacional/territorial [VERIFICAR]), y varias causales de SA tienen procedimiento propio, no el de menor cuantía. → Parametrizar por orden de la entidad y mapear cada causal a su procedimiento del Decreto 1082. *Consecuencia:* modalidad o procedimiento viciados "recomendados" por el sistema.

**B12. FR-10 Cronograma incompleto**: faltan aviso de convocatoria, veedurías, respuesta a observaciones, sorteo, solicitudes Mipyme, subsanación (Ley 1882/2018) y sobre económico; la directa no tiene plazos verificables. → Convertir FR-10 en una tabla por modalidad validada por abogado. *Consecuencia:* un cronograma "sin violaciones" que omite actuaciones obligatorias; SM-2 queda engañosa.

**B13. FR-20 Publicidad**: no dice si los "3 días" son hábiles o calendario, ni exige evidencia (URL/ID de SECOP II). *Consecuencia:* falsa sensación de cumplir el principio de publicidad.

**B14. Convenios (Decreto 092/2017, art. 96 Ley 489/1998)**: no se cubren ni se excluyen en §5; la Ley 2195/2022 se cita sin ningún FR que derive de ella. → Decidir: cubrirlos o declararlos no objetivo. *Consecuencia:* convenios forzados como "directa" y falsa garantía de cumplimiento.

## C. Calidad del requisito, métricas y NFR

**C1. FR-33 Roles**: no hay matriz de permisos ni segregación de funciones; faltan el comité evaluador, el jefe de contratación (usado en UJ-4), el interventor y el delegatario (art. 12 Ley 80). *Consecuencia:* una persona recomienda, anula y aprueba sin contrapeso.

**C2. §7 Métricas**: SM-1 mide aceptación, no corrección (es circular); no hay líneas base ni métodos; SM-3 no fija el tamaño del expediente. → SM-1 = concordancia con un conjunto de casos de referencia firmados por el abogado. *Consecuencia:* no hay criterio objetivo de salida a producción.

**C3. Trazabilidad UJ/FR/SM**: FR-12 a 24, 26, 28 a 31, 33 y 36 no tienen UJ ni SM, y muchos FR no tienen consecuencias verificables, aunque §0 las promete. *Consecuencia:* los agentes de desarrollo implementan según su propia interpretación.

**C4. §8 NFR operativos**: faltan disponibilidad, RPO/RTO, recuperación ante desastres, migración de contratos vigentes y una bitácora encadenada por hash con tiempo confiable. *Consecuencia:* pérdida del expediente (Ley 594/2000) y alertas ciegas a los contratos ya en ejecución.

**C5. NFR-5/NFR-7 y FR-30 a FR-32**: el conflicto entre habeas data y la retención no está resuelto; faltan la Ley 1712/2014 (clasificación y reserva), la Ley 527/1999 y el filtrado de documentos reservados en la exportación. *Consecuencia:* filtración de datos reservados, sanciones de la SIC y un expediente sin valor probatorio.

**C6. FR-1..FR-5 / NFR-3 Versionado normativo**: no se definen la vigencia temporal de las reglas, quién aprueba una versión ni qué versión aplica a un Proceso ya abierto. → Cada versión con fecha de vigor y aprobación del abogado; el Proceso se evalúa con la versión vigente a su apertura. *Consecuencia:* cambios legales que reescriben decisiones pasadas.
