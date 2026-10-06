import { describe, expect, it } from 'vitest';
import { ErrorNormativo } from '../base/tipos.js';
import { calcularCuantias } from './cuantias.js';
import { SMMLV_REFERENCIA, smmlvDeReferencia } from './smmlv.js';

const SMMLV = 1_423_500n; // 2025

describe('cuantías', () => {
  it.each([
    [1_200_000n, 1_000n],
    [1_199_999n, 850n],
    [850_000n, 850n],
    [849_999n, 650n],
    [400_000n, 650n],
    [399_999n, 450n],
    [120_000n, 450n],
    [119_999n, 280n],
    [1n, 280n],
  ])('presupuesto de %s SMMLV → menor cuantía %s SMMLV', (presupuestoSmmlv, esperado) => {
    const c = calcularCuantias({ presupuestoAnual: presupuestoSmmlv * SMMLV, smmlv: SMMLV });
    expect(c.menorCuantiaSmmlv).toBe(esperado);
    expect(c.menorCuantia).toBe(esperado * SMMLV);
    expect(c.minimaCuantia * 10n).toBe(c.menorCuantia);
  });

  it('un peso menos que el umbral cae en el tramo inferior', () => {
    const c = calcularCuantias({ presupuestoAnual: 120_000n * SMMLV - 1n, smmlv: SMMLV });
    expect(c.menorCuantiaSmmlv).toBe(280n);
  });

  it('municipio pequeño: presupuesto de $40.000 millones en 2025', () => {
    const c = calcularCuantias({ presupuestoAnual: 40_000_000_000n, smmlv: SMMLV });
    expect(c.presupuestoEnSmmlv).toBe(28_099n);
    expect(c.menorCuantia).toBe(398_580_000n);
    expect(c.minimaCuantia).toBe(39_858_000n);
    expect(c.fundamentos.map((f) => f.norma)).toContain('Ley 1474 de 2011');
  });

  it('rechaza valores no positivos', () => {
    expect(() => calcularCuantias({ presupuestoAnual: 0n, smmlv: SMMLV })).toThrow(ErrorNormativo);
    expect(() => calcularCuantias({ presupuestoAnual: 1n, smmlv: -1n })).toThrow(ErrorNormativo);
  });

  it('tabla de SMMLV de referencia ordenada y consultable', () => {
    const anios = SMMLV_REFERENCIA.map((s) => s.anio);
    expect(anios).toEqual([...anios].sort());
    expect(smmlvDeReferencia(2025)?.valor).toBe(1_423_500n);
    expect(smmlvDeReferencia(1999)).toBeUndefined();
  });
});
