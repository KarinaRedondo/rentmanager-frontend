import type { EstadoPago } from "../enumeraciones/estadoPago";
import type { Contrato } from "./Contrato";
import type { Factura } from "./Factura";

export interface Pago {
  idPago: number;
  contrato: Contrato;
  factura: Factura;
  mes: string; // LocalDate → string
  monto: number;
  estado: EstadoPago;
}

export type DTOPagoRegistro = Omit<Pago, "idPago">;
export type DTOPagoActualizar = Partial<Pago>;
export interface DTOPagoRespuesta extends DTOPagoActualizar {
  idPago: number;
}