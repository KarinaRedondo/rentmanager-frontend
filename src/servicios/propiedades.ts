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

export interface ResultadoEjecucion {
  exito: boolean;
  mensaje: string;
  estadoActual: string;
}

const API_URL = "/api/v1/propiedades";

export const PropiedadService = {
  // =========================
  // CRUD
  // =========================

  async obtenerPropiedades(): Promise<DTOPropiedadRespuesta[]> {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  },

  async obtenerPropiedadPorId(id: number): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.get(`${API_URL}/obtener/${id}`);
    return res.data;
  },

  async crearPropiedad(data: DTOPropiedadRegistro): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.post(`${API_URL}/crear`, data);
    return res.data;
  },

  async actualizarPropiedad(id: number, data: DTOPropiedadActualizar): Promise<DTOPropiedadRespuesta> {
    const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return res.data;
  },

  async eliminarPropiedad(id: number): Promise<void> {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  },

  // =========================
  // TRANSICIONES DE ESTADO
  // =========================

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

  async ejecutarTransicionPropiedad(id: number, evento: Evento): Promise<ResultadoEjecucion> {
    const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
    return res.data;
  },

  async esTransicionValidaPropiedad(id: number, evento: Evento): Promise<boolean> {
    const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
    return res.data;
  },

  async obtenerRecomendacionesPropiedad(id: number, evento: Evento): Promise<string[]> {
    const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
    return res.data;
  },

  // =========================
  // MÉTODO COMPUESTO
  // =========================
  /**
   * Valida con el backend si una transición de propiedad es válida.
   * Si pasa la validación, la ejecuta y devuelve el resultado.
   */
  async validarYEjecutarTransicionPropiedad(id: number, evento: Evento): Promise<ResultadoEjecucion> {
    try {
      // Analizar primero la transición
      const validacion = await this.analizarTransicionPropiedad(id, evento);

      if (!validacion.valido) {
        console.warn("Transición de propiedad inválida:", validacion.motivo);
        throw new Error(validacion.motivo || "Transición no válida");
      }

      // Si es válida, ejecutar la transición
      const resultado = await this.ejecutarTransicionPropiedad(id, evento);
      console.info("Transición ejecutada:", resultado.mensaje);
      return resultado;
    } catch (error: any) {
      console.error("Error en la transición de propiedad:", error.message);
      throw error;
    }
  }
};

