import type { EstadoFactura } from "../enumeraciones/estadoFactura";
import type { Contrato } from "./Contrato";

export interface Factura {
  idFactura: number;
  contrato: Contrato;
  fechaEmision: string;
  total: number;
  estado: EstadoFactura;
}

export type DTOFacturaRegistro = Omit<Factura, "idFactura">;
export type DTOFacturaActualizar = Partial<Factura>;
export interface DTOFacturaRespuesta extends DTOFacturaActualizar {
  idFactura: number;
}