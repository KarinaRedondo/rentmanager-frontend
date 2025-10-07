import { urlApi } from "../app/api";
import type { Evento } from "../modelos/enumeraciones/evento";
import type {
  DTOPropiedadActualizar,
  DTOPropiedadRegistro,
  DTOPropiedadRespuesta
} from "../modelos/types/Propiedad";

export interface ResultadoValidacion {
  valido: boolean;
  motivo?: string;
  recomendaciones?: string[];
  alternativas?: string[];
}

const API_URL = "/api/v1/propiedades";

export const PropiedadService = {
  // Obtener todas las propiedades
  async obtenerPropiedades(): Promise<DTOPropiedadRespuesta[]> {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  },

  // Obtener propiedad por ID
  async obtenerPropiedadPorId(id: number): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.get(`${API_URL}/obtener/${id}`);
    return res.data;
  },

  // Crear propiedad
  async crearPropiedad(data: DTOPropiedadRegistro): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.post(`${API_URL}/crear`, data);
    return res.data;
  },

  // Actualizar propiedad
  async actualizarPropiedad(id: number, data: DTOPropiedadActualizar): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return res.data;
  },

  // Eliminar propiedad
  async eliminarPropiedad(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  },

  // Analizar transición
  async analizarTransicionPropiedad(id: number, evento: Evento): Promise<ResultadoValidacion> {
    try {
      const res = await urlApi.get(`${API_URL}/${id}/analizar-transicion/${evento}`);
      return res.data;
    } catch (error: any) {
      return {
        valido: false,
        motivo: error.response?.data?.message || "Error al analizar la transición"
      };
    }
  },

  // Ejecutar transición
  async ejecutarTransicionPropiedad(id: number, evento: Evento): Promise<any> {
    const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
    return res.data;
  },

  // Verificar transición válida
  async esTransicionValidaPropiedad(id: number, evento: Evento): Promise<boolean> {
    const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
    return res.data;
  },

  // Obtener recomendaciones
  async obtenerRecomendacionesPropiedad(id: number, evento: Evento): Promise<string[]> {
    const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
    return res.data;
  }
};
