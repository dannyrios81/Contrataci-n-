import { ErrorNormativo, type FechaCivil } from './tipos.js';

const PATRON = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_DIA = 86_400_000;

/** Descompone y valida una fecha civil. */
export function partes(fecha: string): { anio: number; mes: number; dia: number } {
  const m = PATRON.exec(fecha);
  if (!m) throw new ErrorNormativo(`Fecha inválida: "${fecha}" (se espera YYYY-MM-DD)`);
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  if (d.getUTCFullYear() !== anio || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    throw new ErrorNormativo(`Fecha inexistente: "${fecha}"`);
  }
  return { anio, mes, dia };
}

export function fechaCivil(anio: number, mes: number, dia: number): FechaCivil {
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return deUtc(d);
}

function aUtc(fecha: FechaCivil): Date {
  const { anio, mes, dia } = partes(fecha);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

function deUtc(d: Date): FechaCivil {
  const a = String(d.getUTCFullYear()).padStart(4, '0');
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${a}-${m}-${dd}` as FechaCivil;
}

export function sumarDias(fecha: FechaCivil, dias: number): FechaCivil {
  return deUtc(new Date(aUtc(fecha).getTime() + dias * MS_DIA));
}

/** Suma meses calendario; si el día no existe en el mes destino, usa el último día del mes. */
export function sumarMeses(fecha: FechaCivil, meses: number): FechaCivil {
  const { anio, mes, dia } = partes(fecha);
  const indice = anio * 12 + (mes - 1) + meses;
  const anioDestino = Math.floor(indice / 12);
  const mesDestino = (indice % 12) + 1;
  const ultimoDia = new Date(Date.UTC(anioDestino, mesDestino, 0)).getUTCDate();
  return fechaCivil(anioDestino, mesDestino, Math.min(dia, ultimoDia));
}

export function sumarAnios(fecha: FechaCivil, anios: number): FechaCivil {
  return sumarMeses(fecha, anios * 12);
}

/** 0 = domingo … 6 = sábado. */
export function diaSemana(fecha: FechaCivil): number {
  return aUtc(fecha).getUTCDay();
}

export function diferenciaDias(desde: FechaCivil, hasta: FechaCivil): number {
  return Math.round((aUtc(hasta).getTime() - aUtc(desde).getTime()) / MS_DIA);
}

export function compararFechas(a: FechaCivil, b: FechaCivil): number {
  // El formato YYYY-MM-DD ordena lexicográficamente.
  return a < b ? -1 : a > b ? 1 : 0;
}
