import { compararFechas, partes, sumarAnios, sumarMeses } from '../base/fecha-civil.js';
import { ErrorNormativo, type FechaCivil, type Fundamento } from '../base/tipos.js';

export interface EntradaLiquidacion {
  /** Fecha de terminación (vencimiento del plazo) del contrato. */
  fechaTerminacion: FechaCivil;
  /** Plazo para liquidar de mutuo acuerdo pactado en el pliego o el contrato. */
  plazoPactadoMeses?: number;
  /** Prestación de servicios profesionales y de apoyo a la gestión. */
  serviciosProfesionalesApoyoGestion?: boolean;
  /** Fecha de referencia para determinar la etapa actual (el motor no lee el reloj, AD-1). */
  hoy?: FechaCivil;
}

export type EtapaLiquidacion = 'EN_EJECUCION' | 'BILATERAL' | 'UNILATERAL' | 'CUALQUIER_TIEMPO' | 'VENCIDA';

export interface PlazosLiquidacion {
  obligatoria: boolean;
  bilateralHasta: FechaCivil;
  unilateralHasta: FechaCivil;
  /** Último día para liquidar (bilateral o unilateralmente) antes de perder competencia. */
  limite: FechaCivil;
  etapa?: EtapaLiquidacion;
  fundamentos: Fundamento[];
}

/** Calcula los plazos de liquidación del contrato (FR-28). */
export function calcularPlazosLiquidacion(e: EntradaLiquidacion): PlazosLiquidacion {
  partes(e.fechaTerminacion);
  const meses = e.plazoPactadoMeses ?? 4;
  if (!Number.isInteger(meses) || meses < 0) throw new ErrorNormativo(`Plazo pactado inválido: ${meses}`);

  const bilateralHasta = sumarMeses(e.fechaTerminacion, meses);
  const unilateralHasta = sumarMeses(bilateralHasta, 2);
  const limite = sumarAnios(unilateralHasta, 2);

  let etapa: EtapaLiquidacion | undefined;
  if (e.hoy) {
    partes(e.hoy);
    if (compararFechas(e.hoy, e.fechaTerminacion) <= 0) etapa = 'EN_EJECUCION';
    else if (compararFechas(e.hoy, bilateralHasta) <= 0) etapa = 'BILATERAL';
    else if (compararFechas(e.hoy, unilateralHasta) <= 0) etapa = 'UNILATERAL';
    else if (compararFechas(e.hoy, limite) <= 0) etapa = 'CUALQUIER_TIEMPO';
    else etapa = 'VENCIDA';
  }

  const fundamentos: Fundamento[] = [
    { norma: 'Ley 1150 de 2007', articulo: '11' },
    { norma: 'Ley 1437 de 2011 (CPACA)', articulo: '164 num. 2 lit. j' },
  ];
  const obligatoria = !e.serviciosProfesionalesApoyoGestion;
  if (!obligatoria) fundamentos.push({ norma: 'Ley 80 de 1993', articulo: '60 (mod. Decreto 19 de 2012 art. 217)' });

  return { obligatoria, bilateralHasta, unilateralHasta, limite, ...(etapa ? { etapa } : {}), fundamentos };
}
