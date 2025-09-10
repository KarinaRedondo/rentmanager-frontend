export const EstadoFactura = {
  GENERADA: "GENERADA",
  PENDIENTE: "PENDIENTE",
  PAGADA: "PAGADA",
  VENCIDA: "VENCIDA",
  EN_DISPUTA: "EN_DISPUTA",
  AJUSTADA: "AJUSTADA",
  RECHAZADA: "RECHAZADA",
  EN_COBRANZA: "EN_COBRANZA",
  INCOBRABLE: "INCOBRABLE",
} as const;
export type EstadoFactura = typeof EstadoFactura[keyof typeof EstadoFactura];
