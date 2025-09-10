import type { DTOUsuarioRespuesta, Usuario } from "./Usuario";

export interface Contador extends Usuario {
  numeroTarjetaProfesional: string;
  especialidad?: string;
}

export type DTOContadorRegistro = Omit<Contador, "idUsuario">;
export type DTOContadorActualizar = Partial<Contador>;
export interface DTOContadorRespuesta extends DTOUsuarioRespuesta {
  numeroTarjetaProfesional?: string;
  especialidad?: string;
}