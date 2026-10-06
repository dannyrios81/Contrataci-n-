import { ErrorNormativo, type Pesos } from './tipos.js';

export function exigirPositivo(valor: Pesos, nombre: string): void {
  if (valor <= 0n) throw new ErrorNormativo(`${nombre} debe ser mayor que cero`);
}

export function exigirNoNegativo(valor: Pesos, nombre: string): void {
  if (valor < 0n) throw new ErrorNormativo(`${nombre} no puede ser negativo`);
}

/** Producto por porcentaje redondeado hacia arriba (para mínimos exigidos). */
export function porcentajeTecho(valor: Pesos, porcentaje: bigint): Pesos {
  const producto = valor * porcentaje;
  return producto % 100n === 0n ? producto / 100n : producto / 100n + 1n;
}
