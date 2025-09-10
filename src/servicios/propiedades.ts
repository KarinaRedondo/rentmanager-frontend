import { urlApi } from "../api";
import type { Evento } from "../modelos/enumeraciones/evento";
import type { DTOPropiedadActualizar, DTOPropiedadRegistro, DTOPropiedadRespuesta } from "../modelos/types/Propiedad";

const API_URL = "api/v1/propiedades";

export class PropiedadService {
  // Obtener todas
  static async obtenerTodas(): Promise<DTOPropiedadRespuesta[]> {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  }

  // Obtener por id
  static async obtenerPorId(id: number): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.get(`${API_URL}/obtener/${id}`);
    return res.data;
  }

  // Crear propiedad
  static async crear(
    data: DTOPropiedadRegistro
  ): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.post(`${API_URL}/crear`, data);
    return res.data;
  }

  // Actualizar propiedad
  static async actualizar(
    id: number,
    data: DTOPropiedadActualizar
  ): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return res.data;
  }

  // Eliminar propiedad
  static async eliminar(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  }

  // Analizar transición
  static async analizarTransicion(id: number, evento: Evento): Promise<any> {
    const res = await urlApi.get(`${API_URL}/${id}/analizar-transicion/${evento}`);
    return res.data;
  }

  // Ejecutar transición
  static async ejecutarTransicion(id: number, evento: Evento): Promise<any> {
    const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
    return res.data;
  }

  // Validar transición
  static async esTransicionValida(
    id: number,
    evento: Evento
  ): Promise<boolean> {
    const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
    return res.data;
  }

  // Obtener recomendaciones
  static async obtenerRecomendaciones(
    id: number,
    evento: Evento
  ): Promise<any> {
    const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
    return res.data;
  }
}