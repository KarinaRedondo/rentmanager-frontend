import { urlApi } from "../app/api"; 
import type { Evento } from "../modelos/enumeraciones/evento";
import type { DTOPagoActualizar, DTOPagoRegistro, DTOPagoRespuesta } from "../modelos/types/Pago";

const API_URL = "/api/v1/pagos";

export interface ResultadoValidacion {
  valido: boolean;
  motivo?: string;
  recomendaciones?: string[];
  alternativas?: string[];
}

// Obtener todos los pagos
export const obtenerPagos = async (): Promise<DTOPagoRespuesta[]> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

// Obtener pago por ID
export const obtenerPagoPorId = async (id: number): Promise<DTOPagoRespuesta> => {
  const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
  return res.data;
};

// Crear pago
export const crearPago = async (data: DTOPagoRegistro): Promise<DTOPagoRespuesta> => {
  const res = await urlApi.post(`${API_URL}/crear`, data);
  return res.data;
};

// Actualizar pago
export const actualizarPago = async (id: number, data: DTOPagoActualizar): Promise<DTOPagoRespuesta> => {
  const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
  return res.data;
};

// Eliminar pago
export const eliminarPago = async (id: number): Promise<void> => {
  await urlApi.delete(`${API_URL}/eliminar/${id}`);
};

// Analizar transición de pago
export const analizarTransicionPago = async (id: number, evento: Evento): Promise<ResultadoValidacion> => {
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

// Ejecutar transición de pago
export const ejecutarTransicionPago = async (id: number, evento: Evento): Promise<any> => {
  const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
  return res.data;
};

// Verificar si la transición es válida
export const esTransicionValidaPago = async (id: number, evento: Evento): Promise<boolean> => {
  const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
  return res.data;
};

// Obtener recomendaciones de transición
export const obtenerRecomendacionesPago = async (id: number, evento: Evento): Promise<string[]> => {
  const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
  return res.data;
};
