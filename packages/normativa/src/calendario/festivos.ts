import { diaSemana, fechaCivil, sumarDias } from '../base/fecha-civil.js';
import { ErrorNormativo, type FechaCivil, type Fundamento } from '../base/tipos.js';

export interface Festivo {
  fecha: FechaCivil;
  nombre: string;
  /** Fecha original cuando el festivo se trasladó al lunes (Ley 51 de 1983). */
  trasladadoDesde?: FechaCivil;
}

export const FUNDAMENTO_FESTIVOS: readonly Fundamento[] = [
  { norma: 'Ley 51 de 1983', articulo: '1' },
  { norma: 'Ley 37 de 1905', articulo: '1' },
];

/** Primer año en que rige el traslado de festivos al lunes (Ley 51 de 1983). */
export const ANIO_MINIMO = 1984;
export const ANIO_MAXIMO = 2100;

const FIJOS: ReadonlyArray<[number, number, string]> = [
  [1, 1, 'Año Nuevo'],
  [5, 1, 'Día del Trabajo'],
  [7, 20, 'Día de la Independencia'],
  [8, 7, 'Batalla de Boyacá'],
  [12, 8, 'Inmaculada Concepción'],
  [12, 25, 'Navidad'],
];

const TRASLADABLES: ReadonlyArray<[number, number, string]> = [
  [1, 6, 'Reyes Magos'],
  [3, 19, 'San José'],
  [6, 29, 'San Pedro y San Pablo'],
  [8, 15, 'Asunción de la Virgen'],
  [10, 12, 'Día de la Raza'],
  [11, 1, 'Todos los Santos'],
  [11, 11, 'Independencia de Cartagena'],
];

/** Domingo de Pascua (algoritmo gregoriano anónimo de Meeus/Jones/Butcher). */
export function domingoDePascua(anio: number): FechaCivil {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return fechaCivil(anio, mes, dia);
}

function aLunes(fecha: FechaCivil): FechaCivil {
  const dow = diaSemana(fecha);
  return dow === 1 ? fecha : sumarDias(fecha, (8 - dow) % 7);
}

function trasladable(original: FechaCivil, nombre: string): Festivo {
  const fecha = aLunes(original);
  return fecha === original ? { fecha, nombre } : { fecha, nombre, trasladadoDesde: original };
}

const cache = new Map<number, readonly Festivo[]>();

/**
 * Los 18 festivos de Colombia de un año, ordenados por fecha.
 * Dos festivos pueden coincidir en la misma fecha (p. ej. 30 de junio de 2025).
 */
export function festivosDeColombia(anio: number): readonly Festivo[] {
  if (!Number.isInteger(anio) || anio < ANIO_MINIMO || anio > ANIO_MAXIMO) {
    throw new ErrorNormativo(`Año fuera de rango: ${anio} (${ANIO_MINIMO}–${ANIO_MAXIMO})`);
  }
  const previo = cache.get(anio);
  if (previo) return previo;

  const pascua = domingoDePascua(anio);
  const festivos: Festivo[] = [
    ...FIJOS.map(([mes, dia, nombre]) => ({ fecha: fechaCivil(anio, mes, dia), nombre })),
    ...TRASLADABLES.map(([mes, dia, nombre]) => trasladable(fechaCivil(anio, mes, dia), nombre)),
    { fecha: sumarDias(pascua, -3), nombre: 'Jueves Santo' },
    { fecha: sumarDias(pascua, -2), nombre: 'Viernes Santo' },
    trasladable(sumarDias(pascua, 39), 'Ascensión del Señor'),
    trasladable(sumarDias(pascua, 60), 'Corpus Christi'),
    trasladable(sumarDias(pascua, 68), 'Sagrado Corazón de Jesús'),
  ];
  festivos.sort((x, y) => (x.fecha < y.fecha ? -1 : x.fecha > y.fecha ? 1 : 0));
  const resultado = Object.freeze(festivos);
  cache.set(anio, resultado);
  return resultado;
}
