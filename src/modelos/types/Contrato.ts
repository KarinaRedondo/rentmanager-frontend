import type { EstadoContrato } from "../enumeraciones/estadoContrato";
import type { Inquilino } from "./Inquilino";
import type { Propiedad } from "./Propiedad";

export interface Contrato {
  idContrato: number;
  propiedad: Propiedad;
  inquilino: Inquilino;
  fechaInicio: string; // LocalDate → string ISO
  fechaFin: string;
  valorMensual: number; // BigDecimal → number
  estado: EstadoContrato;
}

export type DTOContratoRegistro = Omit<Contrato, "idContrato">;
export type DTOContratoActualizar = Partial<Contrato>;
export interface DTOContratoRespuesta extends DTOContratoActualizar {
  idContrato: number;
  direccionPropiedad?: string;
  ciudadPropiedad?: string;
  idInquilino: number;
  nombreInquilino?: string;
  apellidoInquilino?: string;
}