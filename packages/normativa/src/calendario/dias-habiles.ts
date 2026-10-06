import { compararFechas, diaSemana, partes, sumarDias } from '../base/fecha-civil.js';
import { ErrorNormativo, type FechaCivil } from '../base/tipos.js';
import { festivosDeColombia } from './festivos.js';

export interface OpcionesCalendario {
  /** Días no hábiles adicionales (p. ej. cierres decretados por la entidad). */
  diasNoHabilesAdicionales?: readonly FechaCivil[];
}

/** Calendario de días hábiles de Colombia: lunes a viernes, excepto festivos. */
export class CalendarioHabil {
  private readonly adicionales: ReadonlySet<string>;
  private readonly festivosPorAnio = new Map<number, ReadonlySet<string>>();

  constructor(opciones: OpcionesCalendario = {}) {
    for (const f of opciones.diasNoHabilesAdicionales ?? []) partes(f);
    this.adicionales = new Set(opciones.diasNoHabilesAdicionales ?? []);
  }

  esFestivo(fecha: FechaCivil): boolean {
    const { anio } = partes(fecha);
    let set = this.festivosPorAnio.get(anio);
    if (!set) {
      set = new Set(festivosDeColombia(anio).map((f) => f.fecha));
      this.festivosPorAnio.set(anio, set);
    }
    return set.has(fecha);
  }

  esDiaHabil(fecha: FechaCivil): boolean {
    const dow = diaSemana(fecha);
    return dow !== 0 && dow !== 6 && !this.esFestivo(fecha) && !this.adicionales.has(fecha);
  }

  /** La misma fecha si es hábil; si no, el siguiente día hábil. */
  siguienteHabilDesde(fecha: FechaCivil): FechaCivil {
    let f = fecha;
    while (!this.esDiaHabil(f)) f = sumarDias(f, 1);
    return f;
  }

  /** La misma fecha si es hábil; si no, el día hábil anterior. */
  anteriorHabilDesde(fecha: FechaCivil): FechaCivil {
    let f = fecha;
    while (!this.esDiaHabil(f)) f = sumarDias(f, -1);
    return f;
  }

  /**
   * Suma `n` días hábiles. El día de partida no se cuenta (los términos legales
   * empiezan a correr al día siguiente). `n` negativo resta; `n = 0` devuelve la fecha.
   */
  sumarDiasHabiles(fecha: FechaCivil, n: number): FechaCivil {
    if (!Number.isInteger(n)) throw new ErrorNormativo(`Número de días inválido: ${n}`);
    const paso = n >= 0 ? 1 : -1;
    let restantes = Math.abs(n);
    let f = fecha;
    while (restantes > 0) {
      f = sumarDias(f, paso);
      if (this.esDiaHabil(f)) restantes--;
    }
    return f;
  }

  /** Días hábiles en el intervalo `(desde, hasta]`; negativo si `hasta < desde`. */
  contarDiasHabiles(desde: FechaCivil, hasta: FechaCivil): number {
    const signo = compararFechas(desde, hasta);
    if (signo === 0) return 0;
    const [ini, fin] = signo < 0 ? [desde, hasta] : [hasta, desde];
    let total = 0;
    for (let f = sumarDias(ini, 1); compararFechas(f, fin) <= 0; f = sumarDias(f, 1)) {
      if (this.esDiaHabil(f)) total++;
    }
    return signo < 0 ? total : -total;
  }
}

const porDefecto = new CalendarioHabil();

export const esDiaHabil = (fecha: FechaCivil): boolean => porDefecto.esDiaHabil(fecha);
export const sumarDiasHabiles = (fecha: FechaCivil, n: number): FechaCivil =>
  porDefecto.sumarDiasHabiles(fecha, n);
export const contarDiasHabiles = (desde: FechaCivil, hasta: FechaCivil): number =>
  porDefecto.contarDiasHabiles(desde, hasta);
