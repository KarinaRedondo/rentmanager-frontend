import { urlApi } from "../app/api";
import type { Evento } from "../modelos/enumeraciones/evento";
import type {
  DTOPagoActualizar,
  DTOPagoRegistro,
  DTOPagoRespuesta,
} from "../modelos/types/Pago";

const API_URL = "/api/v1/pagos";

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
 * Obtiene todos los pagos.
 */
export const obtenerPagos = async (): Promise<DTOPagoRespuesta[]> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

/**
 * Obtiene un pago específico por su ID.
 */
export const obtenerPagoPorId = async (
  id: number
): Promise<DTOPagoRespuesta> => {
  const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
  return res.data;
};

/**
 * Crea un nuevo pago.
 */
export const crearPago = async (
  data: DTOPagoRegistro
): Promise<DTOPagoRespuesta> => {
  const res = await urlApi.post(`${API_URL}/crear`, data);
  return res.data;
};

/**
 * Actualiza un pago existente.
 */
export const actualizarPago = async (
  id: number,
  data: DTOPagoActualizar
): Promise<DTOPagoRespuesta> => {
  const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
  return res.data;
};

/**
 * Elimina un pago por ID.
 */
export const eliminarPago = async (id: number): Promise<void> => {
  await urlApi.delete(`${API_URL}/eliminar/${id}`);
};

// ============================
// TRANSICIONES DE ESTADO
// ============================

/**
 * Analiza si una transición de pago es válida antes de ejecutarla.
 */
export const analizarTransicionPago = async (
  id: number,
  evento: Evento
): Promise<ResultadoValidacion> => {
  try {
    const res = await urlApi.get(
      `${API_URL}/${id}/analizar-transicion/${evento}`
    );
    return res.data;
  } catch (error: any) {
    return {
      valido: false,
      motivo:
        error.response?.data?.message || "Error al analizar la transición",
    };
  }
};

/**
 * Ejecuta una transición de estado de pago.
 */
export const ejecutarTransicionPago = async (
  id: number,
  evento: Evento
): Promise<ResultadoEjecucion> => {
  const res = await urlApi.post(
    `${API_URL}/${id}/ejecutar-transicion/${evento}`
  );
  return res.data;
};

/**
 * Verifica si una transición específica de pago es válida (retorna booleano simple).
 */
export const esTransicionValidaPago = async (
  id: number,
  evento: Evento
): Promise<boolean> => {
  const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
  return res.data;
};

/**
 * Obtiene recomendaciones del backend para una transición de pago.
 */
export const obtenerRecomendacionesPago = async (
  id: number,
  evento: Evento
): Promise<string[]> => {
  const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
  return res.data;
};

// ============================
// MÉTODO COMPUESTO
// ============================

/**
 * Valida con el backend si una transición de pago es válida.
 * Si pasa la validación, la ejecuta y devuelve el resultado.
 */
export const validarYEjecutarTransicionPago = async (
  id: number,
  evento: Evento
): Promise<ResultadoEjecucion> => {
  try {
    //Validar primero con backend
    const validacion = await analizarTransicionPago(id, evento);

    if (!validacion.valido) {
      console.warn("Transición de pago inválida:", validacion.motivo);
      throw new Error(validacion.motivo || "Transición no válida");
    }

    // Ejecutar si la validación es correcta
    const resultado = await ejecutarTransicionPago(id, evento);
    console.info("Transición ejecutada correctamente:", resultado.mensaje);
    return resultado;
  } catch (error: any) {
    console.error("Error en la transición de pago:", error.message);
    throw error;
  }
};

// ============================
// MÉTODOS ESPECÍFICOS POR ROL
// ============================

/**
 * Obtiene pagos asociados a un inquilino autenticado.
 */
export const obtenerPagosPorInquilino = async (): Promise<
  DTOPagoRespuesta[]
> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

/**
 * Obtiene pagos asociados a un propietario autenticado.
 */
export const obtenerPagosPorPropietario = async (): Promise<
  DTOPagoRespuesta[]
> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};
