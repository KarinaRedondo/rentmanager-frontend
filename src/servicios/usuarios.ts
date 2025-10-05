import { urlApi } from "../app/api"; 
import { TipoUsuario } from "../modelos/enumeraciones/tipoUsuario";
import type {
  DTOAdministradorRegistro,
  DTOAdministradorRespuesta,
} from "../modelos/types/Administrador";
import type {
  DTOContadorRegistro,
  DTOContadorRespuesta,
} from "../modelos/types/Contador";
import type {
  DTOInquilinoRegistro,
  DTOInquilinoRespuesta,
} from "../modelos/types/Inquilino";
import type {
  DTOPropietarioRegistro,
  DTOPropietarioRespuesta,
} from "../modelos/types/Propietario";
import type {
  DTOUsuarioRegistro,
  DTOUsuarioRespuesta,
} from "../modelos/types/Usuario";

const API_URL = "/api/v1";

// Mapear tipo de usuario a su endpoint base
const endpoints: Record<TipoUsuario, string> = {
  [TipoUsuario.ADMINISTRADOR]: "administrador",
  [TipoUsuario.CONTADOR]: "contador",
  [TipoUsuario.INQUILINO]: "inquilino",
  [TipoUsuario.PROPIETARIO]: "propietario",
};

export class UsuarioService {
  // -----------------------------------
  // Registrar usuario (genérico)
  // -----------------------------------
  static async registrar(
    data:
      | DTOUsuarioRegistro
      | DTOAdministradorRegistro
      | DTOContadorRegistro
      | DTOInquilinoRegistro
      | DTOPropietarioRegistro
  ): Promise<any> {
    let endpoint = "usuario";

    if ("cargo" in data || "nivelAcceso" in data) endpoint = endpoints[TipoUsuario.ADMINISTRADOR];
    else if ("numeroTarjetaProfesional" in data || "especialidad" in data)
      endpoint = endpoints[TipoUsuario.CONTADOR];
    else if ("telefonoAlternativo" in data || "referenciaPersonal" in data || "ocupacion" in data || "ingresosMensuales" in data || "estadoCivil" in data)
      endpoint = endpoints[TipoUsuario.INQUILINO];
    else if ("cuentaBancaria" in data || "banco" in data || "tipoCuenta" in data)
      endpoint = endpoints[TipoUsuario.PROPIETARIO];

    try {
      const { data: usuario } = await urlApi.post(
        `${API_URL}/${endpoint}/registro`,
        data
      );
      return usuario;
    } catch (error: any) {
      throw new Error(error.response?.data || "Error al registrar usuario");
    }
  }

  // -----------------------------------
  // Listar todos los usuarios (todos los tipos)
  // -----------------------------------
  static async listarTodos(): Promise<any[]> {
    try {
      const responses = await Promise.all(
        ["usuario", ...Object.values(endpoints)].map((e) =>
          urlApi.get(`${API_URL}/${e}/listar`)
        )
      );

      // Combinar resultados y eliminar duplicados por idUsuario
      const usuarios = responses.flatMap((res) => res.data);
      return Array.from(
        new Map(usuarios.map((u: any) => [u.idUsuario, u])).values()
      );
    } catch (error: any) {
      console.error("Error al listar usuarios:", error);
      throw new Error("Error al listar usuarios");
    }
  }

  // -----------------------------------
  // Listar por tipo
  // -----------------------------------
  static async listarPorTipo(tipo: TipoUsuario): Promise<any[]> {
    try {
      const { data } = await urlApi.get(`${API_URL}/${endpoints[tipo]}/listar`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data || `Error al listar ${tipo}`);
    }
  }

  // -----------------------------------
  // Actualizar usuario
  // -----------------------------------
  static async actualizar(id: number, data: any): Promise<any> {
    let endpoint = "usuario";

    if ("cargo" in data || "nivelAcceso" in data) endpoint = endpoints[TipoUsuario.ADMINISTRADOR];
    else if ("numeroTarjetaProfesional" in data || "especialidad" in data)
      endpoint = endpoints[TipoUsuario.CONTADOR];
    else if ("telefonoAlternativo" in data || "referenciaPersonal" in data || "ocupacion" in data || "ingresosMensuales" in data || "estadoCivil" in data)
      endpoint = endpoints[TipoUsuario.INQUILINO];
    else if ("cuentaBancaria" in data || "banco" in data || "tipoCuenta" in data)
      endpoint = endpoints[TipoUsuario.PROPIETARIO];

    try {
      const { data: usuario } = await urlApi.put(
        `${API_URL}/${endpoint}/actualizar/${id}`,
        data
      );
      return usuario;
    } catch (error: any) {
      throw new Error(error.response?.data || "Error al actualizar usuario");
    }
  }

  // -----------------------------------
  // Eliminar usuario (genérico)
  // -----------------------------------
  static async eliminar(id: number, tipo?: TipoUsuario): Promise<void> {
    if (!id || id <= 0) throw new Error("ID de usuario inválido");

    const endpoint = tipo ? endpoints[tipo] : "usuario";

    try {
      await urlApi.delete(`${API_URL}/${endpoint}/eliminar/${id}`);
      console.log(`Usuario eliminado correctamente: ${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data || "Error al eliminar usuario");
    }
  }

  // -----------------------------------
  // Buscar usuario por ID
  // -----------------------------------
  static async buscarPorId(id: number): Promise<any> {
    for (const endpoint of ["usuario", ...Object.values(endpoints)]) {
      try {
        const { data } = await urlApi.get(`${API_URL}/${endpoint}/${id}`);
        if (data) return data;
      } catch {
        continue;
      }
    }
    throw new Error("Usuario no encontrado");
  }
}
