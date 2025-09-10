import { urlApi } from "../api";
import type { DTOPropietarioRegistro, DTOPropietarioRespuesta } from "../modelos/types/Propietario";

const API_URL = "/api/v1/propietario";

export class PropietarioService {
  static async registrar(data: DTOPropietarioRegistro): Promise<DTOPropietarioRespuesta> {
    const { data: propietario } = await urlApi.post(`${API_URL}/registro`, data);
    return propietario as DTOPropietarioRespuesta;
  }

  static async listar(): Promise<DTOPropietarioRespuesta[]> {
    const { data: propietarios } = await urlApi.get(`${API_URL}/listar`);
    return propietarios as DTOPropietarioRespuesta[];
  }

  static async actualizar(id: number, data: DTOPropietarioRegistro): Promise<DTOPropietarioRespuesta> {
    const { data: propietario } = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return propietario as DTOPropietarioRespuesta;
  }

  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  }
}