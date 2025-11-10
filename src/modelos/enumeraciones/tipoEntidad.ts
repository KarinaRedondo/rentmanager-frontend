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

// Helper para obtener el icono NATIVO de SweetAlert2
export const obtenerIconoTipoEntidad = (tipo: TipoEntidad): "success" | "error" | "warning" | "info" | "question" => {
  const iconos: Record<TipoEntidad, "success" | "error" | "warning" | "info" | "question"> = {
    PROPIEDAD: "info",        // Ícono azul de información
    CONTRATO: "info",         // Ícono azul de información
    FACTURA: "warning",       // Ícono amarillo de advertencia
    PAGO: "success",          // Ícono verde de éxito
    USUARIO: "question",      // Ícono gris de pregunta
    MANTENIMIENTO: "error",   // Ícono rojo de error
  };
  return iconos[tipo];
};

