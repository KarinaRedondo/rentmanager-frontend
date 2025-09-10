export const EstadoPago = {
  PENDIENTE: "PENDIENTE",
  PROCESANDO: "PROCESANDO",
  COMPLETADO: "COMPLETADO",
  FALLIDO: "FALLIDO",
  REVERSADO: "REVERSADO",
  CANCELADO: "CANCELADO",
} as const;
export type EstadoPago = typeof EstadoPago[keyof typeof EstadoPago];