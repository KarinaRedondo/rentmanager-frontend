import type { TipoCuenta } from "../enumeraciones/tipoCuenta";
import type { DTOUsuarioRespuesta, Usuario } from "./Usuario";

export interface Propietario extends Usuario {
  cuentaBancaria: string;
  banco: string;
  tipoCuenta: TipoCuenta
}

export type DTOPropietarioRegistro = Omit<Propietario, "idUsuario">;
export type DTOPropietarioActualizar = Partial<Propietario>;
export interface DTOPropietarioRespuesta extends DTOUsuarioRespuesta {
  cuentaBancaria?: string;
}