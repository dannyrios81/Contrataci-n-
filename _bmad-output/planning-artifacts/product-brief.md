---
title: Product Brief — SICOP (Sistema de Contratación Pública)
created: 2026-10-06
status: final
workflow: bmad-product-brief
---

# Product Brief: SICOP — Sistema de Gestión de Contratación Pública para Colombia

*Nombre de trabajo — confirmar.*

## Executive Summary

SICOP es un software para que las **entidades estatales colombianas** gestionen el ciclo completo de sus procesos de contratación — planeación, selección, contratación, ejecución y liquidación — con las reglas del Estatuto General de Contratación (Ley 80 de 1993, Ley 1150 de 2007, Ley 1474 de 2011, Ley 1882 de 2018, Ley 2022 de 2020, Ley 2195 de 2022 y el Decreto 1082 de 2015) codificadas como un motor de reglas verificable.

Hoy las oficinas de contratación trabajan entre SECOP II, hojas de Excel, correos y carpetas compartidas. SECOP II es el sistema oficial de publicidad y transacción, pero no es una herramienta de gestión interna: no le dice al abogado qué modalidad corresponde, no calcula cronogramas en días hábiles con festivos colombianos, no controla que el Plan Anual de Adquisiciones tenga cupo, ni alerta cuando vence una garantía o el plazo para liquidar. Esos errores terminan en procesos viciados, hallazgos de la Contraloría y sanciones disciplinarias.

SICOP es la capa de gestión que va **antes y alrededor** de SECOP II: asiste la decisión jurídica, mantiene el expediente contractual completo y trazable, y deja lista la información para publicar en SECOP II.

## The Problem

- **Errores en la modalidad de selección.** Elegir la modalidad depende del objeto, la cuantía y del presupuesto anual de la entidad expresado en SMMLV (art. 2 Ley 1150/2007). Un cálculo mal hecho de la menor cuantía o de la mínima cuantía (10 % de la menor cuantía, art. 94 Ley 1474/2011) invalida el proceso.
- **Cronogramas mal calculados.** Los términos legales se cuentan en días hábiles, con festivos que se trasladan por la Ley Emiliani (Ley 51 de 1983) y Semana Santa móvil. Publicar una adenda fuera de término o dar traslado del informe de evaluación por menos días de los que exige la ley es causal frecuente de observaciones.
- **Expediente disperso.** Estudios previos, CDP, RP, pólizas, actas e informes de supervisión viven en lugares distintos; armar el expediente para un órgano de control toma días.
- **Ejecución sin seguimiento.** Vencimientos de garantías, prórrogas, adiciones (límite del 50 % del valor inicial en SMMLV, parágrafo art. 40 Ley 80) y el plazo de liquidación (art. 11 Ley 1150, art. 60 Ley 80) se controlan a mano.

## The Solution

1. **Motor normativo** que, dados el objeto, la cuantía y los datos de la entidad, recomienda la modalidad de selección con su fundamento legal y genera el cronograma con días hábiles reales.
2. **Plan Anual de Adquisiciones (PAA)** con códigos UNSPSC, ligado a cada proceso y con control de saldo.
3. **Gestión de procesos por modalidad**: licitación pública, selección abreviada (menor cuantía y subasta inversa), concurso de méritos, contratación directa y mínima cuantía, con flujos, documentos y controles propios.
4. **Expediente electrónico del contrato** con trazabilidad (quién, qué, cuándo) y control de versiones.
5. **Ejecución y supervisión**: garantías, pagos, modificaciones con límites legales, informes de supervisión, alertas y liquidación.
6. **Interoperabilidad con SECOP II** (exportación de datos en v1; integración vía datos abiertos y APIs disponibles en versiones posteriores).

## What Makes This Different

- Las reglas legales son **código con pruebas**, versionado y con la cita normativa en cada decisión — no conocimiento tribal del abogado de turno.
- Los parámetros que cambian cada año (SMMLV, UVT, umbrales Mipyme, presupuesto de la entidad) son **datos configurables**, no constantes en el código.
- Diseñado para **entidades pequeñas y medianas** (alcaldías de categoría 4–6, ESE, instituciones educativas) que no tienen un ERP costoso.

Honestidad: el diferenciador es ejecución y foco en el dominio, no tecnología propietaria.

## Who This Serves

- **Abogado/profesional de contratación** (usuario primario): estructura procesos, necesita certeza jurídica y cronogramas correctos.
- **Ordenador del gasto** (alcalde, gerente, secretario): aprueba y firma; necesita ver estado y riesgos.
- **Supervisor/interventor**: registra seguimiento, informes y novedades de ejecución.
- **Área financiera/presupuesto**: emite CDP y RP, registra pagos.
- **Control interno / órganos de control**: consultan expedientes completos y trazables (solo lectura).

## Success Criteria

- 0 procesos con modalidad mal determinada entre los asistidos por el motor (validado por abogado revisor).
- Cronograma generado en < 1 minuto vs. ~1 hora manual.
- Expediente exportable completo en < 5 minutos.
- 100 % de garantías y plazos de liquidación con alerta antes del vencimiento.

## Scope

**Dentro (v1/MVP):** motor normativo (modalidades, cuantías, días hábiles, cronogramas), PAA, gestión de procesos para las 5 modalidades, expediente electrónico, ejecución básica (garantías, pagos, modificaciones, liquidación), usuarios y roles, auditoría.

**Fuera (v1):** firma digital certificada, integración transaccional en línea con SECOP II, regímenes especiales (ESP, universidades, empresas industriales y comerciales del Estado, convenios con organismos internacionales), contratación de la Ley 2160 de 2021 con cabildos indígenas, nómina/contabilidad pública.

## Vision

En 2–3 años, SICOP es el estándar de gestión contractual para entidades territoriales pequeñas: multi-entidad (SaaS), integrado con SECOP II, con pliegos tipo de Colombia Compra Eficiente precargados, analítica de riesgos de corrupción (alertas de oferente único, fraccionamiento de contratos) y asistencia de IA para redactar estudios previos con citas verificables.
