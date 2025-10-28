export const TipoEntidad = {
  PROPIEDAD: "PROPIEDAD",
  CONTRATO: "CONTRATO",
  FACTURA: "FACTURA",
  PAGO: "PAGO",
  USUARIO: "USUARIO",
  MANTENIMIENTO: "MANTENIMIENTO",
} as const;

export type TipoEntidad = typeof TipoEntidad[keyof typeof TipoEntidad];

// Helper para obtener el nombre legible
export const obtenerNombreTipoEntidad = (tipo: TipoEntidad): string => {
  const nombres: Record<TipoEntidad, string> = {
    PROPIEDAD: "Propiedad",
    CONTRATO: "Contrato",
    FACTURA: "Factura",
    PAGO: "Pago",
    USUARIO: "Usuario",
    MANTENIMIENTO: "Mantenimiento",
  };
  return nombres[tipo];
};

// Helper para obtener el icono
export const obtenerIconoTipoEntidad = (tipo: TipoEntidad): string => {
  const iconos: Record<TipoEntidad, string> = {
    PROPIEDAD: "🏠",
    CONTRATO: "📄",
    FACTURA: "🧾",
    PAGO: "💰",
    USUARIO: "👤",
    MANTENIMIENTO: "🔧",
  };
  return iconos[tipo];
};
