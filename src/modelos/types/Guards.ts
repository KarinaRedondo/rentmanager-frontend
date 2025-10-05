import { TipoUsuario } from "../enumeraciones/tipoUsuario";
import type { DTOAdministradorRespuesta } from "./Administrador";
import type { DTOContadorRespuesta } from "./Contador";
import type { DTOInquilinoRespuesta } from "./Inquilino";
import type { DTOPropietarioRespuesta } from "./Propietario";
import type { DTOUsuarioRespuesta } from "./Usuario";

export function esAdministrador(usuario: any): usuario is DTOAdministradorRespuesta {
  return usuario.tipoUsuario === TipoUsuario.ADMINISTRADOR;
}

export function esContador(usuario: any): usuario is DTOContadorRespuesta {
  return usuario.tipoUsuario === TipoUsuario.CONTADOR;
}

export function esInquilino(usuario: any): usuario is DTOInquilinoRespuesta {
  return usuario.tipoUsuario === TipoUsuario.INQUILINO;
}

export function esPropietario(usuario: any): usuario is DTOPropietarioRespuesta {
  return usuario.tipoUsuario === TipoUsuario.PROPIETARIO;
}

export function esUsuarioBase(usuario: any): usuario is DTOUsuarioRespuesta {
  return !esAdministrador(usuario) && 
         !esContador(usuario) && 
         !esInquilino(usuario) && 
         !esPropietario(usuario);
}