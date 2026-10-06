import { exigirPositivo } from '../base/dinero.js';
import { compararFechas } from '../base/fecha-civil.js';
import { ErrorNormativo, VERSION_REGLAS, type Fundamento } from '../base/tipos.js';
import type {
  Advertencia,
  CausalDirecta,
  CausalSeleccionAbreviada,
  EntradaModalidad,
  Modalidad,
  Procedimiento,
  RecomendacionModalidad,
} from './tipos.js';

const LEY_1150 = 'Ley 1150 de 2007';
const DEC_1082 = 'Decreto 1082 de 2015';

const LITERAL_DIRECTA: Record<CausalDirecta, string> = {
  URGENCIA_MANIFIESTA: 'a',
  EMPRESTITOS: 'b',
  INTERADMINISTRATIVO: 'c',
  DEFENSA_RESERVA: 'd',
  CIENCIA_TECNOLOGIA: 'e',
  ENCARGO_FIDUCIARIO_REESTRUCTURACION: 'f',
  NO_PLURALIDAD_OFERENTES: 'g',
  SERVICIOS_PROFESIONALES_APOYO_GESTION: 'h',
  ARRENDAMIENTO_ADQUISICION_INMUEBLES: 'i',
};

const LITERAL_SA: Record<CausalSeleccionAbreviada, string> = {
  SERVICIOS_SALUD: 'c',
  LICITACION_DESIERTA: 'd',
  ENAJENACION_BIENES: 'e',
  PRODUCTOS_AGROPECUARIOS: 'f',
  EICE_ACTIVIDAD_COMERCIAL: 'g',
  PROGRAMAS_PROTECCION_POBLACION: 'h',
  DEFENSA_SEGURIDAD_NACIONAL: 'i',
};

/**
 * Causales de directa que no requieren un acto de justificación separado: en servicios
 * profesionales no es necesario y en urgencia manifiesta el acto que la declara hace sus veces.
 */
const DIRECTA_SIN_ACTO_JUSTIFICACION: ReadonlySet<CausalDirecta> = new Set([
  'SERVICIOS_PROFESIONALES_APOYO_GESTION',
  'URGENCIA_MANIFIESTA',
]);

type Base = Omit<RecomendacionModalidad, 'advertencias' | 'versionReglas'>;

function base(
  modalidad: Modalidad,
  procedimiento: Procedimiento,
  regla: string,
  explicacion: string,
  fundamentos: Fundamento[],
): Base {
  return { modalidad, procedimiento, regla, explicacion, fundamentos };
}

function determinar(e: EntradaModalidad): Base {
  const { valorEstimado: valor, cuantias } = e;

  if (e.causalDirecta) {
    return base(
      'CONTRATACION_DIRECTA',
      'CONTRATACION_DIRECTA',
      'R1_CAUSAL_DIRECTA',
      'Se invocó una causal taxativa de contratación directa.',
      [{ norma: LEY_1150, articulo: `2 num. 4 lit. ${LITERAL_DIRECTA[e.causalDirecta]}` }],
    );
  }

  if (e.cubiertoPorAcuerdoMarco && e.caracteristicasTecnicasUniformes) {
    return base(
      'SELECCION_ABREVIADA',
      'SA_ACUERDO_MARCO',
      'R2_ACUERDO_MARCO',
      'El bien o servicio de características técnicas uniformes está cubierto por un Acuerdo Marco de Precios vigente.',
      [
        { norma: LEY_1150, articulo: '2 num. 2 lit. a' },
        { norma: DEC_1082, articulo: '2.2.1.2.1.2.7', verificar: true },
      ],
    );
  }

  if (valor <= cuantias.minimaCuantia) {
    return base(
      'MINIMA_CUANTIA',
      'MINIMA_CUANTIA',
      'R3_MINIMA_CUANTIA',
      'El valor no excede el 10 % de la menor cuantía de la entidad, independientemente del objeto.',
      [
        { norma: 'Ley 1474 de 2011', articulo: '94' },
        { norma: DEC_1082, articulo: '2.2.1.2.1.5.1' },
      ],
    );
  }

  if (e.tipoObjeto === 'CONSULTORIA' || e.tipoObjeto === 'INTERVENTORIA') {
    return base(
      'CONCURSO_MERITOS',
      'CONCURSO_MERITOS',
      'R4_CONSULTORIA',
      'Los contratos de consultoría (incluida la interventoría) se seleccionan por concurso de méritos.',
      [
        { norma: LEY_1150, articulo: '2 num. 3' },
        { norma: 'Ley 80 de 1993', articulo: '32 num. 2' },
      ],
    );
  }

  if (e.caracteristicasTecnicasUniformes) {
    const bolsa = e.bolsaDeProductos === true;
    return base(
      'SELECCION_ABREVIADA',
      bolsa ? 'SA_BOLSA_PRODUCTOS' : 'SA_SUBASTA_INVERSA',
      'R5_CARACTERISTICAS_UNIFORMES',
      bolsa
        ? 'Bienes de características técnicas uniformes adquiridos en bolsa de productos.'
        : 'Bienes o servicios de características técnicas uniformes: subasta inversa.',
      [{ norma: LEY_1150, articulo: '2 num. 2 lit. a' }],
    );
  }

  if (e.causalSeleccionAbreviada) {
    return base(
      'SELECCION_ABREVIADA',
      'SA_MENOR_CUANTIA',
      'R6_CAUSAL_SELECCION_ABREVIADA',
      'Se invocó una causal de selección abreviada; se sigue el procedimiento de menor cuantía.',
      [
        { norma: LEY_1150, articulo: `2 num. 2 lit. ${LITERAL_SA[e.causalSeleccionAbreviada]}` },
        { norma: DEC_1082, articulo: '2.2.1.2.1.2.1 y ss.', verificar: true },
      ],
    );
  }

  if (valor <= cuantias.menorCuantia) {
    return base(
      'SELECCION_ABREVIADA',
      'SA_MENOR_CUANTIA',
      'R7_MENOR_CUANTIA',
      'El valor no excede la menor cuantía de la entidad.',
      [
        { norma: LEY_1150, articulo: '2 num. 2 lit. b' },
        { norma: DEC_1082, articulo: '2.2.1.2.1.2.20' },
      ],
    );
  }

  return base(
    'LICITACION_PUBLICA',
    'LICITACION_PUBLICA',
    'R8_REGLA_GENERAL',
    'La licitación pública es la regla general cuando no aplica otra modalidad.',
    [
      { norma: LEY_1150, articulo: '2 num. 1' },
      { norma: 'Ley 80 de 1993', articulo: '30' },
    ],
  );
}

