import type { DTOUsuarioRespuesta, Usuario } from "./Usuario";

export interface Propietario extends Usuario {
  cuentaBancaria: string;
}

export type DTOPropietarioRegistro = Omit<Propietario, "idUsuario">;
export type DTOPropietarioActualizar = Partial<Propietario>;
export interface DTOPropietarioRespuesta extends DTOUsuarioRespuesta {
  cuentaBancaria?: string;
}