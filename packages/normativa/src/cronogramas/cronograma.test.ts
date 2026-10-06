import { describe, expect, it } from 'vitest';
import { ErrorNormativo, type FechaCivil } from '../base/tipos.js';
import { CalendarioHabil, contarDiasHabiles, esDiaHabil } from '../calendario/dias-habiles.js';
import type { Procedimiento } from '../modalidades/tipos.js';
import { generarCronograma, validarCronograma, validarHitos } from './cronograma.js';

const PROCEDIMIENTOS: Procedimiento[] = [
  'LICITACION_PUBLICA',
  'SA_MENOR_CUANTIA',
  'SA_SUBASTA_INVERSA',
  'CONCURSO_MERITOS',
  'MINIMA_CUANTIA',
  'CONTRATACION_DIRECTA',
];

const fechaDe = (hitos: { codigo: string; fecha: FechaCivil }[], codigo: string) =>
  hitos.find((h) => h.codigo === codigo)!.fecha;

describe('cronogramas', () => {
  it.each(PROCEDIMIENTOS)('%s: hitos en días hábiles, ordenados, con fundamento y sin violaciones', (procedimiento) => {
    for (const inicio of ['2026-11-03', '2026-12-18', '2027-03-19'] as const) {
      const c = generarCronograma({ procedimiento, inicio });
      expect(c.hitos.length).toBeGreaterThan(2);
      for (const h of c.hitos) {
        expect(esDiaHabil(h.fecha)).toBe(true);
        expect(h.fundamentos.length).toBeGreaterThan(0);
      }
      const ordenadas = c.hitos.map((h) => h.fecha);
      expect(ordenadas).toEqual([...ordenadas].sort());
      expect(validarHitos(c)).toEqual([]);
    }
  });

  it('UJ-2: licitación desde el 3 de noviembre de 2026', () => {
    const { hitos } = generarCronograma({ procedimiento: 'LICITACION_PUBLICA', inicio: '2026-11-03' });
    // 16 de noviembre es festivo (Independencia de Cartagena trasladado).
    expect(fechaDe(hitos, 'LIMITE_OBSERVACIONES_PROYECTO')).toBe('2026-11-18');
    expect(fechaDe(hitos, 'APERTURA')).toBe('2026-11-19');
    expect(fechaDe(hitos, 'AUDIENCIA_RIESGOS')).toBe('2026-11-24');
    expect(fechaDe(hitos, 'CIERRE')).toBe('2026-12-03');
    expect(fechaDe(hitos, 'LIMITE_ADENDAS')).toBe('2026-11-30');
    expect(contarDiasHabiles(fechaDe(hitos, 'PUBLICACION_INFORME_EVALUACION'), fechaDe(hitos, 'FIN_TRASLADO_INFORME'))).toBe(5);
  });

  it('corre el inicio al siguiente día hábil', () => {
    const { hitos } = generarCronograma({ procedimiento: 'MINIMA_CUANTIA', inicio: '2026-10-10' });
    expect(hitos[0]!.fecha).toBe('2026-10-13');
  });

  it('permite ampliar plazos y detecta plazos ilegales', () => {
    const amplio = generarCronograma({ procedimiento: 'LICITACION_PUBLICA', inicio: '2026-11-03', plazos: { CIERRE: 20 } });
    expect(validarHitos(amplio)).toEqual([]);

    const corto = generarCronograma({
      procedimiento: 'LICITACION_PUBLICA',
      inicio: '2026-11-03',
      plazos: { APERTURA: 5, FIN_TRASLADO_INFORME: 3 },
    });
    const tipos = validarHitos(corto).map((v) => `${v.codigoHito}:${v.tipo}`);
    expect(tipos).toContain('APERTURA:PLAZO_MINIMO');
    expect(tipos).toContain('FIN_TRASLADO_INFORME:PLAZO_MINIMO');
  });

  it('detecta adendas extemporáneas en licitación (menos de 3 días hábiles antes del cierre)', () => {
    const { hitos } = generarCronograma({ procedimiento: 'LICITACION_PUBLICA', inicio: '2026-11-03' });
    const fechas: Record<string, FechaCivil> = Object.fromEntries(hitos.map((h) => [h.codigo, h.fecha]));
    fechas.LIMITE_ADENDAS = '2026-12-01'; // 2 días hábiles antes del cierre del 3 de diciembre
    const v = validarCronograma('LICITACION_PUBLICA', fechas);
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ codigoHito: 'LIMITE_ADENDAS', tipo: 'PLAZO_MAXIMO' });
  });

  it('detecta audiencia de riesgos fuera de los 3 días hábiles', () => {
    const { hitos } = generarCronograma({ procedimiento: 'LICITACION_PUBLICA', inicio: '2026-11-03', plazos: { AUDIENCIA_RIESGOS: 4 } });
    expect(validarHitos({ procedimiento: 'LICITACION_PUBLICA', hitos }).map((v) => v.tipo)).toEqual(['PLAZO_MAXIMO']);
  });

  it('detecta fechas no hábiles y hitos faltantes', () => {
    const { hitos } = generarCronograma({ procedimiento: 'MINIMA_CUANTIA', inicio: '2026-11-03' });
    const fechas: Record<string, FechaCivil> = Object.fromEntries(hitos.map((h) => [h.codigo, h.fecha]));
    fechas.COMUNICACION_ACEPTACION = '2026-11-16'; // festivo
    delete fechas.PUBLICACION_INFORME_EVALUACION;
    const tipos = validarCronograma('MINIMA_CUANTIA', fechas).map((v) => `${v.codigoHito}:${v.tipo}`);
    expect(tipos).toContain('COMUNICACION_ACEPTACION:DIA_NO_HABIL');
    expect(tipos).toContain('PUBLICACION_INFORME_EVALUACION:HITO_FALTANTE');
    expect(tipos).toContain('FIN_TRASLADO_INFORME:REFERENCIA_FALTANTE');
  });

  it('usa el calendario de la entidad', () => {
    const calendario = new CalendarioHabil({ diasNoHabilesAdicionales: ['2026-11-04'] });
    const { hitos } = generarCronograma({ procedimiento: 'MINIMA_CUANTIA', inicio: '2026-11-03', calendario });
    expect(hitos.map((h) => h.fecha)).not.toContain('2026-11-04');
  });

  it('acuerdo marco y bolsa no tienen cronograma propio', () => {
    expect(() => generarCronograma({ procedimiento: 'SA_ACUERDO_MARCO', inicio: '2026-11-03' })).toThrow(ErrorNormativo);
    expect(() => validarCronograma('SA_BOLSA_PRODUCTOS', {})).toThrow(ErrorNormativo);
  });
});
