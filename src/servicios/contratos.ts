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
  evento: Evento | string
): Promise<ResultadoValidacion> => {
  try {
    const res = await urlApi.get(
      `${API_URL}/${id}/analizar-transicion/${evento}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Error al analizar transición:", error);
    return {
      valido: false,
      motivo:
        error.response?.data?.message ||
        error.message ||
        "Error al analizar la transición",
      recomendaciones: [],
      alternativas: [],
    };
  }
};

/**
 * Ejecuta una transición de estado en el backend.
 * IMPORTANTE: No valida aquí, asume que ya fue validada previamente.
 */
export const ejecutarTransicionContrato = async (
  id: number,
  evento: Evento | string
): Promise<ResultadoEjecucion> => {
  try {
    const res = await urlApi.post(
      `${API_URL}/${id}/ejecutar-transicion/${evento}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Error al ejecutar transición:", error);

    // Retornar resultado de error estructurado
    return {
      exito: false,
      mensaje:
        error.response?.data?.message ||
        error.message ||
        "Error al ejecutar la transición",
      estadoActual: "ERROR",
    };
  }
};

/**
 * Verifica si una transición específica es válida (respuesta booleana simple).
 */
export const esTransicionValida = async (
  id: number,
  evento: Evento | string
): Promise<boolean> => {
  try {
    const res = await urlApi.get(
      `${API_URL}/${id}/transicion-valida/${evento}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Error al verificar validez:", error);
    return false;
  }
};

/**
 * Obtiene recomendaciones asociadas a una transición específica desde el backend.
 */
export const obtenerRecomendaciones = async (
  id: number,
  evento: Evento | string
): Promise<string[]> => {
  try {
    const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
    return res.data;
  } catch (error: any) {
    console.error("Error al obtener recomendaciones:", error);
    return [];
  }
};

// ============================
// MÉTODO COMPLETO: VALIDAR Y EJECUTAR
// ============================

/**
 * Flujo completo recomendado: Valida primero y luego ejecuta la transición.
 * Útil para usar en componentes React o flujos de UI.
 *
 * @returns ResultadoEjecucion con el resultado de la operación
 * @throws Error si la validación falla (opcional, depende del manejo de errores)
 */
export const validarYEjecutarTransicion = async (
  id: number,
  evento: Evento | string
): Promise<ResultadoEjecucion> => {
  try {
    console.log(`Iniciando transición: Contrato ${id} → Evento: ${evento}`);

    // Paso 1: Validar primero con el backend
    const validacion = await analizarTransicionContrato(id, evento);

    if (!validacion.valido) {
      console.warn("Transición rechazada:", validacion.motivo);

      // Retornar un resultado de error en lugar de lanzar excepción
      return {
        exito: false,
        mensaje:
          validacion.motivo ||
          "Transición inválida según validación del sistema",
        estadoActual: "SIN CAMBIOS",
      };
    }

    console.log("Validación exitosa, ejecutando transición...");

    // Paso 2: Si es válida, ejecutar la transición
    const resultado = await ejecutarTransicionContrato(id, evento);

    if (resultado.exito) {
      console.info("Transición ejecutada exitosamente:", resultado.mensaje);
    } else {
      console.warn("La transición falló en ejecución:", resultado.mensaje);
    }

    return resultado;
  } catch (error: any) {
    console.error("Error crítico en la transición:", error.message);

    // Retornar resultado de error estructurado
    return {
      exito: false,
      mensaje: error.message || "Error inesperado al procesar la transición",
      estadoActual: "ERROR",
    };
  }
};

// ============================
// FUNCIONES AUXILIARES
// ============================

/**
 * Obtiene el análisis completo de una transición con manejo robusto de errores.
 * Útil para mostrar información detallada al usuario antes de ejecutar.
 */
export const obtenerAnalisisCompleto = async (
  id: number,
  evento: Evento | string
): Promise<ResultadoValidacion> => {
  const analisis = await analizarTransicionContrato(id, evento);

  console.log("Análisis de transición:", {
    valido: analisis.valido,
    motivo: analisis.motivo,
    recomendaciones: analisis.recomendaciones?.length || 0,
    alternativas: analisis.alternativas?.length || 0,
  });

  return analisis;
};
