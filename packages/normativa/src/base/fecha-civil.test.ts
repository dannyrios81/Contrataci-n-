import { describe, expect, it } from 'vitest';
import { diaSemana, diferenciaDias, partes, sumarAnios, sumarDias, sumarMeses } from './fecha-civil.js';
import { ErrorNormativo } from './tipos.js';

describe('fecha civil', () => {
  it('rechaza formatos y fechas inexistentes', () => {
    expect(() => partes('2026-2-1')).toThrow(ErrorNormativo);
    expect(() => partes('2026-02-30')).toThrow(ErrorNormativo);
    expect(partes('2028-02-29')).toEqual({ anio: 2028, mes: 2, dia: 29 });
  });

  it('suma días cruzando meses y años', () => {
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('suma meses ajustando al último día del mes', () => {
    expect(sumarMeses('2026-01-31', 1)).toBe('2026-02-28');
    expect(sumarMeses('2026-11-15', 4)).toBe('2027-03-15');
    expect(sumarMeses('2026-03-31', -1)).toBe('2026-02-28');
    expect(sumarAnios('2028-02-29', 1)).toBe('2029-02-28');
  });

  it('calcula día de la semana y diferencias', () => {
    expect(diaSemana('2026-10-06')).toBe(2); // martes
    expect(diferenciaDias('2026-01-01', '2026-12-31')).toBe(364);
  });
});
