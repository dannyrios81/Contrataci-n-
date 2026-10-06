import { compararFechas, partes } from '../base/fecha-civil.js';
import { ErrorNormativo, VERSION_REGLAS, type FechaCivil, type Fundamento } from '../base/tipos.js';
import { CalendarioHabil } from '../calendario/dias-habiles.js';
import type { Procedimiento } from '../modalidades/tipos.js';
import { PLANTILLAS, type PlantillaHito, type ReglaPlazo } from './plantillas.js';

export interface Hito {
  codigo: string;
  nombre: string;
  fecha: FechaCivil;
  regla?: ReglaPlazo;
  fundamentos: Fundamento[];
}

export interface Cronograma {
  procedimiento: Procedimiento;
  hitos: Hito[];
  versionReglas: string;
}

export type TipoViolacion = 'DIA_NO_HABIL' | 'PLAZO_MINIMO' | 'PLAZO_MAXIMO' | 'HITO_FALTANTE' | 'REFERENCIA_FALTANTE';

export interface Violacion {
  codigoHito: string;
  tipo: TipoViolacion;
  mensaje: string;
  fundamentos: Fundamento[];
}

export interface EntradaCronograma {
  procedimiento: Procedimiento;
  /** Fecha del primer hito; si no es hábil se corre al siguiente día hábil. */
  inicio: FechaCivil;
  /** Desplazamientos que reemplazan el `sugerido` de un hito, por código. */
  plazos?: Readonly<Record<string, number>>;
  calendario?: CalendarioHabil;
}

export function plantillaDe(procedimiento: Procedimiento): readonly PlantillaHito[] {
  const plantilla = PLANTILLAS[procedimiento];
  if (!plantilla) {
    throw new ErrorNormativo(
      `El procedimiento ${procedimiento} se tramita en la Tienda Virtual del Estado Colombiano o en bolsa; no tiene cronograma propio.`,
    );
  }
  return plantilla;
}

/** Genera el cronograma de un procedimiento con los plazos sugeridos (FR-10). */
export function generarCronograma(entrada: EntradaCronograma): Cronograma {
  partes(entrada.inicio);
  const cal = entrada.calendario ?? new CalendarioHabil();
  const fechas = new Map<string, FechaCivil>();
  const hitos: Hito[] = [];

  for (const p of plantillaDe(entrada.procedimiento)) {
    let fecha: FechaCivil;
    if (!p.regla) {
      fecha = cal.siguienteHabilDesde(entrada.inicio);
    } else {
      const ref = fechas.get(p.regla.referencia);
      if (!ref) throw new ErrorNormativo(`Plantilla inválida: ${p.codigo} referencia a ${p.regla.referencia}`);
      fecha = cal.sumarDiasHabiles(ref, entrada.plazos?.[p.codigo] ?? p.regla.sugerido);
    }
    fechas.set(p.codigo, fecha);
    hitos.push({
      codigo: p.codigo,
      nombre: p.nombre,
      fecha,
      ...(p.regla ? { regla: p.regla } : {}),
      fundamentos: p.fundamentos,
    });
  }

  hitos.sort((a, b) => compararFechas(a.fecha, b.fecha));
  return { procedimiento: entrada.procedimiento, hitos, versionReglas: VERSION_REGLAS };
}

/**
 * Valida un cronograma (posiblemente editado por el usuario) contra la plantilla legal
 * de su procedimiento (FR-11). Devuelve todas las violaciones encontradas.
 */
export function validarCronograma(
  procedimiento: Procedimiento,
  fechasPorHito: Readonly<Record<string, FechaCivil>>,
  calendario: CalendarioHabil = new CalendarioHabil(),
): Violacion[] {
  const violaciones: Violacion[] = [];

  for (const p of plantillaDe(procedimiento)) {
    const fecha = fechasPorHito[p.codigo];
    if (!fecha) {
      violaciones.push({
        codigoHito: p.codigo,
        tipo: 'HITO_FALTANTE',
        mensaje: `Falta el hito "${p.nombre}".`,
        fundamentos: p.fundamentos,
      });
      continue;
    }
    partes(fecha);

    if (!calendario.esDiaHabil(fecha)) {
      violaciones.push({
        codigoHito: p.codigo,
        tipo: 'DIA_NO_HABIL',
        mensaje: `"${p.nombre}" está programado el ${fecha}, que no es día hábil.`,
        fundamentos: p.fundamentos,
      });
    }

    const r = p.regla;
    if (!r) continue;
    const ref = fechasPorHito[r.referencia];
    if (!ref) {
      violaciones.push({
        codigoHito: p.codigo,
        tipo: 'REFERENCIA_FALTANTE',
        mensaje: `No se puede validar "${p.nombre}" porque falta el hito ${r.referencia}.`,
        fundamentos: p.fundamentos,
      });
      continue;
    }
    const d = calendario.contarDiasHabiles(ref, fecha);
    if (r.minimo !== undefined && d < r.minimo) {
      violaciones.push({
        codigoHito: p.codigo,
        tipo: 'PLAZO_MINIMO',
        mensaje: `"${p.nombre}" está a ${d} días hábiles de ${r.referencia}; el mínimo es ${r.minimo}.`,
        fundamentos: p.fundamentos,
      });
    }
    if (r.maximo !== undefined && d > r.maximo) {
      violaciones.push({
        codigoHito: p.codigo,
        tipo: 'PLAZO_MAXIMO',
        mensaje: `"${p.nombre}" está a ${d} días hábiles de ${r.referencia}; el máximo es ${r.maximo}.`,
        fundamentos: p.fundamentos,
      });
    }
  }

  return violaciones;
}

/** Atajo: valida un cronograma generado o editado. */
export function validarHitos(cronograma: Pick<Cronograma, 'procedimiento' | 'hitos'>, calendario?: CalendarioHabil): Violacion[] {
  const mapa: Record<string, FechaCivil> = {};
  for (const h of cronograma.hitos) mapa[h.codigo] = h.fecha;
  return validarCronograma(cronograma.procedimiento, mapa, calendario);
}
