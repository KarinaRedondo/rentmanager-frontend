export const EstadoContrato = {
  CREADO: "CREADO",
  ACTIVO: "ACTIVO",
  SUSPENDIDO: "SUSPENDIDO",
  TERMINADO: "TERMINADO",
  RENOVADO: "RENOVADO",
  RECHAZADO: "RECHAZADO",
} as const;

export type EstadoContrato = typeof EstadoContrato[keyof typeof EstadoContrato];
