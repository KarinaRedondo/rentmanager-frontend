export const TipoEntidad = {
  PROPIEDAD: "PROPIEDAD",
  CONTRATO: "CONTRATO",
  FACTURA: "FACTURA",
  PAGO: "PAGO",
} as const;

export type TipoEntidad = typeof TipoEntidad[keyof typeof TipoEntidad];
