import { urlApi } from "../app/api"; 
import type { Evento } from "../modelos/enumeraciones/evento";
import type { DTOFacturaActualizar, DTOFacturaRegistro, DTOFacturaRespuesta } from "../modelos/types/Factura";

const API_URL = "/api/v1/facturas";

export interface ResultadoValidacion {
  valido: boolean;
  motivo?: string;
  recomendaciones?: string[];
  alternativas?: string[];
}

// Obtener todas las facturas
export const obtenerFacturas = async (): Promise<DTOFacturaRespuesta[]> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

// Obtener factura por ID
export const obtenerFacturaPorId = async (id: number): Promise<DTOFacturaRespuesta> => {
  const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
  return res.data;
};

// Crear factura
export const crearFactura = async (data: DTOFacturaRegistro): Promise<DTOFacturaRespuesta> => {
  const res = await urlApi.post(`${API_URL}/crear`, data);
  return res.data;
};

// Actualizar factura
export const actualizarFactura = async (id: number, data: DTOFacturaActualizar): Promise<DTOFacturaRespuesta> => {
  const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
  return res.data;
};

// Eliminar factura
export const eliminarFactura = async (id: number): Promise<void> => {
  await urlApi.delete(`${API_URL}/eliminar/${id}`);
};

// Analizar transición de factura
export const analizarTransicionFactura = async (id: number, evento: Evento): Promise<ResultadoValidacion> => {
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

// Ejecutar transición de factura
export const ejecutarTransicionFactura = async (id: number, evento: Evento): Promise<any> => {
  const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
  return res.data;
};

// Verificar si la transición es válida
export const esTransicionValidaFactura = async (id: number, evento: Evento): Promise<boolean> => {
  const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
  return res.data;
};

// Obtener recomendaciones de transición
export const obtenerRecomendacionesFactura = async (id: number, evento: Evento): Promise<string[]> => {
  const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
  return res.data;
};
  // Obtener todas las facturas del propietario
  export const  obtenerFacturasPropietario= async (): Promise<DTOFacturaRespuesta []> => {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  }
