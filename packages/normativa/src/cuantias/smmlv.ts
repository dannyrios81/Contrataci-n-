import type { Pesos } from '../base/tipos.js';

export interface SmmlvVigencia {
  anio: number;
  valor: Pesos;
  decreto: string;
  /** `true` si el valor no ha sido validado contra el decreto publicado. */
  verificar?: boolean;
}

/**
 * Tabla de referencia de SMMLV. Solo para precarga y pruebas: la API usa la tabla
 * persistida y administrada por la entidad (AD-2).
 */
export const SMMLV_REFERENCIA: readonly SmmlvVigencia[] = Object.freeze([
  { anio: 2020, valor: 877_803n, decreto: 'Decreto 2360 de 2019' },
  { anio: 2021, valor: 908_526n, decreto: 'Decreto 1785 de 2020' },
  { anio: 2022, valor: 1_000_000n, decreto: 'Decreto 1724 de 2021' },
  { anio: 2023, valor: 1_160_000n, decreto: 'Decreto 2613 de 2022' },
  { anio: 2024, valor: 1_300_000n, decreto: 'Decreto 2292 de 2023' },
  { anio: 2025, valor: 1_423_500n, decreto: 'Decreto 1572 de 2024' },
  { anio: 2026, valor: 1_750_905n, decreto: 'Decreto de diciembre de 2025', verificar: true },
]);

export function smmlvDeReferencia(anio: number): SmmlvVigencia | undefined {
  return SMMLV_REFERENCIA.find((s) => s.anio === anio);
}
