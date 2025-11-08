import axios from "axios";
import type {
  DTOHistorialCambioEstadoRespuesta,
  FiltrosHistorial,
  EstadisticasHistorial,
} from "../modelos/types/HistorialCambioEstado";

const API_URL = "http://localhost:8080/api/v1/historial-cambio-estado";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

/**
 * Obtener todos los historiales
 */
export const obtenerTodosHistoriales = async (): Promise<
  DTOHistorialCambioEstadoRespuesta[]
> => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

/**
 * Obtener historial por entidad específica
 */
export const obtenerHistorialPorEntidad = async (
  tipoEntidad: string,
  idEntidad: number
): Promise<DTOHistorialCambioEstadoRespuesta[]> => {
  const response = await axios.get(
    `${API_URL}/${tipoEntidad}/${idEntidad}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * Buscar con filtros avanzados
 */
export const buscarHistorialConFiltros = async (
  filtros: FiltrosHistorial
): Promise<DTOHistorialCambioEstadoRespuesta[]> => {
  const params = new URLSearchParams();

  if (filtros.tipoEntidad) params.append("tipoEntidad", filtros.tipoEntidad);
  if (filtros.idEntidad)
    params.append("idEntidad", filtros.idEntidad.toString());
  if (filtros.tipoAccion) params.append("tipoAccion", filtros.tipoAccion);
  if (filtros.usuario) params.append("usuario", filtros.usuario);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  const response = await axios.get(
    `${API_URL}/buscar?${params.toString()}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * Obtener estadísticas
 */
export const obtenerEstadisticasHistorial = async (
  fechaInicio?: string
): Promise<EstadisticasHistorial> => {
  const params = fechaInicio ? `?fechaInicio=${fechaInicio}` : "";
  const response = await axios.get(
    `${API_URL}/estadisticas${params}`,
    getAuthHeaders()
  );
  return response.data;
};

/**
 * Obtener últimos 20 cambios
 */
export const obtenerUltimosCambios = async (): Promise<
  DTOHistorialCambioEstadoRespuesta[]
> => {
  const response = await axios.get(`${API_URL}/ultimos`, getAuthHeaders());
  return response.data;
};

/**
 * Exportar historial a PDF con filtros
 */
export const exportarHistorialPDF = async (
  filtros: FiltrosHistorial
): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filtros.tipoEntidad) params.append("tipoEntidad", filtros.tipoEntidad);
  if (filtros.idEntidad)
    params.append("idEntidad", filtros.idEntidad.toString());
  if (filtros.tipoAccion) params.append("tipoAccion", filtros.tipoAccion);
  if (filtros.usuario) params.append("usuario", filtros.usuario);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  try {
    const response = await axios.get(
      `${API_URL}/exportar/pdf?${params.toString()}`,
      {
        ...getAuthHeaders(),
        responseType: "blob", // IMPORTANTE: indica que la respuesta es un archivo binario
      }
    );

    console.log("Respuesta del servidor:", response.status);
    console.log("Tamaño del blob:", response.data.size);

    if (!response.data || response.data.size === 0) {
      throw new Error("El PDF está vacío");
    }

    return response.data;
  } catch (error: any) {
    console.error("Error en exportarHistorialPDF:", error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }

    throw error;
  }
};
