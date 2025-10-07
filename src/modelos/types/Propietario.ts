import type { EntidadFinanciera } from "../enumeraciones/entidadFinanciera";
import type { TipoCuenta } from "../enumeraciones/tipoCuenta";
import type { DTOUsuarioRespuesta, Usuario } from "./Usuario";

export interface Propietario extends Usuario {
  cuentaBancaria: string;
  banco: EntidadFinanciera;
  tipoCuenta: TipoCuenta
}

export type DTOPropietarioRegistro = Omit<Propietario, "idUsuario">;
export type DTOPropietarioActualizar = Partial<Propietario>;
export interface DTOPropietarioRespuesta extends DTOUsuarioRespuesta {
  cuentaBancaria?: string;
  banco?: EntidadFinanciera;
  tipoCuenta?: TipoCuenta;
}