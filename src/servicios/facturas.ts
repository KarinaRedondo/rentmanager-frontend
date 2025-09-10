import { urlApi } from "../api";
import type { Evento } from "../modelos/enumeraciones/evento";
import type { DTOFacturaActualizar, DTOFacturaRegistro, DTOFacturaRespuesta } from "../modelos/types/Factura";

const API_URL = "api/v1/facturas";

export class FacturaService {
  // Obtener todas las facturas
  static async obtenerTodas(): Promise<DTOFacturaRespuesta[]> {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  }

  // Obtener una factura por ID
  static async obtenerPorId(id: number): Promise<DTOFacturaRespuesta> {
    const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
    return res.data;
  }

  // Crear factura
  static async crear(
    data: DTOFacturaRegistro
  ): Promise<DTOFacturaRespuesta> {
    const res = await urlApi.post(`${API_URL}/crear`, data);
    return res.data;
  }

  // Actualizar factura
  static async actualizar(
    id: number,
    data: DTOFacturaActualizar
  ): Promise<DTOFacturaRespuesta> {
    const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return res.data;
  }

  // Eliminar factura
  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  }

  // Analizar transición de estado
  static async analizarTransicion(id: number, evento: Evento): Promise<any> {
    const res = await urlApi.get(`${API_URL}/${id}/analizar-transicion/${evento}`);
    return res.data;
  }

  // Ejecutar transición de estado
  static async ejecutarTransicion(id: number, evento: Evento): Promise<any> {
    const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
    return res.data;
  }
}