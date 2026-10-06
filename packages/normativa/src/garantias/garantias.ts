import { porcentajeTecho, exigirNoNegativo, exigirPositivo } from '../base/dinero.js';
import { compararFechas, partes, sumarAnios, sumarMeses } from '../base/fecha-civil.js';
import { ErrorNormativo, type FechaCivil, type Fundamento, type Pesos } from '../base/tipos.js';
import type { Modalidad, TipoObjeto } from '../modalidades/tipos.js';

export type TipoAmparo =
  | 'CUMPLIMIENTO'
  | 'BUEN_MANEJO_ANTICIPO'
  | 'PAGO_ANTICIPADO'
  | 'SALARIOS_PRESTACIONES'
  | 'ESTABILIDAD_CALIDAD_OBRA'
  | 'RESPONSABILIDAD_CIVIL_EXTRACONTRACTUAL';

export interface Amparo {
  tipo: TipoAmparo;
  valorAsegurado: Pesos;
  vigenciaHasta: FechaCivil;
}

export interface EntradaGarantias {
  modalidad: Modalidad;
  tipoObjeto: TipoObjeto;
  valorContrato: Pesos;
  smmlv: Pesos;
  fechaTerminacion: FechaCivil;
  /** Fecha de recibo a satisfacción de la obra; por defecto la de terminación. */
  fechaRecibo?: FechaCivil;
  anticipo?: Pesos;
  pagoAnticipado?: Pesos;
  /** El contratista emplea personal para ejecutar el contrato. */
  empleaPersonal?: boolean;
  /** En mínima cuantía y contratación directa, la entidad decidió exigir garantías. */
  garantiasExigidas?: boolean;
  /** Meses previstos para liquidar, que debe cubrir el amparo de cumplimiento (por defecto 4). */
  mesesLiquidacion?: number;
  amparos: readonly Amparo[];
}

export interface ViolacionGarantia {
  amparo: TipoAmparo;
  tipo: 'FALTANTE' | 'VALOR_INSUFICIENTE' | 'VIGENCIA_INSUFICIENTE';
  mensaje: string;
  minimoValor?: Pesos;
  minimaVigencia?: FechaCivil;
  fundamentos: Fundamento[];
}

export interface ResultadoGarantias {
  obligatorias: boolean;
  violaciones: ViolacionGarantia[];
  advertencias: string[];
}

const D1082 = 'Decreto 1082 de 2015';

interface Requisito {
  amparo: TipoAmparo;
  minimoValor: Pesos;
  minimaVigencia: FechaCivil;
  fundamentos: Fundamento[];
}

/** Valor mínimo del amparo de RCE en obra según el valor del contrato (art. 2.2.1.2.3.2.9). */
export function minimoRce(valorContrato: Pesos, smmlv: Pesos): Pesos {
  const tramos: ReadonlyArray<readonly [bigint, bigint]> = [
    [1_500n, 200n],
    [2_500n, 300n],
    [5_000n, 400n],
    [10_000n, 500n],
  ];
  for (const [hasta, minimo] of tramos) {
    if (valorContrato <= hasta * smmlv) return minimo * smmlv;
  }
  const cincoPorCiento = porcentajeTecho(valorContrato, 5n);
  const tope = 75_000n * smmlv;
  return cincoPorCiento < tope ? cincoPorCiento : tope;
}

function requisitos(e: EntradaGarantias): Requisito[] {
  const lista: Requisito[] = [];
  const vigenciaLiquidacion = sumarMeses(e.fechaTerminacion, e.mesesLiquidacion ?? 4);

  lista.push({
    amparo: 'CUMPLIMIENTO',
    minimoValor: porcentajeTecho(e.valorContrato, 10n),
    minimaVigencia: vigenciaLiquidacion,
    fundamentos: [{ norma: D1082, articulo: '2.2.1.2.3.1.12' }],
  });

  if ((e.anticipo ?? 0n) > 0n) {
    lista.push({
      amparo: 'BUEN_MANEJO_ANTICIPO',
      minimoValor: e.anticipo!,
      minimaVigencia: vigenciaLiquidacion,
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.3.1.7 num. 1 y 2.2.1.2.3.1.16', verificar: true }],
    });
  }

  if ((e.pagoAnticipado ?? 0n) > 0n) {
    lista.push({
      amparo: 'PAGO_ANTICIPADO',
      minimoValor: e.pagoAnticipado!,
      minimaVigencia: vigenciaLiquidacion,
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.3.1.7 num. 2 y 2.2.1.2.3.1.17', verificar: true }],
    });
  }

  if (e.empleaPersonal || e.tipoObjeto === 'OBRA') {
    lista.push({
      amparo: 'SALARIOS_PRESTACIONES',
      minimoValor: porcentajeTecho(e.valorContrato, 5n),
      minimaVigencia: sumarAnios(e.fechaTerminacion, 3),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.3.1.13' }],
    });
  }

  if (e.tipoObjeto === 'OBRA') {
    lista.push({
      amparo: 'ESTABILIDAD_CALIDAD_OBRA',
      // El valor lo define la entidad según el riesgo; el motor solo exige que exista.
      minimoValor: 1n,
      minimaVigencia: sumarAnios(e.fechaRecibo ?? e.fechaTerminacion, 5),
      fundamentos: [{ norma: D1082, articulo: '2.2.1.2.3.1.14' }],
    });
    lista.push({
      amparo: 'RESPONSABILIDAD_CIVIL_EXTRACONTRACTUAL',
      minimoValor: minimoRce(e.valorContrato, e.smmlv),
      minimaVigencia: e.fechaTerminacion,
      fundamentos: [
        { norma: D1082, articulo: '2.2.1.2.3.1.8' },
        { norma: D1082, articulo: '2.2.1.2.3.2.9', verificar: true },
      ],
    });
  }

  return lista;
}

