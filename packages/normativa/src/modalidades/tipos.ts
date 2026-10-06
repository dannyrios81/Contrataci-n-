import type { FechaCivil, Fundamento, Pesos } from '../base/tipos.js';
import type { Cuantias } from '../cuantias/cuantias.js';

export type Modalidad =
  | 'LICITACION_PUBLICA'
  | 'SELECCION_ABREVIADA'
  | 'CONCURSO_MERITOS'
  | 'CONTRATACION_DIRECTA'
  | 'MINIMA_CUANTIA';

/** Procedimiento concreto dentro de la modalidad; determina el cronograma. */
export type Procedimiento =
  | 'LICITACION_PUBLICA'
  | 'SA_MENOR_CUANTIA'
  | 'SA_SUBASTA_INVERSA'
  | 'SA_ACUERDO_MARCO'
  | 'SA_BOLSA_PRODUCTOS'
  | 'CONCURSO_MERITOS'
  | 'MINIMA_CUANTIA'
  | 'CONTRATACION_DIRECTA';

export type TipoObjeto =
  | 'OBRA'
  | 'CONSULTORIA'
  | 'INTERVENTORIA'
  | 'PRESTACION_SERVICIOS'
  | 'SUMINISTRO'
  | 'COMPRAVENTA'
  | 'ARRENDAMIENTO'
  | 'OTRO';

/** Causales de contratación directa (art. 2 num. 4 Ley 1150 de 2007). */
export type CausalDirecta =
  | 'URGENCIA_MANIFIESTA'
  | 'EMPRESTITOS'
  | 'INTERADMINISTRATIVO'
  | 'DEFENSA_RESERVA'
  | 'CIENCIA_TECNOLOGIA'
  | 'ENCARGO_FIDUCIARIO_REESTRUCTURACION'
  | 'NO_PLURALIDAD_OFERENTES'
  | 'SERVICIOS_PROFESIONALES_APOYO_GESTION'
  | 'ARRENDAMIENTO_ADQUISICION_INMUEBLES';

/** Causales de selección abreviada distintas de menor cuantía y CTU (art. 2 num. 2 Ley 1150 de 2007). */
export type CausalSeleccionAbreviada =
  | 'SERVICIOS_SALUD'
  | 'LICITACION_DESIERTA'
  | 'ENAJENACION_BIENES'
  | 'PRODUCTOS_AGROPECUARIOS'
  | 'EICE_ACTIVIDAD_COMERCIAL'
  | 'PROGRAMAS_PROTECCION_POBLACION'
  | 'DEFENSA_SEGURIDAD_NACIONAL';

export interface PeriodoLeyGarantias {
  desde: FechaCivil;
  hasta: FechaCivil;
  alcance: 'CONTRATACION_DIRECTA' | 'CONVENIOS_INTERADMINISTRATIVOS';
  descripcion: string;
}

export interface EntradaModalidad {
  tipoObjeto: TipoObjeto;
  valorEstimado: Pesos;
  cuantias: Pick<Cuantias, 'menorCuantia' | 'minimaCuantia'>;
  causalDirecta?: CausalDirecta;
  causalSeleccionAbreviada?: CausalSeleccionAbreviada;
  /** Bienes o servicios de características técnicas uniformes y de común utilización. */
  caracteristicasTecnicasUniformes?: boolean;
  /** Existe Acuerdo Marco de Precios vigente que cubre el bien o servicio. */
  cubiertoPorAcuerdoMarco?: boolean;
  /** Se adquirirá en bolsa de productos. */
  bolsaDeProductos?: boolean;
  /** Umbral en pesos para limitar la convocatoria a Mipyme (Decreto 1860 de 2021). */
  umbralMipyme?: Pesos;
  /** Fecha prevista de celebración, para la Ley de Garantías. */
  fechaPrevista?: FechaCivil;
  periodosLeyGarantias?: readonly PeriodoLeyGarantias[];
}

export type CodigoAdvertencia =
  | 'PLIEGO_TIPO'
  | 'MIPYME'
  | 'ACUERDO_MARCO'
  | 'LEY_GARANTIAS'
  | 'JUSTIFICACION_DIRECTA'
  | 'GARANTIAS_NO_OBLIGATORIAS';

export interface Advertencia {
  codigo: CodigoAdvertencia;
  mensaje: string;
  fundamentos: Fundamento[];
}

export interface RecomendacionModalidad {
  modalidad: Modalidad;
  procedimiento: Procedimiento;
  /** Regla del motor que produjo la recomendación, para trazabilidad. */
  regla: string;
  explicacion: string;
  fundamentos: Fundamento[];
  advertencias: Advertencia[];
  versionReglas: string;
}
