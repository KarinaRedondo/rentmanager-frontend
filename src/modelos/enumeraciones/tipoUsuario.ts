export const TipoUsuario = {
  ADMINISTRADOR: "ADMINISTRADOR",
  PROPIETARIO: "PROPIETARIO",
  INQUILINO: "INQUILINO",
  CONTADOR: "CONTADOR",
} as const;
export type TipoUsuario = typeof TipoUsuario[keyof typeof TipoUsuario];