import { urlApi } from "../api";
import type { DTOServicioExtraActualizar, DTOServicioExtraRegistro, DTOServicioExtraRespuesta } from "../modelos/types/ServicioExtra";

const API_URL = "api/v1/servicios-extra";

export class ServicioExtraService {
  // Obtener todos los servicios extra
  static async obtenerTodos(): Promise<DTOServicioExtraRespuesta[]> {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  }

  // Obtener un servicio extra por ID
  static async obtenerPorId(id: number): Promise<DTOServicioExtraRespuesta> {
    const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
    return res.data;
  }

  // Crear servicio extra
  static async crear(
    data: DTOServicioExtraRegistro
  ): Promise<DTOServicioExtraRespuesta> {
    const res = await urlApi.post(`${API_URL}/crear`, data);
    return res.data;
  }

  // Actualizar servicio extra
  static async actualizar(
    id: number,
    data: DTOServicioExtraActualizar
  ): Promise<DTOServicioExtraRespuesta> {
    const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return res.data;
  }

  // Eliminar servicio extra
  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/delete/${id}`);
  }
}