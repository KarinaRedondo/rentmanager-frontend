import axios from "axios";
import type {
  DTOReporteContratoCompleto,
  DTOReportePropiedadCompleto,
  DTOReportePagoCompleto,
  DTOReporteFacturaCompleto,
  DTOReportePersonalizado,
  DTOFiltrosReporte,
} from "../modelos/types/Reporte";

const API_URL = "http://localhost:8080/api/reportes";
const API_USUARIOS = "http://localhost:8080/api/usuarios";

// ==================== HEADERS ====================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// ==================== OBTENER USUARIO ACTUAL ====================

/**
 * OBTIENE EL USUARIO AUTENTICADO ACTUAL
 * @returns Nombre completo del usuario o "Sistema" si falla
 */
export const obtenerUsuarioActual = async (): Promise<string> => {
  try {
    const response = await axios.get(
      `${API_USUARIOS}/actual`,
      getAuthHeaders()
    );

    const usuario = response.data;

    if (usuario && usuario.nombre && usuario.apellido) {
      const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.trim();
      console.log("Usuario obtenido:", nombreCompleto);
      return nombreCompleto;
    }

    console.warn("Usuario sin nombre/apellido");
    return "Sistema";
  } catch (error: any) {
    console.error("Error obteniendo usuario actual:", error.message);
    return "Sistema";
  }
};

// ==================== REPORTES DE CONTRATOS ====================

export const obtenerReporteContrato = async (
  idContrato: number
): Promise<DTOReporteContratoCompleto> => {
  const response = await axios.get(
    `${API_URL}/contrato/${idContrato}`,
    getAuthHeaders()
  );
  return response.data;
};

export const descargarReporteContratoPDF = async (
  idContrato: number
): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/contrato/${idContrato}/pdf`, {
      ...getAuthHeaders(),
      responseType: "blob",
    });
    console.log("PDF de contrato descargado:", response.data.size, "bytes");
    return response.data;
  } catch (error: any) {
    console.error("Error descargando PDF de contrato:", error);
    throw error;
  }
};

// ==================== REPORTES DE PROPIEDADES ====================

export const obtenerReportePropiedad = async (
  idPropiedad: number
): Promise<DTOReportePropiedadCompleto> => {
  const response = await axios.get(
    `${API_URL}/propiedad/${idPropiedad}`,
    getAuthHeaders()
  );
  return response.data;
};

export const descargarReportePropiedadPDF = async (
  idPropiedad: number
): Promise<Blob> => {
  try {
    const response = await axios.get(
      `${API_URL}/propiedad/${idPropiedad}/pdf`,
      {
        ...getAuthHeaders(),
        responseType: "blob",
      }
    );
    console.log("PDF de propiedad descargado:", response.data.size, "bytes");
    return response.data;
  } catch (error: any) {
    console.error("Error descargando PDF de propiedad:", error);
    throw error;
  }
};

// ==================== REPORTES DE PAGOS ====================

export const obtenerReportePago = async (
  idPago: number
): Promise<DTOReportePagoCompleto> => {
  const response = await axios.get(
    `${API_URL}/pago/${idPago}`,
    getAuthHeaders()
  );
  return response.data;
};

export const descargarReportePagoPDF = async (
  idPago: number
): Promise<Blob> => {
  try {
    console.log("Descargando PDF para pago:", idPago);

    const response = await axios.get(`${API_URL}/pago/${idPago}/pdf`, {
      ...getAuthHeaders(),
      responseType: "blob",
      timeout: 30000,
    });

    console.log("PDF de pago descargado:", response.data.size, "bytes");
    console.log("Content-Type:", response.headers["content-type"]);

    return response.data;
  } catch (error: any) {
    console.error("Error descargando PDF del pago:", error.message);
    console.error("Response:", error.response?.data);
    console.error("Status:", error.response?.status);
    throw error;
  }
};

// ==================== REPORTES DE FACTURAS ====================

export const obtenerReporteFactura = async (
  idFactura: number
): Promise<DTOReporteFacturaCompleto> => {
  const response = await axios.get(
    `${API_URL}/factura/${idFactura}`,
    getAuthHeaders()
  );
  return response.data;
};

export const descargarReporteFacturaPDF = async (
  idFactura: number
): Promise<Blob> => {
  try {
    const response = await axios.get(`${API_URL}/factura/${idFactura}/pdf`, {
      ...getAuthHeaders(),
      responseType: "blob",
    });
    console.log("PDF de factura descargado:", response.data.size, "bytes");
    return response.data;
  } catch (error: any) {
    console.error("Error descargando PDF de factura:", error);
    throw error;
  }
};

// ==================== REPORTES PERSONALIZADOS ====================

export const obtenerReportePersonalizado = async (
  filtros: DTOFiltrosReporte
): Promise<DTOReportePersonalizado> => {
  const params = new URLSearchParams();

  if (filtros.tipoEntidad) params.append("tipoEntidad", filtros.tipoEntidad);
  if (filtros.idEntidad)
    params.append("idEntidad", filtros.idEntidad.toString());
  if (filtros.tipoAccion) params.append("tipoAccion", filtros.tipoAccion);
  if (filtros.usuario) params.append("usuario", filtros.usuario);
  if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio);
  if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin);

  const response = await axios.get(
    `${API_URL}/personalizado?${params.toString()}`,
    getAuthHeaders()
  );
  return response.data;
};

export const descargarReportePersonalizadoPDF = async (
  filtros: DTOFiltrosReporte
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
      `${API_URL}/personalizado/pdf?${params.toString()}`,
      {
        ...getAuthHeaders(),
        responseType: "blob",
      }
    );
    console.log("PDF personalizado descargado:", response.data.size, "bytes");
    return response.data;
  } catch (error: any) {
    console.error("Error descargando PDF personalizado:", error);
    throw error;
  }
};

// ==================== UTILIDADES ====================

/**
 * DESCARGA UN ARCHIVO BLOB EN EL NAVEGADOR
 * @param blob Datos del archivo
 * @param nombreArchivo Nombre del archivo a descargar
 */
export const descargarArchivo = (blob: Blob, nombreArchivo: string) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log("Archivo descargado:", nombreArchivo);
  } catch (error) {
    console.error("Error al descargar archivo:", error);
    throw error;
  }
};
