/** Fecha civil sin hora ni zona, formato `YYYY-MM-DD` (AD-4). */
export type FechaCivil = `${number}-${number}-${number}`;

/** Valor en pesos colombianos, siempre entero (AD-3). */
export type Pesos = bigint;

/** Cita normativa que sustenta una decisión del motor (AD-5). */
export interface Fundamento {
  norma: string;
  articulo: string;
  /** `true` cuando la cita requiere validación jurídica adicional. */
  verificar?: boolean;
}

/** Versión del conjunto de reglas; cambia cuando cambia cualquier regla del motor. */
export const VERSION_REGLAS = '2026.10.0';

/** Entrada inválida para el motor (no se usa para resultados jurídicos negativos). */
export class ErrorNormativo extends Error {
  override readonly name = 'ErrorNormativo';
}
