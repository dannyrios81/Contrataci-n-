import type { Fundamento } from '../base/tipos.js';
import type { Procedimiento } from '../modalidades/tipos.js';

/**
 * Regla de plazo de un hito respecto de otro hito (o del inicio del cronograma).
 * Los límites se miden en días hábiles desde la fecha de la referencia hasta la del hito
 * (art. 62 Ley 4 de 1913: los plazos de días se entienden hábiles).
 */
export interface ReglaPlazo {
  referencia: string;
  /** Desplazamiento usado al generar; debe cumplir los límites. */
  sugerido: number;
  minimo?: number;
  maximo?: number;
}

export interface PlantillaHito {
  codigo: string;
  nombre: string;
  /** Ausente solo en el hito de inicio. */
  regla?: ReglaPlazo;
  fundamentos: Fundamento[];
}

const L80 = 'Ley 80 de 1993';
const D1082 = 'Decreto 1082 de 2015';

const hab = (referencia: string, sugerido: number, limites: { minimo?: number; maximo?: number } = {}): ReglaPlazo => ({
  referencia,
  sugerido,
  ...limites,
});

/** Publicación de documentos en SECOP II dentro de los 3 días hábiles siguientes a su expedición. */
const PUBLICACION_CONTRATO: PlantillaHito = {
  codigo: 'PUBLICACION_CONTRATO',
  nombre: 'Publicación del contrato en SECOP II',
  regla: hab('CELEBRACION_CONTRATO', 1, { minimo: 0, maximo: 3 }),
  fundamentos: [{ norma: D1082, articulo: '2.2.1.1.1.7.1' }],
};

/**
 * Plantillas de cronograma por procedimiento. Están ordenadas para que cada referencia
 * se calcule antes que el hito que la usa; el cronograma resultante se ordena por fecha.
 */
