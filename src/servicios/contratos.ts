import { urlApi } from "../app/api"; 
import { Evento } from "../modelos/enumeraciones/evento"; 
import type { DTOContratoActualizar, DTOContratoRegistro, DTOContratoRespuesta } from "../modelos/types/Contrato";

const API_URL = "/api/v1/contratos";

export interface ResultadoValidacion {
  valido: boolean;
  motivo?: string;
  recomendaciones?: string[];
  alternativas?: string[];
}

export const obtenerContratos = async (): Promise<DTOContratoRespuesta[]> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

export const obtenerContratoPorId = async (id: number): Promise<DTOContratoRespuesta> => {
  const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
  return res.data;
};

export const crearContrato = async (data: DTOContratoRegistro): Promise<DTOContratoRespuesta> => {
  const res = await urlApi.post(`${API_URL}/crear`, data);
  return res.data;
};

export const actualizarContrato = async (id: number, data: DTOContratoActualizar): Promise<DTOContratoRespuesta> => {
  const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
  return res.data;
};

export const eliminarContrato = async (id: number): Promise<void> => {
  await urlApi.delete(`${API_URL}/eliminar/${id}`);
};

export const analizarTransicionContrato = async (id: number, evento: Evento): Promise<ResultadoValidacion> => {
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

export const ejecutarTransicionContrato = async (id: number, evento: Evento): Promise<any> => {
  const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
  return res.data;
};

export const esTransicionValida = async (id: number, evento: Evento): Promise<boolean> => {
  const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
  return res.data;
};

export const obtenerRecomendaciones = async (id: number, evento: Evento): Promise<string[]> => {
  const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
  return res.data;
};