import { urlApi } from "../api";
import type { DTOUsuarioRegistro, DTOUsuarioRespuesta } from "../modelos/types/Usuario";

const API_URL = "/api/v1/usuario";

export class UsuarioService {
  static async registrar(data: DTOUsuarioRegistro): Promise<DTOUsuarioRespuesta> {
    const { data: usuario } = await urlApi.post(`${API_URL}/registro`, data);
    return usuario as DTOUsuarioRespuesta;
  }

  static async listar(): Promise<DTOUsuarioRespuesta[]> {
    const { data: usuarios } = await urlApi.get(`${API_URL}/listar`);
    return usuarios as DTOUsuarioRespuesta[];
  }

  static async actualizar(id: number, data: DTOUsuarioRegistro): Promise<DTOUsuarioRespuesta> {
    const { data: usuario } = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return usuario as DTOUsuarioRespuesta;
  }

  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  }
}