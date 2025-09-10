import { urlApi } from "../api";
import type { DTOContadorRegistro, DTOContadorRespuesta } from "../modelos/types/Contador";

const API_URL = "/api/v1/contador";

export class ContadorService {
  static async registrar(data: DTOContadorRegistro): Promise<DTOContadorRespuesta> {
    const { data: contador } = await urlApi.post(`${API_URL}/registro`, data);
    return contador as DTOContadorRespuesta;
  }

  static async listar(): Promise<DTOContadorRespuesta[]> {
    const { data: contadores } = await urlApi.get(`${API_URL}/listar`);
    return contadores as DTOContadorRespuesta[];
  }

  static async actualizar(id: number, data: DTOContadorRegistro): Promise<DTOContadorRespuesta> {
    const { data: contador } = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return contador as DTOContadorRespuesta;
  }

  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  }
}