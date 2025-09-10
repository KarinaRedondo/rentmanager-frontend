export const EstadoMantenimiento = {
  SOLICITADO: "SOLICITADO",
  PROGRAMADO: "PROGRAMADO",
  EN_PROCESO: "EN_PROCESO",
  SUSPENDIDO: "SUSPENDIDO",
  COMPLETADO: "COMPLETADO",
  VERIFICADO: "VERIFICADO",
  POR_CORREGIR: "POR_CORREGIR",
  CANCELADO: "CANCELADO",
  RECHAZADO: "RECHAZADO",
} as const;
export type EstadoMantenimiento = typeof EstadoMantenimiento[keyof typeof EstadoMantenimiento];