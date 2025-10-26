import { urlApi } from "../app/api";
import type { DTOHistorialCambioEstadoRegistro, DTOHistorialCambioEstadoRespuesta } from "../modelos/types/HistorialCambioEstado";

const API_URL = "/api/v1/historial-cambio-estado";

export const HistorialService = {
  async registrarCambio(data: DTOHistorialCambioEstadoRegistro): Promise<DTOHistorialCambioEstadoRespuesta> {
    const res = await urlApi.post(`${API_URL}/registrar`, data);
    return res.data;
  },

  async obtenerPorEntidad(tipoEntidad: string, idEntidad: number): Promise<DTOHistorialCambioEstadoRespuesta[]> {
    const res = await urlApi.get(`${API_URL}/${tipoEntidad}/${idEntidad}`);
    return res.data;
  }
};
