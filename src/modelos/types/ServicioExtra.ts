import type { TipoServicioExtra } from "../enumeraciones/tipoServicioExtra";
import type { Factura } from "./Factura";

export interface ServicioExtra {
  idServicio: number;
  factura: Factura;
  descripcion: string;
  valor: number;
  fecha: string;
  tipoServicioExtra: TipoServicioExtra
}

export type DTOServicioExtraRegistro = Omit<ServicioExtra, "idServicio">;
export type DTOServicioExtraActualizar = Partial<ServicioExtra>;
export interface DTOServicioExtraRespuesta extends DTOServicioExtraActualizar {
  idServicio: number;
}