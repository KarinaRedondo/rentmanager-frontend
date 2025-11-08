import { urlApi } from "../app/api";
import { TipoUsuario } from "../modelos/enumeraciones/tipoUsuario";
import type { DTOAdministradorRegistro } from "../modelos/types/Administrador";
import type { DTOContadorRegistro } from "../modelos/types/Contador";
import type { DTOInquilinoRegistro } from "../modelos/types/Inquilino";
import type { DTOPropietarioRegistro } from "../modelos/types/Propietario";
import type { DTOUsuarioRegistro } from "../modelos/types/Usuario";

const API_URL = "/api/v1/";

// Mapear tipo de usuario a su endpoint base
const endpoints: Record<TipoUsuario, string> = {
  [TipoUsuario.ADMINISTRADOR]: "administrador",
  [TipoUsuario.CONTADOR]: "contador",
  [TipoUsuario.INQUILINO]: "inquilino",
  [TipoUsuario.PROPIETARIO]: "propietario",
};

export class UsuarioService {
  // ============================================
  // REGISTRAR USUARIO
  // ============================================
  static async registrar(
    data:
      | DTOUsuarioRegistro
      | DTOAdministradorRegistro
      | DTOContadorRegistro
      | DTOInquilinoRegistro
      | DTOPropietarioRegistro
  ): Promise<any> {
    let endpoint = "usuario";

    if ("cargo" in data || "nivelAcceso" in data) {
      endpoint = endpoints[TipoUsuario.ADMINISTRADOR];
    } else if ("numeroTarjetaProfesional" in data || "especialidad" in data) {
      endpoint = endpoints[TipoUsuario.CONTADOR];
    } else if (
      "telefonoAlternativo" in data ||
      "referenciaPersonal" in data ||
      "ocupacion" in data ||
      "ingresosMensuales" in data ||
      "estadoCivil" in data
    ) {
      endpoint = endpoints[TipoUsuario.INQUILINO];
    } else if (
      "cuentaBancaria" in data ||
      "banco" in data ||
      "tipoCuenta" in data
    ) {
      endpoint = endpoints[TipoUsuario.PROPIETARIO];
    }

    try {
      // Ahora genera: /api/v1/administrador/registro
      const { data: usuario } = await urlApi.post(
        `${API_URL}${endpoint}/registro`,
        data
      );
      return usuario;
    } catch (error: any) {
      throw new Error(error.response?.data || "Error al registrar usuario");
    }
  }

  // ============================================
  // LISTAR TODOS LOS USUARIOS
  // ============================================
  static async listarTodos(): Promise<any[]> {
    try {
      console.log("📡 Iniciando carga de usuarios de todos los tipos...");

      // Ahora genera: /api/v1/administrador/listar (correcto)
      const responses = await Promise.allSettled([
        urlApi.get(`${API_URL}administrador/listar`),
        urlApi.get(`${API_URL}contador/listar`),
        urlApi.get(`${API_URL}inquilino/listar`),
        urlApi.get(`${API_URL}propietario/listar`),
      ]);

      console.log("Respuestas recibidas:", responses);

      const usuarios: any[] = [];
      const tipos = ["ADMINISTRADOR", "CONTADOR", "INQUILINO", "PROPIETARIO"];

      responses.forEach((response, index) => {
        if (response.status === "fulfilled") {
          const data = response.value.data;
          console.log(`${tipos[index]}S cargados:`, data.length);

          // Normalizar estructura
          const usuariosNormalizados = data.map((usuario: any) => ({
            ...usuario,
            tipoUsuario: usuario.tipoUsuario || tipos[index],
            estado: usuario.estado || "ACTIVO",
          }));

          usuarios.push(...usuariosNormalizados);
        } else {
          console.warn(
            `No se pudieron cargar ${tipos[index]}S:`,
            response.reason?.response?.status,
            response.reason?.response?.data || response.reason?.message
          );
        }
      });

      console.log(`Total de usuarios cargados: ${usuarios.length}`);
      return usuarios;
    } catch (error: any) {
      console.error("Error crítico al listar usuarios:", error);
      throw new Error("Error al listar usuarios");
    }
  }

  // ============================================
  // LISTAR POR TIPO
  // ============================================
  static async listarPorTipo(tipo: TipoUsuario): Promise<any[]> {
    try {
      // Ahora genera: /api/v1/administrador/listar
      const { data } = await urlApi.get(`${API_URL}${endpoints[tipo]}/listar`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data || `Error al listar ${tipo}`);
    }
  }

  // ============================================
  // ACTUALIZAR USUARIO
  // ============================================
  static async actualizar(id: number, data: any): Promise<any> {
    let endpoint = "usuario";

    if ("cargo" in data || "nivelAcceso" in data) {
      endpoint = endpoints[TipoUsuario.ADMINISTRADOR];
    } else if ("numeroTarjetaProfesional" in data || "especialidad" in data) {
      endpoint = endpoints[TipoUsuario.CONTADOR];
    } else if (
      "telefonoAlternativo" in data ||
      "referenciaPersonal" in data ||
      "ocupacion" in data ||
      "ingresosMensuales" in data ||
      "estadoCivil" in data
    ) {
      endpoint = endpoints[TipoUsuario.INQUILINO];
    } else if (
      "cuentaBancaria" in data ||
      "banco" in data ||
      "tipoCuenta" in data
    ) {
      endpoint = endpoints[TipoUsuario.PROPIETARIO];
    }

    try {
      // Ahora genera: /api/v1/administrador/actualizar/1
      const { data: usuario } = await urlApi.put(
        `${API_URL}${endpoint}/actualizar/${id}`,
        data
      );
      return usuario;
    } catch (error: any) {
      throw new Error(error.response?.data || "Error al actualizar usuario");
    }
  }

  // ============================================
  // ELIMINAR USUARIO
  // ============================================
  static async eliminar(id: number, tipo?: TipoUsuario): Promise<void> {
    if (!id || id <= 0) {
      throw new Error("ID de usuario inválido");
    }

    const endpoint = tipo ? endpoints[tipo] : "usuario";

    try {
      // Ahora genera: /api/v1/administrador/eliminar/1
      await urlApi.delete(`${API_URL}${endpoint}/eliminar/${id}`);
      console.log("Usuario eliminado correctamente:", id);
    } catch (error: any) {
      throw new Error(error.response?.data || "Error al eliminar usuario");
    }
  }

  // ============================================
  // BUSCAR USUARIO POR ID
  // ============================================
  static async buscarPorId(id: number): Promise<any> {
    const endpointsList = ["usuario", ...Object.values(endpoints)];

    for (const endpoint of endpointsList) {
      try {
        // Ahora genera: /api/v1/administrador/1
        const { data } = await urlApi.get(`${API_URL}${endpoint}/${id}`);
        if (data) {
          return data;
        }
      } catch {
        continue;
      }
    }

    throw new Error("Usuario no encontrado");
  }
}
