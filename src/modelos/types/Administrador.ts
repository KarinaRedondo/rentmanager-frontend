import type { NivelAcceso } from "../enumeraciones/nivelAcceso";
import type { DTOUsuarioRespuesta, Usuario } from "./Usuario";

export interface Administrador extends Usuario {
  cargo?: string; // opcional porque puede no venir siempre
  nivelAcceso: NivelAcceso;
}

export type DTOAdministradorRegistro = Omit<Administrador, "idUsuario">;
export type DTOAdministradorActualizar = Partial<Administrador>;
export interface DTOAdministradorRespuesta extends DTOUsuarioRespuesta {
  cargo?: string;
  nivelAcceso: NivelAcceso;
}
