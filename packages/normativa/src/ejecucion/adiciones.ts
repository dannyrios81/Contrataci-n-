import { exigirPositivo } from '../base/dinero.js';
import type { Fundamento, Pesos } from '../base/tipos.js';

export interface ValorEnVigencia {
  valor: Pesos;
  /** SMMLV de la vigencia en que se pactó el valor. */
  smmlv: Pesos;
}

export interface EntradaAdicion {
  valorInicial: ValorEnVigencia;
  adicionesPrevias: readonly ValorEnVigencia[];
  nuevaAdicion: ValorEnVigencia;
  /**
   * Interventoría prorrogada por el mismo plazo del contrato vigilado: no aplica el
   * límite del 50 % (art. 85 Ley 1474 de 2011).
   */
  interventoriaProrrogadaConVigilado?: boolean;
}

export interface ResultadoAdicion {
  permitida: boolean;
  /** Porcentaje acumulado (incluida la nueva) sobre el valor inicial en SMMLV, con 2 decimales. */
  porcentajeAcumulado: number;
  mensaje: string;
  fundamentos: Fundamento[];
}

const PARAGRAFO_40: Fundamento = { norma: 'Ley 80 de 1993', articulo: '40 par.' };

function mcm(a: bigint, b: bigint): bigint {
  let x = a;
  let y = b;
  while (y !== 0n) [x, y] = [y, x % y];
  return (a / x) * b;
}

/**
 * Verifica que las adiciones acumuladas, expresadas en SMMLV, no superen el 50 % del valor
 * inicial expresado en SMMLV (FR-27). Usa aritmética racional exacta (AD-3).
 */
export function validarAdicion(e: EntradaAdicion): ResultadoAdicion {
  const todas = [...e.adicionesPrevias, e.nuevaAdicion];
  exigirPositivo(e.valorInicial.valor, 'El valor inicial');
  exigirPositivo(e.valorInicial.smmlv, 'El SMMLV inicial');
  for (const a of todas) {
    exigirPositivo(a.valor, 'El valor de la adición');
    exigirPositivo(a.smmlv, 'El SMMLV de la adición');
  }

  // Σ(vᵢ/sᵢ) ≤ ½·(V₀/S₀)  ⇔  2·S₀·N ≤ V₀·D, con D común denominador y N = Σ vᵢ·(D/sᵢ).
  const d = todas.reduce((acc, a) => mcm(acc, a.smmlv), 1n);
  const n = todas.reduce((acc, a) => acc + a.valor * (d / a.smmlv), 0n);
  const izquierda = 2n * e.valorInicial.smmlv * n;
  const derecha = e.valorInicial.valor * d;
  const porcentajeAcumulado = Number((n * e.valorInicial.smmlv * 10_000n) / (e.valorInicial.valor * d)) / 100;

  if (e.interventoriaProrrogadaConVigilado) {
    return {
      permitida: true,
      porcentajeAcumulado,
      mensaje: 'Interventoría prorrogada con el contrato vigilado: no aplica el límite del 50 %.',
      fundamentos: [{ norma: 'Ley 1474 de 2011', articulo: '85' }],
    };
  }

  const permitida = izquierda <= derecha;
  return {
    permitida,
    porcentajeAcumulado,
    mensaje: permitida
      ? `Adiciones acumuladas: ${porcentajeAcumulado} % del valor inicial en SMMLV (límite 50 %).`
      : `Las adiciones acumuladas llegarían al ${porcentajeAcumulado} % del valor inicial en SMMLV y superan el límite del 50 %.`,
    fundamentos: [PARAGRAFO_40],
  };
}

