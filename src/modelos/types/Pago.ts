import type { EntidadFinanciera } from "../enumeraciones/entidadFinanciera";
import type { EstadoPago } from "../enumeraciones/estadoPago";
import type { MetodoPago } from "../enumeraciones/metodoPago";
import type { Factura } from "./Factura";

export interface Pago {
  idPago: number;
  factura: Factura;
  fecha: string;
  monto: number;
  metodoPago: MetodoPago | string;
  referenciaTransaccion: string;
  comprobanteUrl?: string; 
  bancoOrigen?: EntidadFinanciera | string; 
  bancoDestino?: EntidadFinanciera | string; 
  estado: EstadoPago | string;
}

export type DTOPagoRegistro = Omit<Pago, "idPago">;
export type DTOPagoActualizar = Partial<Pago>;
export interface DTOPagoRespuesta extends DTOPagoActualizar {
  idPago: number;
}
