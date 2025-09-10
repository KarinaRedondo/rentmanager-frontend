import type { DTOUsuarioRespuesta, Usuario } from "./Usuario";

export interface Inquilino extends Usuario {
  telefonoAlternativo?: string;
  referenciaPersonal?: string;
  ocupacion?: string;
  ingresosMensuales?: number; // BigDecimal → number en TS
}

export type DTOInquilinoRegistro = Omit<Inquilino, "idUsuario">;
export type DTOInquilinoActualizar = Partial<Inquilino>;
export interface DTOInquilinoRespuesta extends DTOUsuarioRespuesta {
  telefonoAlternativo?: string;
  referenciaPersonal?: string;
  ocupacion?: string;
  ingresosMensuales?: number; // BigDecimal en backend -> number en frontend
}