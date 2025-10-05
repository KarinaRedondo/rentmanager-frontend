import type { EstadoUsuario } from "../enumeraciones/estadoUsuario";
import type { TipoDocumento } from "../enumeraciones/tipoDocumento";
import type { TipoUsuario } from "../enumeraciones/tipoUsuario";

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  tipoUsuario: TipoUsuario;
  telefono?: string;
  estado: EstadoUsuario;
  fechaRegistro: string; // viene como ISO string desde la API
}

export type DTOUsuarioRegistro = Omit<Usuario, "idUsuario">;
export type DTOUsuarioActualizar = Partial<Usuario>;
export interface DTOUsuarioRespuesta {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipoUsuario: TipoUsuario;
  documentoIdentidad: string;
  telefono?: string;
  estado: EstadoUsuario;
  fechaRegistro: string;
}