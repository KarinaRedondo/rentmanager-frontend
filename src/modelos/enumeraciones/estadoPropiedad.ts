export const EstadoPropiedad = {
  DISPONIBLE: "DISPONIBLE",
  ARRENDADA: "ARRENDADA",
  EN_MANTENIMIENTO: "EN_MANTENIMIENTO",
  RESERVADA: "RESERVADA",
  EN_VERIFICACION: "EN_VERIFICACION",
} as const;
export type EstadoPropiedad = typeof EstadoPropiedad[keyof typeof EstadoPropiedad];