export const PLANTILLAS: Partial<Record<Procedimiento, readonly PlantillaHito[]>> = {
  LICITACION_PUBLICA: [
    {
      codigo: 'PUBLICACION_PROYECTO_PLIEGOS',
      nombre: 'Publicación del aviso de convocatoria, estudios previos y proyecto de pliego',
      fundamentos: [
        { norma: L80, articulo: '30 num. 3' },
        { norma: D1082, articulo: '2.2.1.1.2.1.4' },
      ],
    },
    {
      codigo: 'LIMITE_OBSERVACIONES_PROYECTO',
      nombre: 'Plazo para observaciones al proyecto de pliego',
      regla: hab('PUBLICACION_PROYECTO_PLIEGOS', 10, { minimo: 10 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4' }],
    },
    {
      codigo: 'APERTURA',
      nombre: 'Acto de apertura y publicación del pliego definitivo (inicio del plazo para ofertar)',
      // Diez días hábiles completos de antelación entre la publicación y el acto de apertura.
      regla: hab('PUBLICACION_PROYECTO_PLIEGOS', 11, { minimo: 11 }),
      fundamentos: [
        { norma: D1082, articulo: '2.2.1.1.2.1.4', verificar: true },
        { norma: D1082, articulo: '2.2.1.1.2.1.5' },
      ],
    },
    {
      codigo: 'AUDIENCIA_RIESGOS',
      nombre: 'Audiencia de asignación de riesgos y aclaración del pliego',
      regla: hab('APERTURA', 3, { minimo: 1, maximo: 3 }),
      fundamentos: [{ norma: L80, articulo: '30 num. 4' }],
    },
    {
      codigo: 'CIERRE',
      nombre: 'Cierre: plazo máximo para presentar ofertas',
      regla: hab('APERTURA', 10, { minimo: 4 }),
      fundamentos: [{ norma: L80, articulo: '30 num. 5' }],
    },
    {
      codigo: 'LIMITE_ADENDAS',
      nombre: 'Último día para expedir adendas',
      regla: hab('CIERRE', -3, { maximo: -3 }),
      fundamentos: [
        { norma: L80, articulo: '30 num. 5 (mod. Ley 1474 de 2011 art. 89)' },
        { norma: D1082, articulo: '2.2.1.1.2.2.1' },
      ],
    },
    {
      codigo: 'PUBLICACION_INFORME_EVALUACION',
      nombre: 'Publicación del informe de evaluación',
      regla: hab('CIERRE', 5, { minimo: 1 }),
      fundamentos: [{ norma: L80, articulo: '30 num. 7' }],
    },
    {
      codigo: 'FIN_TRASLADO_INFORME',
      nombre: 'Fin del traslado del informe de evaluación (observaciones)',
      regla: hab('PUBLICACION_INFORME_EVALUACION', 5, { minimo: 5 }),
      fundamentos: [{ norma: L80, articulo: '30 num. 8 (mod. Ley 1882 de 2018)' }],
    },
    {
      codigo: 'AUDIENCIA_ADJUDICACION',
      nombre: 'Audiencia pública de adjudicación',
      regla: hab('FIN_TRASLADO_INFORME', 2, { minimo: 1 }),
      fundamentos: [
        { norma: L80, articulo: '30 num. 10' },
        { norma: D1082, articulo: '2.2.1.2.1.1.2' },
      ],
    },
  ],

  SA_MENOR_CUANTIA: [
    {
      codigo: 'PUBLICACION_PROYECTO_PLIEGOS',
      nombre: 'Publicación del aviso de convocatoria, estudios previos y proyecto de pliego',
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4' }],
    },
    {
      codigo: 'LIMITE_OBSERVACIONES_PROYECTO',
      nombre: 'Plazo para observaciones al proyecto de pliego',
      regla: hab('PUBLICACION_PROYECTO_PLIEGOS', 5, { minimo: 5 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4' }],
    },
    {
      codigo: 'APERTURA',
      nombre: 'Acto de apertura y publicación del pliego definitivo',
      regla: hab('PUBLICACION_PROYECTO_PLIEGOS', 6, { minimo: 6 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4', verificar: true }],
    },
    {
      codigo: 'LIMITE_MANIFESTACION_INTERES',
      nombre: 'Plazo para manifestar interés en participar',
      regla: hab('APERTURA', 3, { minimo: 3, maximo: 3 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.20 num. 1' }],
    },
    {
      codigo: 'SORTEO',
      nombre: 'Sorteo de consolidación de oferentes (si hay más de 10 interesados)',
      regla: hab('LIMITE_MANIFESTACION_INTERES', 1, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.20 num. 2' }],
    },
    {
      codigo: 'CIERRE',
      nombre: 'Cierre: plazo máximo para presentar ofertas',
      regla: hab('SORTEO', 5, { minimo: 2 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.20' }],
    },
    {
      codigo: 'LIMITE_ADENDAS',
      nombre: 'Último día para expedir adendas',
      regla: hab('CIERRE', -1, { maximo: -1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.2.1' }],
    },
    {
      codigo: 'PUBLICACION_INFORME_EVALUACION',
      nombre: 'Publicación del informe de evaluación',
      regla: hab('CIERRE', 3, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.20 num. 4', verificar: true }],
    },
    {
      codigo: 'FIN_TRASLADO_INFORME',
      nombre: 'Fin del traslado del informe de evaluación',
      regla: hab('PUBLICACION_INFORME_EVALUACION', 3, { minimo: 3 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.20 num. 4', verificar: true }],
    },
    {
      codigo: 'ADJUDICACION',
      nombre: 'Acto de adjudicación',
      regla: hab('FIN_TRASLADO_INFORME', 2, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.20' }],
    },
  ],

  SA_SUBASTA_INVERSA: [
    {
      codigo: 'PUBLICACION_PROYECTO_PLIEGOS',
      nombre: 'Publicación del aviso de convocatoria, estudios previos y proyecto de pliego',
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4' }],
    },
    {
      codigo: 'APERTURA',
      nombre: 'Acto de apertura y publicación del pliego definitivo',
      regla: hab('PUBLICACION_PROYECTO_PLIEGOS', 6, { minimo: 6 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4', verificar: true }],
    },
    {
      codigo: 'CIERRE',
      nombre: 'Cierre: presentación de ofertas y documentos habilitantes',
      regla: hab('APERTURA', 5, { minimo: 2 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.2' }],
    },
    {
      codigo: 'LIMITE_ADENDAS',
      nombre: 'Último día para expedir adendas',
      regla: hab('CIERRE', -1, { maximo: -1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.2.1' }],
    },
    {
      codigo: 'PUBLICACION_INFORME_HABILITANTES',
      nombre: 'Publicación del informe de verificación de requisitos habilitantes',
      regla: hab('CIERRE', 3, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.2 num. 3', verificar: true }],
    },
    {
      codigo: 'FIN_TRASLADO_INFORME',
      nombre: 'Fin del traslado del informe de habilitantes',
      regla: hab('PUBLICACION_INFORME_HABILITANTES', 3, { minimo: 3 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.2', verificar: true }],
    },
    {
      codigo: 'SUBASTA',
      nombre: 'Subasta inversa (presencial o electrónica)',
      regla: hab('FIN_TRASLADO_INFORME', 2, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.2.2 num. 5' }],
    },
  ],

  CONCURSO_MERITOS: [
    {
      codigo: 'PUBLICACION_PROYECTO_PLIEGOS',
      nombre: 'Publicación del aviso de convocatoria, estudios previos y proyecto de pliego',
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4' }],
    },
    {
      codigo: 'LIMITE_OBSERVACIONES_PROYECTO',
      nombre: 'Plazo para observaciones al proyecto de pliego',
      regla: hab('PUBLICACION_PROYECTO_PLIEGOS', 5, { minimo: 5 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4' }],
    },
    {
      codigo: 'APERTURA',
      nombre: 'Acto de apertura y publicación del pliego definitivo',
      regla: hab('PUBLICACION_PROYECTO_PLIEGOS', 6, { minimo: 6 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.4', verificar: true }],
    },
    {
      codigo: 'CIERRE',
      nombre: 'Cierre: plazo máximo para presentar ofertas',
      regla: hab('APERTURA', 10, { minimo: 2 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.3.2' }],
    },
    {
      codigo: 'LIMITE_ADENDAS',
      nombre: 'Último día para expedir adendas',
      regla: hab('CIERRE', -1, { maximo: -1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.2.1' }],
    },
    {
      codigo: 'PUBLICACION_INFORME_EVALUACION',
      nombre: 'Publicación del informe de evaluación técnica',
      regla: hab('CIERRE', 5, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.3.2 num. 3', verificar: true }],
    },
    {
      codigo: 'FIN_TRASLADO_INFORME',
      nombre: 'Fin del traslado del informe de evaluación',
      regla: hab('PUBLICACION_INFORME_EVALUACION', 3, { minimo: 3 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.3.2', verificar: true }],
    },
    {
      codigo: 'APERTURA_OFERTA_ECONOMICA',
      nombre: 'Apertura de la oferta económica del primer elegible y adjudicación',
      regla: hab('FIN_TRASLADO_INFORME', 2, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.3.2 num. 4' }],
    },
  ],

  MINIMA_CUANTIA: [
    {
      codigo: 'PUBLICACION_INVITACION',
      nombre: 'Publicación de la invitación y estudios previos',
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.5.2 num. 1-2' }],
    },
    {
      codigo: 'CIERRE',
      nombre: 'Cierre: plazo máximo para presentar ofertas',
      regla: hab('PUBLICACION_INVITACION', 2, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.5.2 num. 3' }],
    },
    {
      codigo: 'LIMITE_ADENDAS',
      nombre: 'Último día para expedir adendas',
      regla: hab('CIERRE', -1, { maximo: -1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.2.1' }],
    },
    {
      codigo: 'PUBLICACION_INFORME_EVALUACION',
      nombre: 'Publicación del informe de evaluación',
      regla: hab('CIERRE', 1, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.5.2 num. 5' }],
    },
    {
      codigo: 'FIN_TRASLADO_INFORME',
      nombre: 'Fin del término para observaciones al informe',
      regla: hab('PUBLICACION_INFORME_EVALUACION', 1, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.5.2 num. 5' }],
    },
    {
      codigo: 'COMUNICACION_ACEPTACION',
      nombre: 'Comunicación de aceptación de la oferta',
      regla: hab('FIN_TRASLADO_INFORME', 1, { minimo: 1 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.5.2 num. 6' }],
    },
  ],

  CONTRATACION_DIRECTA: [
    {
      codigo: 'ESTUDIOS_PREVIOS',
      nombre: 'Estudios y documentos previos',
      fundamentos: [{ norma: D1082, articulo: '2.2.1.1.2.1.1' }],
    },
    {
      codigo: 'ACTO_JUSTIFICACION',
      nombre: 'Acto administrativo de justificación (cuando aplique)',
      regla: hab('ESTUDIOS_PREVIOS', 1, { minimo: 0 }),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.1.4.1' }],
    },
    {
      codigo: 'CELEBRACION_CONTRATO',
      nombre: 'Celebración del contrato',
      regla: hab('ACTO_JUSTIFICACION', 2, { minimo: 0 }),
      fundamentos: [{ norma: 'Ley 1150 de 2007', articulo: '2 num. 4' }],
    },
    PUBLICACION_CONTRATO,
  ],
};
