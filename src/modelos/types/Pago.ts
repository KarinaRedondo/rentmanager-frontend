import type { EstadoPago } from "../enumeraciones/estadoPago";
import type { MetodoPago } from "../enumeraciones/metodoPago";
import type { Factura } from "./Factura";

export interface Pago {
  idPago: number;
  factura: Factura;
  fecha: Date;
  monto: number;
  metodoPago: MetodoPago;
  referenciaTransaccion: string;
  comprobanteURL: string;
  bancoOrigen: string;
  bancoDestino: string;
  estado: EstadoPago;
}

export type DTOPagoRegistro = Omit<Pago, "idPago">;
export type DTOPagoActualizar = Partial<Pago>;
export interface DTOPagoRespuesta extends DTOPagoActualizar {
  idPago: number;
}