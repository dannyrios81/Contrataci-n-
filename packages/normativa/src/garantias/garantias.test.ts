import { describe, expect, it } from 'vitest';
import { ErrorNormativo } from '../base/tipos.js';
import { minimoRce, validarGarantias, type Amparo, type EntradaGarantias } from './garantias.js';

const SMMLV = 1_423_500n;

const obra = (amparos: Amparo[], extra: Partial<EntradaGarantias> = {}): EntradaGarantias => ({
  modalidad: 'LICITACION_PUBLICA',
  tipoObjeto: 'OBRA',
  valorContrato: 1_000_000_000n,
  smmlv: SMMLV,
  fechaTerminacion: '2027-06-30',
  amparos,
  ...extra,
});

const completos: Amparo[] = [
  { tipo: 'CUMPLIMIENTO', valorAsegurado: 100_000_000n, vigenciaHasta: '2027-10-30' },
  { tipo: 'SALARIOS_PRESTACIONES', valorAsegurado: 50_000_000n, vigenciaHasta: '2030-06-30' },
  { tipo: 'ESTABILIDAD_CALIDAD_OBRA', valorAsegurado: 100_000_000n, vigenciaHasta: '2032-06-30' },
  { tipo: 'RESPONSABILIDAD_CIVIL_EXTRACONTRACTUAL', valorAsegurado: 200n * SMMLV, vigenciaHasta: '2027-06-30' },
];

describe('garantías', () => {
  it('acepta un paquete completo de obra', () => {
    const r = validarGarantias(obra(completos));
    expect(r.obligatorias).toBe(true);
    expect(r.violaciones).toEqual([]);
  });

  it('rechaza cumplimiento inferior al 10 % (Story 4.2)', () => {
    const amparos = completos.map((a) => (a.tipo === 'CUMPLIMIENTO' ? { ...a, valorAsegurado: 50_000_000n } : a));
    const v = validarGarantias(obra(amparos)).violaciones;
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ amparo: 'CUMPLIMIENTO', tipo: 'VALOR_INSUFICIENTE', minimoValor: 100_000_000n });
  });

  it('exige vigencias mínimas: cumplimiento hasta liquidación, salarios +3 años, estabilidad +5 años', () => {
    const amparos = completos.map((a) => ({ ...a, vigenciaHasta: '2027-06-30' as const }));
    const v = validarGarantias(obra(amparos)).violaciones.filter((x) => x.tipo === 'VIGENCIA_INSUFICIENTE');
    expect(v.map((x) => [x.amparo, x.minimaVigencia])).toEqual([
      ['CUMPLIMIENTO', '2027-10-30'],
      ['SALARIOS_PRESTACIONES', '2030-06-30'],
      ['ESTABILIDAD_CALIDAD_OBRA', '2032-06-30'],
    ]);
  });

  it('estabilidad se cuenta desde el recibo a satisfacción', () => {
    const v = validarGarantias(obra(completos, { fechaRecibo: '2027-08-15' })).violaciones;
    expect(v).toMatchObject([{ amparo: 'ESTABILIDAD_CALIDAD_OBRA', minimaVigencia: '2032-08-15' }]);
  });

  it('exige anticipo y pago anticipado al 100 %', () => {
    const v = validarGarantias(obra(completos, { anticipo: 300_000_000n, pagoAnticipado: 10_000_000n })).violaciones;
    expect(v.map((x) => `${x.amparo}:${x.tipo}`)).toEqual(['BUEN_MANEJO_ANTICIPO:FALTANTE', 'PAGO_ANTICIPADO:FALTANTE']);
  });

  it('suma varios amparos del mismo tipo', () => {
    const amparos: Amparo[] = [
      ...completos.filter((a) => a.tipo !== 'CUMPLIMIENTO'),
      { tipo: 'CUMPLIMIENTO', valorAsegurado: 60_000_000n, vigenciaHasta: '2027-10-30' },
      { tipo: 'CUMPLIMIENTO', valorAsegurado: 40_000_000n, vigenciaHasta: '2027-12-31' },
    ];
    expect(validarGarantias(obra(amparos)).violaciones).toEqual([]);
  });

  it('suministro sin personal solo exige cumplimiento', () => {
    const r = validarGarantias({
      modalidad: 'SELECCION_ABREVIADA',
      tipoObjeto: 'SUMINISTRO',
      valorContrato: 200_000_001n,
      smmlv: SMMLV,
      fechaTerminacion: '2027-01-31',
      amparos: [],
    });
    expect(r.violaciones).toMatchObject([{ amparo: 'CUMPLIMIENTO', tipo: 'FALTANTE', minimoValor: 20_000_001n }]);
  });

  it('mínima cuantía y directa: no obligatorias salvo que la entidad las exija', () => {
    const base = { tipoObjeto: 'PRESTACION_SERVICIOS' as const, valorContrato: 30_000_000n, smmlv: SMMLV, fechaTerminacion: '2027-01-31' as const, amparos: [] };
    const mc = validarGarantias({ ...base, modalidad: 'MINIMA_CUANTIA' });
    expect(mc.obligatorias).toBe(false);
    expect(mc.advertencias[0]).toContain('mínima cuantía');
    const cd = validarGarantias({ ...base, modalidad: 'CONTRATACION_DIRECTA', garantiasExigidas: true });
    expect(cd.obligatorias).toBe(true);
    expect(cd.violaciones.map((v) => v.amparo)).toEqual(['CUMPLIMIENTO']);
  });

  it('RCE por tramos de valor del contrato', () => {
    expect(minimoRce(1_500n * SMMLV, SMMLV)).toBe(200n * SMMLV);
    expect(minimoRce(1_500n * SMMLV + 1n, SMMLV)).toBe(300n * SMMLV);
    expect(minimoRce(5_000n * SMMLV, SMMLV)).toBe(400n * SMMLV);
    expect(minimoRce(10_000n * SMMLV, SMMLV)).toBe(500n * SMMLV);
    expect(minimoRce(20_000n * SMMLV, SMMLV)).toBe(1_000n * SMMLV);
    expect(minimoRce(2_000_000n * SMMLV, SMMLV)).toBe(75_000n * SMMLV);
  });

  it('advierte contratos superiores a 1.000.000 SMMLV', () => {
    const r = validarGarantias(obra(completos, { valorContrato: 1_000_001n * SMMLV }));
    expect(r.advertencias.some((a) => a.includes('1.000.000 SMMLV'))).toBe(true);
  });

  it('valida entradas', () => {
    expect(() => validarGarantias(obra(completos, { valorContrato: 0n }))).toThrow(ErrorNormativo);
    expect(() => validarGarantias(obra(completos, { anticipo: -1n }))).toThrow(ErrorNormativo);
    expect(() => validarGarantias(obra(completos, { anticipo: 2_000_000_000n }))).toThrow(ErrorNormativo);
  });
});
