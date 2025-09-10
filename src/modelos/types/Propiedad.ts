import type { EstadoPropiedad } from "../enumeraciones/estadoPropiedad";
import type { Propietario } from "./Propietario";

export interface Propiedad {
  idPropiedad: number;
  direccion: string;
  ciudad: string;
  estado: EstadoPropiedad;
  propietario: Propietario;
  propiedadPadre?: Propiedad;
}

export type DTOPropiedadRegistro = Omit<Propiedad, "idPropiedad">;
export type DTOPropiedadActualizar = Partial<Propiedad>;
export interface DTOPropiedadRespuesta extends DTOPropiedadActualizar {
  idPropiedad: number;
  nombrePropietario?: string;
  direccionPropiedadPadre?: string;
}