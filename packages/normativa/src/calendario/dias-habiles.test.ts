import { describe, expect, it } from 'vitest';
import { ErrorNormativo } from '../base/tipos.js';
import { CalendarioHabil, contarDiasHabiles, esDiaHabil, sumarDiasHabiles } from './dias-habiles.js';

describe('días hábiles', () => {
  it('excluye fines de semana y festivos', () => {
    expect(esDiaHabil('2026-10-06')).toBe(true); // martes
    expect(esDiaHabil('2026-10-10')).toBe(false); // sábado
    expect(esDiaHabil('2026-10-12')).toBe(false); // Día de la Raza
  });

  it('suma días hábiles saltando el puente festivo', () => {
    // Viernes 9 oct + 1 hábil → martes 13 oct (lunes 12 es festivo).
    expect(sumarDiasHabiles('2026-10-09', 1)).toBe('2026-10-13');
    // Semana Santa 2026: jueves 2 y viernes 3 de abril.
    expect(sumarDiasHabiles('2026-04-01', 1)).toBe('2026-04-06');
    expect(sumarDiasHabiles('2026-10-06', 0)).toBe('2026-10-06');
  });

  it('resta días hábiles', () => {
    expect(sumarDiasHabiles('2026-10-13', -1)).toBe('2026-10-09');
    expect(sumarDiasHabiles('2026-04-06', -3)).toBe('2026-03-30');
  });

  it('cuenta días hábiles en (desde, hasta]', () => {
    expect(contarDiasHabiles('2026-10-09', '2026-10-13')).toBe(1);
    expect(contarDiasHabiles('2026-10-13', '2026-10-09')).toBe(-1);
    expect(contarDiasHabiles('2026-10-06', '2026-10-06')).toBe(0);
    // Diciembre 2026: 23 días de lunes a viernes menos 8 y 25 de diciembre.
    expect(contarDiasHabiles('2026-11-30', '2026-12-31')).toBe(21);
  });

  it('suma y cuenta son inversas', () => {
    for (const n of [1, 5, 10, 37, -4, -22]) {
      const f = sumarDiasHabiles('2026-03-20', n);
      expect(contarDiasHabiles('2026-03-20', f)).toBe(n);
    }
  });

  it('respeta días no hábiles adicionales de la entidad', () => {
    const cal = new CalendarioHabil({ diasNoHabilesAdicionales: ['2026-10-13'] });
    expect(cal.sumarDiasHabiles('2026-10-09', 1)).toBe('2026-10-14');
    expect(cal.siguienteHabilDesde('2026-10-10')).toBe('2026-10-14');
    expect(cal.anteriorHabilDesde('2026-10-13')).toBe('2026-10-09');
  });

  it('valida entradas', () => {
    expect(() => sumarDiasHabiles('2026-10-06', 1.5)).toThrow(ErrorNormativo);
    expect(() => new CalendarioHabil({ diasNoHabilesAdicionales: ['13/10/2026' as never] })).toThrow(ErrorNormativo);
  });
});
