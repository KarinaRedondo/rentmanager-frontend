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
 * Obtiene todos los pagos según el rol del usuario autenticado.
 */
export const obtenerPagos = async (): Promise<DTOPagoRespuesta[]> => {
  try {
    const res = await urlApi.get(`${API_URL}/obtener`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error al obtener pagos:", error);
    throw error;
  }
};

/**
 * Obtiene un pago específico por su ID.
 */
export const obtenerPagoPorId = async (id: number): Promise<DTOPagoRespuesta> => {
  try {
    const res = await urlApi.get(`${API_URL}/obtenerPorId/${id}`);
    return res.data;
  } catch (error: any) {
    console.error(`❌ Error al obtener pago ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo pago.
 */
export const crearPago = async (data: DTOPagoRegistro): Promise<DTOPagoRespuesta> => {
  try {
    const res = await urlApi.post(`${API_URL}/crear`, data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error al crear pago:", error);
    throw error;
  }
};

/**
 * Actualiza un pago existente.
 */
export const actualizarPago = async (
  id: number,
  data: DTOPagoActualizar
): Promise<DTOPagoRespuesta> => {
  try {
    const res = await urlApi.put(`${API_URL}/actualizar/${id}`, data);
    return res.data;
  } catch (error: any) {
    console.error(`❌ Error al actualizar pago ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un pago por ID.
 */
export const eliminarPago = async (id: number): Promise<void> => {
  try {
    await urlApi.delete(`${API_URL}/eliminar/${id}`);
  } catch (error: any) {
    console.error(`❌ Error al eliminar pago ${id}:`, error);
    throw error;
  }
};

// ============================
// TRANSICIONES DE ESTADO
// ============================

/**
 * Analiza si una transición de pago es válida antes de ejecutarla.
 * Retorna un objeto con el resultado, motivo, recomendaciones y alternativas.
 */
export const analizarTransicionPago = async (
  id: number,
  evento: Evento | string
): Promise<ResultadoValidacion> => {
  try {
    const res = await urlApi.get(`${API_URL}/${id}/analizar-transicion/${evento}`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error al analizar transición:", error);
    return {
      valido: false,
      motivo: error.response?.data?.message || error.message || "Error al analizar la transición",
      recomendaciones: [],
      alternativas: [],
    };
  }
};

/**
 * Ejecuta una transición de estado en el backend.
 * ⚠️ IMPORTANTE: No valida aquí, asume que ya fue validada previamente.
 */
export const ejecutarTransicionPago = async (
  id: number,
  evento: Evento | string
): Promise<ResultadoEjecucion> => {
  try {
    const res = await urlApi.post(`${API_URL}/${id}/ejecutar-transicion/${evento}`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error al ejecutar transición:", error);

    return {
      exito: false,
      mensaje: error.response?.data?.message || error.message || "Error al ejecutar la transición",
      estadoActual: "ERROR",
    };
  }
};

/**
 * Verifica si una transición específica es válida (respuesta booleana simple).
 */
export const esTransicionValidaPago = async (
  id: number,
  evento: Evento | string
): Promise<boolean> => {
  try {
    const res = await urlApi.get(`${API_URL}/${id}/transicion-valida/${evento}`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error al verificar validez:", error);
    return false;
  }
};

/**
 * Obtiene recomendaciones asociadas a una transición específica desde el backend.
 */
export const obtenerRecomendacionesPago = async (
  id: number,
  evento: Evento | string
): Promise<string[]> => {
  try {
    const res = await urlApi.get(`${API_URL}/${id}/recomendaciones/${evento}`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error al obtener recomendaciones:", error);
    return [];
  }
};

// ============================
// MÉTODO COMPLETO: VALIDAR Y EJECUTAR
// ============================

/**
 * ✅ Flujo completo recomendado: Valida primero y luego ejecuta la transición.
 * Útil para usar en componentes React o flujos de UI.
 *
 * @returns ResultadoEjecucion con el resultado de la operación
 */
export const validarYEjecutarTransicionPago = async (
  id: number,
  evento: Evento | string
): Promise<ResultadoEjecucion> => {
  try {
    console.log(`🔄 Iniciando transición: Pago ${id} → Evento: ${evento}`);

    // Paso 1: Validar primero con el backend
    const validacion = await analizarTransicionPago(id, evento);

    if (!validacion.valido) {
      console.warn("⚠️ Transición rechazada:", validacion.motivo);

      // Retornar un resultado de error en lugar de lanzar excepción
      return {
        exito: false,
        mensaje: validacion.motivo || "Transición inválida según validación del sistema",
        estadoActual: "SIN CAMBIOS",
      };
    }

    console.log("✅ Validación exitosa, ejecutando transición...");

    // Paso 2: Si es válida, ejecutar la transición
    const resultado = await ejecutarTransicionPago(id, evento);

    if (resultado.exito) {
      console.info("✅ Transición ejecutada exitosamente:", resultado.mensaje);
    } else {
      console.warn("⚠️ La transición falló en ejecución:", resultado.mensaje);
    }

    return resultado;
  } catch (error: any) {
    console.error("❌ Error crítico en la transición:", error.message);

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
 * ✅ Obtiene el análisis completo de una transición con manejo robusto de errores.
 * Útil para mostrar información detallada al usuario antes de ejecutar.
 */
export const obtenerAnalisisCompleto = async (
  id: number,
  evento: Evento | string
): Promise<ResultadoValidacion> => {
  const analisis = await analizarTransicionPago(id, evento);

  console.log("📊 Análisis de transición:", {
    valido: analisis.valido,
    motivo: analisis.motivo,
    recomendaciones: analisis.recomendaciones?.length || 0,
    alternativas: analisis.alternativas?.length || 0,
  });

  return analisis;
};

// ============================
// MÉTODOS ESPECÍFICOS POR ROL (ALIAS)
// ============================

/**
 * Obtiene todos los pagos del inquilino autenticado.
 * NOTA: El backend ya filtra por rol automáticamente en /obtener
 */
export const obtenerPagosPorInquilino = async (): Promise<DTOPagoRespuesta[]> => {
  return obtenerPagos();
};

/**
 * Obtiene todos los pagos del propietario autenticado.
 * NOTA: El backend ya filtra por rol automáticamente en /obtener
 */
export const obtenerPagosPorPropietario = async (): Promise<DTOPagoRespuesta[]> => {
  return obtenerPagos();
};

/**
 * Obtiene todos los pagos (para administrador/contador).
 * NOTA: El backend ya filtra por rol automáticamente en /obtener
 */
export const obtenerTodosLosPagos = async (): Promise<DTOPagoRespuesta[]> => {
  return obtenerPagos();
};

