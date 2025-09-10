export const EstadoUsuario = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
  SUSPENDIDO: "SUSPENDIDO",
  ELIMINADO: "ELIMINADO",
} as const;
export type EstadoUsuario = typeof EstadoUsuario[keyof typeof EstadoUsuario];