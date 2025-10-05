import { urlApi } from "../app/api"; 
import type { Evento } from "../modelos/enumeraciones/evento";
import type { DTOPropiedadActualizar, DTOPropiedadRegistro, DTOPropiedadRespuesta } from "../modelos/types/Propiedad";

const API_URL = "/api/v1/propiedades";

export interface ResultadoValidacion {
  valido: boolean;
  motivo?: string;
  recomendaciones?: string[];
  alternativas?: string[];
}

// Obtener todas las propiedades
export const obtenerPropiedades = async (): Promise<DTOPropiedadRespuesta[]> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

// Obtener propiedad por ID
export const obtenerPropiedadPorId = async (id: number): Promise<DTOPropiedadRespuesta> => {
  const res = await urlApi.get(`${API_URL}/obtener/${id}`);
  return res.data;
};

// Crear propiedad
export const crearPropiedad = async (data: DTOPropiedadRegistro): Promise<DTOPropiedadRespuesta> => {
  const res = await urlApi.post(`${API_URL}/crear`, data);
  return res.data;
};

// Actualizar propiedad
export const actualizarPropiedad = async (id: number, data: DTOPropiedadActualizar): Promise<DTOPropiedadRespuesta> => {
  const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
  return res.data;
};

// Eliminar propiedad
export const eliminarPropiedad = async (id: number): Promise<void> => {
  await urlApi.delete(`${API_URL}/eliminar/${id}`);
};

// Analizar transición de propiedad
export const analizarTransicionPropiedad = async (id: number, evento: Evento): Promise<ResultadoValidacion> => {
  try {
    const res = await urlApi.get(`${API_URL}/${id}/analizar-transicion/${evento}`);
    return res.data;
  } catch (error: any) {
    return {
      valido: false,
      motivo: error.response?.data?.message || 'Error al analizar la transición'
    };
  }
};

// Ejecutar transición de propiedad
export const ejecutarTransicionPropiedad = async (id: number, evento: Evento): Promise<any> => {
  const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
  return res.data;
};

// Verificar si la transición es válida
export const esTransicionValidaPropiedad = async (id: number, evento: Evento): Promise<boolean> => {
  const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
  return res.data;
};

// Obtener recomendaciones de transición
export const obtenerRecomendacionesPropiedad = async (id: number, evento: Evento): Promise<string[]> => {
  const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
  return res.data;
};
