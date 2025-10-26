import { urlApi } from "../app/api";
import { Evento } from "../modelos/enumeraciones/evento";
import type {
  DTOContratoActualizar,
  DTOContratoRegistro,
  DTOContratoRespuesta,
} from "../modelos/types/Contrato";

const API_URL = "/api/v1/contratos";

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
// MÉTODOS CRUD
// ============================

/**
 * Obtiene todos los contratos disponibles según el rol del usuario autenticado.
 */
export const obtenerContratos = async (): Promise<DTOContratoRespuesta[]> => {
  const res = await urlApi.get(`${API_URL}/obtener`);
  return res.data;
};

/**
 * Obtiene un contrato específico por su ID.
 */
export const obtenerContratoPorId = async (
  id: number
): Promise<DTOContratoRespuesta> => {
  const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
  return res.data;
};

/**
 * Crea un nuevo contrato.
 */
export const crearContrato = async (
  data: DTOContratoRegistro
): Promise<DTOContratoRespuesta> => {
  const res = await urlApi.post(`${API_URL}/crear`, data);
  return res.data;
};

/**
 * Actualiza un contrato existente.
 */
export const actualizarContrato = async (
  id: number,
  data: DTOContratoActualizar
): Promise<DTOContratoRespuesta> => {
  const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
  return res.data;
};

/**
 * Elimina un contrato por ID.
 */
export const eliminarContrato = async (id: number): Promise<void> => {
  await urlApi.delete(`${API_URL}/eliminar/${id}`);
};

// ============================
// TRANSICIONES DE ESTADO
// ============================

/**
 * Analiza si una transición de contrato es válida antes de ejecutarla.
 * Devuelve un objeto con el resultado, motivo, recomendaciones y alternativas.
 */
export const analizarTransicionContrato = async (
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
 * Ejecuta una transición de estado SOLO si el backend la valida primero.
 * Si la validación falla, lanza una excepción con el motivo.
 */
export const ejecutarTransicionContrato = async (
  id: number,
  evento: Evento
): Promise<ResultadoEjecucion> => {
  // Paso 1: Analizar la validez de la transición
  const validacion = await analizarTransicionContrato(id, evento);

  if (!validacion.valido) {
    console.warn(
      `Transición inválida (${evento}) para contrato ${id}: ${validacion.motivo}`
    );
    throw new Error(
      validacion.motivo ||
        "Transición no válida según las reglas del sistema de validación"
    );
  }

  // Paso 2: Si es válida, ejecutar la transición
  const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
  return res.data;
};

/**
 * Verifica si una transición específica es válida (respuesta booleana simple).
 */
export const esTransicionValida = async (
  id: number,
  evento: Evento
): Promise<boolean> => {
  const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
  return res.data;
};

/**
 * Obtiene recomendaciones asociadas a una transición específica desde el backend.
 */
export const obtenerRecomendaciones = async (
  id: number,
  evento: Evento
): Promise<string[]> => {
  const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
  return res.data;
};

// ============================
// MÉTODO COMPLETO: VALIDAR Y EJECUTAR
// ============================

/**
 * Combina el flujo completo de validación + ejecución de transición.
 * Útil para usar en componentes React o flujos de UI.
 */
export const validarYEjecutarTransicion = async (
  id: number,
  evento: Evento
): Promise<ResultadoEjecucion> => {
  try {
    //Validar primero con el backend
    const validacion = await analizarTransicionContrato(id, evento);

    if (!validacion.valido) {
      console.warn("Transición rechazada:", validacion.motivo);
      throw new Error(validacion.motivo || "Transición inválida según validación");
    }

    // Ejecutar si fue válida
    const resultado = await ejecutarTransicionContrato(id, evento);
    console.info("Transición ejecutada:", resultado.mensaje);

    return resultado;
  } catch (error: any) {
    console.error("Error en la transición:", error.message);
    throw error;
  }
};
