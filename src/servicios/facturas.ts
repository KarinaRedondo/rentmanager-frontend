import { urlApi } from "../app/api";
import type { Evento } from "../modelos/enumeraciones/evento";
import type {
  DTOFacturaActualizar,
  DTOFacturaRegistro,
  DTOFacturaRespuesta,
} from "../modelos/types/Factura";

const API_URL = "/api/v1/facturas";

// ============================
// INTERFACES DE RESPUESTA
// ============================

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

// ============================
// CRUD
// ============================

/**
 * Obtiene todas las facturas (según rol del usuario autenticado).
 */
export const obtenerFacturas = async (): Promise<DTOFacturaRespuesta[]> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

/**
 * Obtiene una factura específica por su ID.
 */
export const obtenerFacturaPorId = async (
  id: number
): Promise<DTOFacturaRespuesta> => {
  const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
  return res.data;
};

/**
 * Crea una nueva factura.
 */
export const crearFactura = async (
  data: DTOFacturaRegistro
): Promise<DTOFacturaRespuesta> => {
  const res = await urlApi.post(`${API_URL}/crear`, data);
  return res.data;
};

/**
 * Actualiza una factura existente.
 */
export const actualizarFactura = async (
  id: number,
  data: DTOFacturaActualizar
): Promise<DTOFacturaRespuesta> => {
  const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
  return res.data;
};

/**
 * Elimina una factura por ID.
 */
export const eliminarFactura = async (id: number): Promise<void> => {
  await urlApi.delete(`${API_URL}/eliminar/${id}`);
};

// ============================
// TRANSICIONES DE ESTADO
// ============================

/**
 * Analiza si una transición de factura es válida antes de ejecutarla.
 */
export const analizarTransicionFactura = async (
  id: number,
  evento: Evento
): Promise<ResultadoValidacion> => {
  try {
    const res = await urlApi.get(`${API_URL}/${id}/analizar-transicion/${evento}`);
    return res.data;
  } catch (error: any) {
    return {
      valido: false,
      motivo: error.response?.data?.message || "Error al analizar la transición",
    };
  }
};

/**
 * Ejecuta una transición de estado (sin validación previa).
 */
export const ejecutarTransicionFactura = async (
  id: number,
  evento: Evento
): Promise<ResultadoEjecucion> => {
  const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
  return res.data;
};

/**
 * Verifica si una transición específica es válida (boolean simple).
 */
export const esTransicionValidaFactura = async (
  id: number,
  evento: Evento
): Promise<boolean> => {
  const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
  return res.data;
};

/**
 * Obtiene recomendaciones del backend asociadas a la transición.
 */
export const obtenerRecomendacionesFactura = async (
  id: number,
  evento: Evento
): Promise<string[]> => {
  const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
  return res.data;
};

// ============================
// MÉTODOS COMPUESTOS
// ============================

/**
 * Valida con el backend si una transición de factura es válida.
 * Si pasa la validación, ejecuta la transición y devuelve el resultado.
 */
export const validarYEjecutarTransicionFactura = async (
  id: number,
  evento: Evento
): Promise<ResultadoEjecucion> => {
  try {
    // Validar primero
    const validacion = await analizarTransicionFactura(id, evento);

    if (!validacion.valido) {
      console.warn("Transición inválida:", validacion.motivo);
      throw new Error(validacion.motivo || "Transición no válida");
    }

    //  Ejecutar si es válida
    const resultado = await ejecutarTransicionFactura(id, evento);
    console.info("Transición ejecutada:", resultado.mensaje);
    return resultado;
  } catch (error: any) {
    console.error("Error en transición de factura:", error.message);
    throw error;
  }
};

// ============================
// MÉTODOS ESPECÍFICOS POR ROL
// ============================

/**
 * Obtiene todas las facturas del propietario autenticado.
 */
export const obtenerFacturasPropietario = async (): Promise<
  DTOFacturaRespuesta[]
> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

/**
 * Obtiene todas las facturas del inquilino autenticado.
 */
export const obtenerFacturasInquilino = async (): Promise<
  DTOFacturaRespuesta[]
> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};
