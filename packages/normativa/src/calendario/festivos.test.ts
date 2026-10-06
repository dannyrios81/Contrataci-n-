import { describe, expect, it } from 'vitest';
import { ErrorNormativo } from '../base/tipos.js';
import { domingoDePascua, festivosDeColombia } from './festivos.js';

const fechas = (anio: number) => festivosDeColombia(anio).map((f) => f.fecha);

describe('festivos de Colombia', () => {
  it('calcula el domingo de Pascua', () => {
    expect(domingoDePascua(2024)).toBe('2024-03-31');
    expect(domingoDePascua(2025)).toBe('2025-04-20');
    expect(domingoDePascua(2026)).toBe('2026-04-05');
    expect(domingoDePascua(2027)).toBe('2027-03-28');
  });

  it('coincide con el calendario oficial de 2024', () => {
    expect(fechas(2024)).toEqual([
      '2024-01-01', '2024-01-08', '2024-03-25', '2024-03-28', '2024-03-29', '2024-05-01',
      '2024-05-13', '2024-06-03', '2024-06-10', '2024-07-01', '2024-07-20', '2024-08-07',
      '2024-08-19', '2024-10-14', '2024-11-04', '2024-11-11', '2024-12-08', '2024-12-25',
    ]);
  });

  it('coincide con el calendario oficial de 2025 (dos festivos el 30 de junio)', () => {
    const f = fechas(2025);
    expect(f).toHaveLength(18);
    expect(new Set(f).size).toBe(17);
    expect(f).toEqual([
      '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18', '2025-05-01',
      '2025-06-02', '2025-06-23', '2025-06-30', '2025-06-30', '2025-07-20', '2025-08-07',
      '2025-08-18', '2025-10-13', '2025-11-03', '2025-11-17', '2025-12-08', '2025-12-25',
    ]);
  });

  it('coincide con el calendario oficial de 2026', () => {
    expect(fechas(2026)).toEqual([
      '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01',
      '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07',
      '2026-08-17', '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25',
    ]);
  });

  it('registra la fecha original de los festivos trasladados', () => {
    const reyes = festivosDeColombia(2026).find((f) => f.nombre === 'Reyes Magos');
    expect(reyes).toEqual({ fecha: '2026-01-12', nombre: 'Reyes Magos', trasladadoDesde: '2026-01-06' });
    const sanPedro = festivosDeColombia(2026).find((f) => f.nombre === 'San Pedro y San Pablo');
    expect(sanPedro).not.toHaveProperty('trasladadoDesde');
  });

  it('siempre devuelve 18 festivos y los trasladables caen en lunes', () => {
    for (let anio = 1984; anio <= 2100; anio++) {
      const lista = festivosDeColombia(anio);
      expect(lista).toHaveLength(18);
      for (const f of lista.filter((x) => x.trasladadoDesde)) {
        expect(new Date(`${f.fecha}T00:00:00Z`).getUTCDay()).toBe(1);
      }
    }
  });

  it('rechaza años fuera de rango', () => {
    expect(() => festivosDeColombia(1983)).toThrow(ErrorNormativo);
    expect(() => festivosDeColombia(2026.5)).toThrow(ErrorNormativo);
  });
});
