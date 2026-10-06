import { describe, expect, it } from 'vitest';
import { ErrorNormativo } from '../base/tipos.js';
import { validarAdicion } from './adiciones.js';
import { calcularPlazosLiquidacion } from './liquidacion.js';

const S25 = 1_423_500n;
const S26 = 1_750_905n;

describe('adiciones (parágrafo art. 40 Ley 80)', () => {
  it('permite exactamente el 50 % y rechaza un peso más', () => {
    const base = { valorInicial: { valor: 100_000_000n, smmlv: S25 }, adicionesPrevias: [] };
    expect(validarAdicion({ ...base, nuevaAdicion: { valor: 50_000_000n, smmlv: S25 } }).permitida).toBe(true);
    const r = validarAdicion({ ...base, nuevaAdicion: { valor: 50_000_001n, smmlv: S25 } });
    expect(r.permitida).toBe(false);
    expect(r.fundamentos[0]).toEqual({ norma: 'Ley 80 de 1993', articulo: '40 par.' });
  });

  it('Story 4.6: 45 % acumulado + 10 % se rechaza', () => {
    const r = validarAdicion({
      valorInicial: { valor: 100_000_000n, smmlv: S25 },
      adicionesPrevias: [{ valor: 45_000_000n, smmlv: S25 }],
      nuevaAdicion: { valor: 10_000_000n, smmlv: S25 },
    });
    expect(r.permitida).toBe(false);
    expect(r.porcentajeAcumulado).toBe(55);
  });

  it('expresa las adiciones en SMMLV de su vigencia', () => {
    // 60 millones en 2026 equivalen a menos SMMLV que en 2025: 60e6/1.750.905 ≈ 34,27 vs 50 % de 70,25.
    const r = validarAdicion({
      valorInicial: { valor: 100_000_000n, smmlv: S25 },
      adicionesPrevias: [],
      nuevaAdicion: { valor: 60_000_000n, smmlv: S26 },
    });
    expect(r.permitida).toBe(true);
    expect(r.porcentajeAcumulado).toBeCloseTo(48.78, 2);
  });

  it('interventoría prorrogada con el vigilado no tiene el límite', () => {
    const r = validarAdicion({
      valorInicial: { valor: 100_000_000n, smmlv: S25 },
      adicionesPrevias: [],
      nuevaAdicion: { valor: 80_000_000n, smmlv: S25 },
      interventoriaProrrogadaConVigilado: true,
    });
    expect(r.permitida).toBe(true);
    expect(r.fundamentos[0]?.norma).toBe('Ley 1474 de 2011');
  });

  it('valida entradas', () => {
    expect(() =>
      validarAdicion({ valorInicial: { valor: 1n, smmlv: S25 }, adicionesPrevias: [], nuevaAdicion: { valor: 0n, smmlv: S25 } }),
    ).toThrow(ErrorNormativo);
  });
});

describe('plazos de liquidación', () => {
  it('sin plazo pactado: 4 meses bilateral, 2 unilateral, 2 años más', () => {
    const p = calcularPlazosLiquidacion({ fechaTerminacion: '2026-06-30' });
    expect(p).toMatchObject({
      obligatoria: true,
      bilateralHasta: '2026-10-30',
      unilateralHasta: '2026-12-30',
      limite: '2028-12-30',
    });
  });

  it('respeta el plazo pactado', () => {
    const p = calcularPlazosLiquidacion({ fechaTerminacion: '2026-01-31', plazoPactadoMeses: 6 });
    expect(p.bilateralHasta).toBe('2026-07-31');
    expect(p.unilateralHasta).toBe('2026-09-30');
  });

  it('determina la etapa según la fecha de referencia', () => {
    const etapa = (hoy: `${number}-${number}-${number}`) => calcularPlazosLiquidacion({ fechaTerminacion: '2026-06-30', hoy }).etapa;
    expect(etapa('2026-06-30')).toBe('EN_EJECUCION');
    expect(etapa('2026-07-01')).toBe('BILATERAL');
    expect(etapa('2026-10-31')).toBe('UNILATERAL');
    expect(etapa('2027-01-15')).toBe('CUALQUIER_TIEMPO');
    expect(etapa('2028-12-31')).toBe('VENCIDA');
  });

  it('servicios profesionales: liquidación no obligatoria', () => {
    const p = calcularPlazosLiquidacion({ fechaTerminacion: '2026-06-30', serviciosProfesionalesApoyoGestion: true });
    expect(p.obligatoria).toBe(false);
    expect(p.fundamentos.map((f) => f.norma)).toContain('Ley 80 de 1993');
  });

  it('valida entradas', () => {
    expect(() => calcularPlazosLiquidacion({ fechaTerminacion: '2026-06-30', plazoPactadoMeses: -1 })).toThrow(ErrorNormativo);
    expect(() => calcularPlazosLiquidacion({ fechaTerminacion: '2026-06-31' })).toThrow(ErrorNormativo);
  });
});
