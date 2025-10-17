import type { EstadoPropiedad } from "../enumeraciones/estadoPropiedad";
import type {  ServiciosPublicos } from "../enumeraciones/serviciosPublicos";
import type { TipoPropiedad } from "../enumeraciones/tipoPropiedad";

export interface Propiedad {
  idPropiedad: number;
  direccion: string;
  ciudad: string;
  estado: EstadoPropiedad;
  tipo: TipoPropiedad;     
  propietario: number;
  propiedadPadre?: Propiedad;
  area: number;
  habitaciones: number;
  banos: number;
  parqueaderos: number;
  amoblado: boolean;
  pisos: number;
  descripcion: string;
  anoConstruccion: number;
  serviciosPublicos?: ServiciosPublicos[];
}

export type DTOPropiedadRegistro = Omit<Propiedad, "idPropiedad">;
export type DTOPropiedadActualizar = Partial<Propiedad>;
export interface DTOPropiedadRespuesta extends DTOPropiedadActualizar {
  idPropiedad: number;
  nombrePropietario?: string;
  direccionPropiedadPadre?: string;
}