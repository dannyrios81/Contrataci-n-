import { exigirPositivo } from '../base/dinero.js';
import type { Fundamento, Pesos } from '../base/tipos.js';

export interface EntradaCuantias {
  /** Presupuesto anual de la entidad para la vigencia, en pesos. */
  presupuestoAnual: Pesos;
  /** SMMLV de la vigencia, en pesos. */
  smmlv: Pesos;
}

export interface Cuantias {
  /** Presupuesto anual expresado en SMMLV (parte entera). */
  presupuestoEnSmmlv: bigint;
  menorCuantiaSmmlv: bigint;
  menorCuantia: Pesos;
  minimaCuantia: Pesos;
  fundamentos: Fundamento[];
}

/** Tramos del art. 2 num. 2 lit. b de la Ley 1150 de 2007: [presupuesto mínimo en SMMLV, menor cuantía en SMMLV]. */
const TRAMOS: ReadonlyArray<readonly [bigint, bigint]> = [
  [1_200_000n, 1_000n],
  [850_000n, 850n],
  [400_000n, 650n],
  [120_000n, 450n],
  [0n, 280n],
];

export function calcularCuantias({ presupuestoAnual, smmlv }: EntradaCuantias): Cuantias {
  exigirPositivo(presupuestoAnual, 'El presupuesto anual');
  exigirPositivo(smmlv, 'El SMMLV');

  // Comparación entera: presupuesto >= umbral * smmlv (AD-3).
  const tramo = TRAMOS.find(([umbral]) => presupuestoAnual >= umbral * smmlv) ?? TRAMOS[TRAMOS.length - 1]!;
  const menorCuantiaSmmlv = tramo[1];
  const menorCuantia = menorCuantiaSmmlv * smmlv;
  return {
    presupuestoEnSmmlv: presupuestoAnual / smmlv,
    menorCuantiaSmmlv,
    menorCuantia,
    // Todos los topes son múltiplos de 10 SMMLV, así que la división es exacta.
    minimaCuantia: menorCuantia / 10n,
    fundamentos: [
      { norma: 'Ley 1150 de 2007', articulo: '2 num. 2 lit. b' },
      { norma: 'Ley 1474 de 2011', articulo: '94' },
    ],
  };
}
