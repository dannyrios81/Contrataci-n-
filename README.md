# SICOP — Sistema de Gestión de Contratación Pública (Colombia)

Software para que las entidades estatales colombianas gestionen el ciclo completo de su contratación —Plan Anual de Adquisiciones, selección, contrato, ejecución y liquidación— conforme al Estatuto General de Contratación de la Administración Pública (Ley 80 de 1993, Ley 1150 de 2007, Ley 1474 de 2011, Ley 1882 de 2018, Ley 2022 de 2020, Decreto 1082 de 2015).

> **Advertencia jurídica:** el motor normativo es una herramienta de apoyo. Las reglas y citas marcadas con `verificar: true` deben ser validadas por un abogado especialista en contratación estatal antes de su uso en producción.

## Método de desarrollo: BMAD

El proyecto se desarrolla con el [método BMAD](https://docs.bmad-method.org/) (v6, instalado en `_bmad/` con sus skills en `.claude/skills/`).

| Fase | Artefacto | Estado |
| --- | --- | --- |
| Análisis | [`product-brief.md`](_bmad-output/planning-artifacts/product-brief.md) | ✅ |
| Planeación | [`prd.md`](_bmad-output/planning-artifacts/prd.md) — FR-1..FR-36 | ✅ |
| Solución | [`architecture.md`](_bmad-output/planning-artifacts/architecture.md) — hexagonal, AD-1..AD-7 | ✅ |
| Épicas | [`epics.md`](_bmad-output/planning-artifacts/epics.md) — 6 épicas, 36 historias | ✅ |
| Sprint | [`sprint-status.yaml`](_bmad-output/implementation-artifacts/sprint-status.yaml) | Épica 1 en revisión |

Siguiente paso recomendado: `bmad-code-review` sobre la Épica 1 y luego `bmad-build` para la Story 2.1. Use `bmad-help` para orientarse.

## Estructura

```text
packages/normativa/   Motor Normativo puro (Épica 1)
apps/api/             API NestJS + PostgreSQL (Épica 2, pendiente)
apps/web/             Interfaz web (Épica 6, pendiente)
_bmad-output/         Artefactos BMAD de planeación e implementación
```

## Motor Normativo (`@sicop/normativa`)

| Módulo | Qué hace |
| --- | --- |
| `calendario` | Los 18 festivos de Colombia (Ley 51 de 1983, Pascua) y aritmética de días hábiles |
| `cuantias` | Menor cuantía según presupuesto en SMMLV (art. 2 Ley 1150) y mínima cuantía (art. 94 Ley 1474) |
| `modalidades` | Recomendación de modalidad con fundamento legal y advertencias (pliego tipo, Mipyme, acuerdo marco, Ley de Garantías) |
| `cronogramas` | Cronogramas por procedimiento en días hábiles y validación de términos |
| `garantias` | Validación de amparos mínimos (Decreto 1082 de 2015) |
| `ejecucion` | Límite del 50 % en adiciones (art. 40 Ley 80) y plazos de liquidación (art. 11 Ley 1150) |

```ts
import { calcularCuantias, recomendarModalidad, generarCronograma } from '@sicop/normativa';

const cuantias = calcularCuantias({ presupuestoAnual: 40_000_000_000n, smmlv: 1_423_500n });
const r = recomendarModalidad({ tipoObjeto: 'OBRA', valorEstimado: 1_200_000_000n, cuantias });
// r.modalidad === 'LICITACION_PUBLICA', r.fundamentos, r.advertencias (PLIEGO_TIPO)
const cronograma = generarCronograma({ procedimiento: r.procedimiento, inicio: '2026-11-03' });
```

## Desarrollo

```bash
npm install
npm test            # pruebas (Vitest)
npm run typecheck   # TypeScript estricto
npm run test:cobertura -w @sicop/normativa
```
