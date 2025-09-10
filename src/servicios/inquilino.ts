import { urlApi } from "../api";
import type { DTOInquilinoRegistro, DTOInquilinoRespuesta } from "../modelos/types/Inquilino";

const API_URL = "/api/v1/inquilino";

export class InquilinoService {
  static async registrar(data: DTOInquilinoRegistro): Promise<DTOInquilinoRespuesta> {
    const { data: inquilino } = await urlApi.post(`${API_URL}/registro`, data);
    return inquilino as DTOInquilinoRespuesta;
  }

  static async listar(): Promise<DTOInquilinoRespuesta[]> {
    const { data: inquilinos } = await urlApi.get(`${API_URL}/listar`);
    return inquilinos as DTOInquilinoRespuesta[];
  }

  static async actualizar(id: number, data: DTOInquilinoRegistro): Promise<DTOInquilinoRespuesta> {
    const { data: inquilino } = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return inquilino as DTOInquilinoRespuesta;
  }

  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  }
}