function advertencias(e: EntradaModalidad, r: Base): Advertencia[] {
  const lista: Advertencia[] = [];
  const competitiva = r.modalidad !== 'CONTRATACION_DIRECTA' && r.procedimiento !== 'SA_ACUERDO_MARCO';

  if (
    competitiva &&
    (e.tipoObjeto === 'OBRA' || e.tipoObjeto === 'INTERVENTORIA' || e.tipoObjeto === 'CONSULTORIA')
  ) {
    lista.push({
      codigo: 'PLIEGO_TIPO',
      mensaje:
        'Verifique si Colombia Compra Eficiente adoptó un documento tipo para este objeto; su uso es obligatorio.',
      fundamentos: [{ norma: 'Ley 2022 de 2020', articulo: '1' }],
    });
  }

  if (competitiva && e.umbralMipyme !== undefined && e.valorEstimado < e.umbralMipyme) {
    lista.push({
      codigo: 'MIPYME',
      mensaje:
        'El valor es inferior al umbral Mipyme: la convocatoria debe limitarse a Mipyme si al menos dos lo solicitan antes de la apertura.',
      fundamentos: [{ norma: DEC_1082, articulo: '2.2.1.2.4.2.2 (mod. Decreto 1860 de 2021)', verificar: true }],
    });
  }

  if (e.caracteristicasTecnicasUniformes && !e.cubiertoPorAcuerdoMarco) {
    lista.push({
      codigo: 'ACUERDO_MARCO',
      mensaje:
        'Verifique en la Tienda Virtual del Estado Colombiano si existe un Acuerdo Marco de Precios vigente para este bien o servicio.',
      fundamentos: [{ norma: DEC_1082, articulo: '2.2.1.2.1.2.7', verificar: true }],
    });
  }

  if (r.modalidad === 'CONTRATACION_DIRECTA' && e.causalDirecta) {
    if (!DIRECTA_SIN_ACTO_JUSTIFICACION.has(e.causalDirecta)) {
      lista.push({
        codigo: 'JUSTIFICACION_DIRECTA',
        mensaje: 'Debe expedirse el acto administrativo de justificación de la contratación directa.',
        fundamentos: [{ norma: DEC_1082, articulo: '2.2.1.2.1.4.1', verificar: true }],
      });
    }
    lista.push({
      codigo: 'GARANTIAS_NO_OBLIGATORIAS',
      mensaje:
        'En contratación directa las garantías no son obligatorias; si no se exigen, justifíquelo en los estudios previos.',
      fundamentos: [{ norma: LEY_1150, articulo: '7' }],
    });
  }

  if (r.modalidad === 'MINIMA_CUANTIA') {
    lista.push({
      codigo: 'GARANTIAS_NO_OBLIGATORIAS',
      mensaje: 'En mínima cuantía la entidad decide si exige garantías, según el riesgo del contrato.',
      fundamentos: [{ norma: DEC_1082, articulo: '2.2.1.2.1.5.4' }],
    });
  }

  if (e.fechaPrevista && e.periodosLeyGarantias) {
    for (const p of e.periodosLeyGarantias) {
      const dentro =
        compararFechas(p.desde, e.fechaPrevista) <= 0 && compararFechas(e.fechaPrevista, p.hasta) <= 0;
      if (!dentro) continue;
      const aplica =
        (p.alcance === 'CONTRATACION_DIRECTA' && r.modalidad === 'CONTRATACION_DIRECTA') ||
        (p.alcance === 'CONVENIOS_INTERADMINISTRATIVOS' && e.causalDirecta === 'INTERADMINISTRATIVO');
      if (!aplica) continue;
      lista.push({
        codigo: 'LEY_GARANTIAS',
        mensaje: `La fecha prevista cae en el periodo restringido "${p.descripcion}" (${p.desde} a ${p.hasta}). Verifique si aplica una excepción legal.`,
        fundamentos: [
          {
            norma: 'Ley 996 de 2005',
            articulo: p.alcance === 'CONTRATACION_DIRECTA' ? '33' : '38 par.',
          },
        ],
      });
    }
  }

  return lista;
}

/** Recomienda la modalidad de selección (FR-4) con sus advertencias (FR-5). */
export function recomendarModalidad(entrada: EntradaModalidad): RecomendacionModalidad {
  exigirPositivo(entrada.valorEstimado, 'El valor estimado');
  if (entrada.cuantias.minimaCuantia > entrada.cuantias.menorCuantia) {
    throw new ErrorNormativo('La mínima cuantía no puede superar la menor cuantía');
  }
  if (entrada.causalDirecta && entrada.causalSeleccionAbreviada) {
    throw new ErrorNormativo('No se pueden invocar a la vez una causal de directa y una de selección abreviada');
  }
  const r = determinar(entrada);
  return { ...r, advertencias: advertencias(entrada, r), versionReglas: VERSION_REGLAS };
}
