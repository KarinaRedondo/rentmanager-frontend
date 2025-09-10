import type { Contrato } from "./Contrato";
import type { Factura } from "./Factura";

export interface ServicioExtra {
  idServicio: number;
  contrato: Contrato;
  factura: Factura;
  descripcion: string;
  valor: number;
  fecha: string;
}

export type DTOServicioExtraRegistro = Omit<ServicioExtra, "idServicio">;
export type DTOServicioExtraActualizar = Partial<ServicioExtra>;
export interface DTOServicioExtraRespuesta extends DTOServicioExtraActualizar {
  idServicio: number;
}