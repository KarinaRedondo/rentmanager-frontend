import type { TipoEntidad } from "../enumeraciones/tipoEntidad"; 

export interface HistorialCambioEstado {
  idHistorial: number;
  tipoEntidad: TipoEntidad | string;
  idEntidad: number;
  estadoAnterior?: string;
  estadoNuevo: string;
  fechaCambio: string; // LocalDateTime -> string (ISO)
  observacion?: string;
  idUsuarioResponsable?: number;
  nombreUsuarioResponsable?: string;
}

export type DTOHistorialCambioEstadoRegistro = Omit<HistorialCambioEstado, "idHistorial">;
export interface DTOHistorialCambioEstadoRespuesta extends DTOHistorialCambioEstadoRegistro {
  idHistorial: number;
}
