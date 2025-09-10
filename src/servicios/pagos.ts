import { urlApi } from "../api";
import type { Evento } from "../modelos/enumeraciones/evento";
import type { DTOPagoActualizar, DTOPagoRegistro, DTOPagoRespuesta } from "../modelos/types/Pago";

const API_URL = "api/v1/pagos";

export class PagoService {
  // Obtener todos los pagos
  static async obtenerTodos(): Promise<DTOPagoRespuesta[]> {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  }

  // Obtener un pago por ID
  static async obtenerPorId(id: number): Promise<DTOPagoRespuesta> {
    const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
    return res.data;
  }

  // Crear pago
  static async crear(data: DTOPagoRegistro): Promise<DTOPagoRespuesta> {
    const res = await urlApi.post(`${API_URL}/crear`, data);
    return res.data;
  }

  // Actualizar pago
  static async actualizar(
    id: number,
    data: DTOPagoActualizar
  ): Promise<DTOPagoRespuesta> {
    const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return res.data;
  }

  // Eliminar pago
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