const formato = (v: Pesos) => `$${v.toLocaleString('es-CO')}`;

/** Valida los amparos de un contrato frente a los mínimos legales (FR-22). */
export function validarGarantias(e: EntradaGarantias): ResultadoGarantias {
  exigirPositivo(e.valorContrato, 'El valor del contrato');
  exigirPositivo(e.smmlv, 'El SMMLV');
  exigirNoNegativo(e.anticipo ?? 0n, 'El anticipo');
  exigirNoNegativo(e.pagoAnticipado ?? 0n, 'El pago anticipado');
  partes(e.fechaTerminacion);
  if (e.fechaRecibo) partes(e.fechaRecibo);
  if ((e.anticipo ?? 0n) + (e.pagoAnticipado ?? 0n) > e.valorContrato) {
    throw new ErrorNormativo('El anticipo más el pago anticipado no pueden superar el valor del contrato');
  }

  const advertencias: string[] = [];
  const opcionales = e.modalidad === 'MINIMA_CUANTIA' || e.modalidad === 'CONTRATACION_DIRECTA';
  if (opcionales && !e.garantiasExigidas) {
    advertencias.push(
      e.modalidad === 'MINIMA_CUANTIA'
        ? 'En mínima cuantía las garantías no son obligatorias (art. 2.2.1.2.1.5.4 Decreto 1082 de 2015); la entidad no las exigió.'
        : 'En contratación directa las garantías no son obligatorias (art. 7 Ley 1150 de 2007); justifique la decisión en los estudios previos.',
    );
    return { obligatorias: false, violaciones: [], advertencias };
  }

  if (e.valorContrato > 1_000_000n * e.smmlv) {
    advertencias.push(
      'El contrato supera 1.000.000 SMMLV: aplican porcentajes especiales del amparo de cumplimiento (art. 2.2.1.2.3.1.12 Decreto 1082 de 2015). Validación manual requerida.',
    );
  }

  const violaciones: ViolacionGarantia[] = [];
  for (const req of requisitos(e)) {
    const amparos = e.amparos.filter((a) => a.tipo === req.amparo);
    if (amparos.length === 0) {
      violaciones.push({
        amparo: req.amparo,
        tipo: 'FALTANTE',
        mensaje: `Falta el amparo ${req.amparo}.`,
        minimoValor: req.minimoValor,
        minimaVigencia: req.minimaVigencia,
        fundamentos: req.fundamentos,
      });
      continue;
    }
    const valor = amparos.reduce((s, a) => s + a.valorAsegurado, 0n);
    const vigencia = amparos.map((a) => a.vigenciaHasta).sort(compararFechas).at(-1)!;
    if (valor < req.minimoValor) {
      violaciones.push({
        amparo: req.amparo,
        tipo: 'VALOR_INSUFICIENTE',
        mensaje: `El amparo ${req.amparo} asegura ${formato(valor)}; el mínimo es ${formato(req.minimoValor)}.`,
        minimoValor: req.minimoValor,
        fundamentos: req.fundamentos,
      });
    }
    if (compararFechas(vigencia, req.minimaVigencia) < 0) {
      violaciones.push({
        amparo: req.amparo,
        tipo: 'VIGENCIA_INSUFICIENTE',
        mensaje: `El amparo ${req.amparo} vence el ${vigencia}; debe cubrir al menos hasta el ${req.minimaVigencia}.`,
        minimaVigencia: req.minimaVigencia,
        fundamentos: req.fundamentos,
      });
    }
  }

  return { obligatorias: true, violaciones, advertencias };
}
