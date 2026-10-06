import { describe, expect, it } from 'vitest';
import { ErrorNormativo, VERSION_REGLAS } from '../base/tipos.js';
import { calcularCuantias } from '../cuantias/cuantias.js';
import { recomendarModalidad } from './recomendar.js';
import type { EntradaModalidad } from './tipos.js';

// Municipio con presupuesto < 120.000 SMMLV en 2025: menor cuantía $398.580.000, mínima $39.858.000.
const cuantias = calcularCuantias({ presupuestoAnual: 40_000_000_000n, smmlv: 1_423_500n });
const MINIMA = cuantias.minimaCuantia;
const MENOR = cuantias.menorCuantia;

const entrada = (parcial: Partial<EntradaModalidad>): EntradaModalidad => ({
  tipoObjeto: 'SUMINISTRO',
  valorEstimado: 100_000_000n,
  cuantias,
  ...parcial,
});

describe('recomendación de modalidad', () => {
  it('valor igual a la mínima cuantía → mínima cuantía; un peso más → menor cuantía', () => {
    expect(recomendarModalidad(entrada({ valorEstimado: MINIMA })).modalidad).toBe('MINIMA_CUANTIA');
    const r = recomendarModalidad(entrada({ valorEstimado: MINIMA + 1n }));
    expect(r.modalidad).toBe('SELECCION_ABREVIADA');
    expect(r.procedimiento).toBe('SA_MENOR_CUANTIA');
  });

  it('valor igual a la menor cuantía → selección abreviada; un peso más → licitación', () => {
    expect(recomendarModalidad(entrada({ valorEstimado: MENOR })).procedimiento).toBe('SA_MENOR_CUANTIA');
    const r = recomendarModalidad(entrada({ valorEstimado: MENOR + 1n }));
    expect(r.modalidad).toBe('LICITACION_PUBLICA');
    expect(r.regla).toBe('R8_REGLA_GENERAL');
  });

  it('UJ-1: obra de $1.200 millones → licitación con advertencia de pliego tipo', () => {
    const r = recomendarModalidad(entrada({ tipoObjeto: 'OBRA', valorEstimado: 1_200_000_000n }));
    expect(r.modalidad).toBe('LICITACION_PUBLICA');
    expect(r.fundamentos).toContainEqual({ norma: 'Ley 1150 de 2007', articulo: '2 num. 1' });
    expect(r.advertencias.map((a) => a.codigo)).toContain('PLIEGO_TIPO');
    expect(r.versionReglas).toBe(VERSION_REGLAS);
  });

  it('consultoría e interventoría → concurso de méritos sin importar la cuantía', () => {
    for (const tipoObjeto of ['CONSULTORIA', 'INTERVENTORIA'] as const) {
      expect(recomendarModalidad(entrada({ tipoObjeto, valorEstimado: MENOR - 1n })).modalidad).toBe('CONCURSO_MERITOS');
      expect(recomendarModalidad(entrada({ tipoObjeto, valorEstimado: 50n * MENOR })).modalidad).toBe('CONCURSO_MERITOS');
    }
  });

  it('la mínima cuantía aplica independientemente del objeto (incluida consultoría)', () => {
    expect(recomendarModalidad(entrada({ tipoObjeto: 'CONSULTORIA', valorEstimado: MINIMA })).modalidad).toBe(
      'MINIMA_CUANTIA',
    );
  });

  it('la causal de directa prevalece sobre la cuantía', () => {
    const r = recomendarModalidad(
      entrada({ tipoObjeto: 'PRESTACION_SERVICIOS', valorEstimado: MINIMA - 1n, causalDirecta: 'SERVICIOS_PROFESIONALES_APOYO_GESTION' }),
    );
    expect(r.modalidad).toBe('CONTRATACION_DIRECTA');
    expect(r.fundamentos[0]).toEqual({ norma: 'Ley 1150 de 2007', articulo: '2 num. 4 lit. h' });
    const codigos = r.advertencias.map((a) => a.codigo);
    expect(codigos).toContain('GARANTIAS_NO_OBLIGATORIAS');
    expect(codigos).not.toContain('JUSTIFICACION_DIRECTA');
  });

  it('interadministrativo exige acto de justificación', () => {
    const r = recomendarModalidad(entrada({ causalDirecta: 'INTERADMINISTRATIVO' }));
    expect(r.fundamentos[0]?.articulo).toBe('2 num. 4 lit. c');
    expect(r.advertencias.map((a) => a.codigo)).toContain('JUSTIFICACION_DIRECTA');
  });

  it('características técnicas uniformes → subasta inversa o bolsa, con aviso de acuerdo marco', () => {
    const r = recomendarModalidad(entrada({ caracteristicasTecnicasUniformes: true, valorEstimado: 10n * MENOR }));
    expect(r.procedimiento).toBe('SA_SUBASTA_INVERSA');
    expect(r.advertencias.map((a) => a.codigo)).toContain('ACUERDO_MARCO');
    const bolsa = recomendarModalidad(
      entrada({ caracteristicasTecnicasUniformes: true, bolsaDeProductos: true, valorEstimado: 10n * MENOR }),
    );
    expect(bolsa.procedimiento).toBe('SA_BOLSA_PRODUCTOS');
  });

  it('acuerdo marco vigente prevalece aun por debajo de la mínima cuantía', () => {
    const r = recomendarModalidad(
      entrada({ caracteristicasTecnicasUniformes: true, cubiertoPorAcuerdoMarco: true, valorEstimado: 1_000_000n }),
    );
    expect(r.procedimiento).toBe('SA_ACUERDO_MARCO');
    expect(r.advertencias.map((a) => a.codigo)).not.toContain('ACUERDO_MARCO');
  });

  it('causales de selección abreviada usan el procedimiento de menor cuantía', () => {
    const r = recomendarModalidad(entrada({ causalSeleccionAbreviada: 'LICITACION_DESIERTA', valorEstimado: 10n * MENOR }));
    expect(r.procedimiento).toBe('SA_MENOR_CUANTIA');
    expect(r.fundamentos[0]?.articulo).toBe('2 num. 2 lit. d');
  });

  it('advierte la convocatoria limitada a Mipyme por debajo del umbral', () => {
    const umbralMipyme = 500_000_000n;
    expect(
      recomendarModalidad(entrada({ valorEstimado: umbralMipyme - 1n, umbralMipyme })).advertencias.map((a) => a.codigo),
    ).toContain('MIPYME');
    expect(
      recomendarModalidad(entrada({ valorEstimado: umbralMipyme, umbralMipyme })).advertencias.map((a) => a.codigo),
    ).not.toContain('MIPYME');
  });

  it('advierte la Ley de Garantías solo para el alcance y periodo aplicable', () => {
    const periodosLeyGarantias = [
      {
        desde: '2030-01-27',
        hasta: '2030-06-16',
        alcance: 'CONTRATACION_DIRECTA',
        descripcion: 'Elecciones presidenciales 2030',
      },
    ] as const;
    const directa = (fechaPrevista: `${number}-${number}-${number}`) =>
      recomendarModalidad(entrada({ causalDirecta: 'NO_PLURALIDAD_OFERENTES', fechaPrevista, periodosLeyGarantias }))
        .advertencias.map((a) => a.codigo);
    expect(directa('2030-01-27')).toContain('LEY_GARANTIAS');
    expect(directa('2030-06-16')).toContain('LEY_GARANTIAS');
    expect(directa('2030-06-17')).not.toContain('LEY_GARANTIAS');
    const licitacion = recomendarModalidad(
      entrada({ valorEstimado: 10n * MENOR, fechaPrevista: '2030-03-01', periodosLeyGarantias }),
    );
    expect(licitacion.advertencias.map((a) => a.codigo)).not.toContain('LEY_GARANTIAS');
  });

  it('restringe convenios interadministrativos en periodo territorial', () => {
    const r = recomendarModalidad(
      entrada({
        causalDirecta: 'INTERADMINISTRATIVO',
        fechaPrevista: '2027-08-01',
        periodosLeyGarantias: [
          { desde: '2027-06-24', hasta: '2027-10-24', alcance: 'CONVENIOS_INTERADMINISTRATIVOS', descripcion: 'Elecciones territoriales 2027' },
        ],
      }),
    );
    const ley = r.advertencias.find((a) => a.codigo === 'LEY_GARANTIAS');
    expect(ley?.fundamentos[0]?.articulo).toBe('38 par.');
  });

  it('cada recomendación trae al menos un fundamento', () => {
    const casos: Partial<EntradaModalidad>[] = [
      { valorEstimado: 1n },
      { valorEstimado: MENOR },
      { valorEstimado: 99n * MENOR },
      { tipoObjeto: 'CONSULTORIA', valorEstimado: MENOR },
      { causalDirecta: 'URGENCIA_MANIFIESTA' },
    ];
    for (const c of casos) expect(recomendarModalidad(entrada(c)).fundamentos.length).toBeGreaterThan(0);
  });

  it('valida las entradas', () => {
    expect(() => recomendarModalidad(entrada({ valorEstimado: 0n }))).toThrow(ErrorNormativo);
    expect(() =>
      recomendarModalidad(entrada({ causalDirecta: 'EMPRESTITOS', causalSeleccionAbreviada: 'SERVICIOS_SALUD' })),
    ).toThrow(ErrorNormativo);
    expect(() =>
      recomendarModalidad(entrada({ cuantias: { menorCuantia: 1n, minimaCuantia: 2n } })),
    ).toThrow(ErrorNormativo);
  });
});
