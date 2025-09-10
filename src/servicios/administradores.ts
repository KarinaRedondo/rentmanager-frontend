import { urlApi } from "../api";
import type { DTOAdministradorRegistro, DTOAdministradorRespuesta } from "../modelos/types/Administrador";

const API_URL = "/api/v1/administrador";

export class AdministradorService {
  static async registrar(data: DTOAdministradorRegistro): Promise<DTOAdministradorRespuesta> {
    const { data: administrador } = await urlApi.post(`${API_URL}/registro`, data);
    return administrador as DTOAdministradorRespuesta;
  }

  static async listar(): Promise<DTOAdministradorRespuesta[]> {
    const { data: administradores } = await urlApi.get(`${API_URL}/listar`);
    return administradores as DTOAdministradorRespuesta[];
  }

  static async actualizar(id: number, data: DTOAdministradorRegistro): Promise<DTOAdministradorRespuesta> {
    const { data: administrador } = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return administrador as DTOAdministradorRespuesta;
  }

  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  }
}