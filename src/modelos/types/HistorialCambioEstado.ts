export interface DTOHistorialCambioEstadoRespuesta {
  idHistorial: number;
  tipoEntidad: string;
  idEntidad: number;
  tipoAccion: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  fechaCambio: string;
  observacion?: string;
  motivo?: string;
  idUsuarioResponsable?: number;
  nombreUsuarioResponsable?: string;
  emailUsuario?: string;
  datosAnteriores?: string;
  datosNuevos?: string;
  ipOrigen?: string;
  version?: number;
  navegador?: string;
  dispositivo?: string;
}

export interface FiltrosHistorial {
  tipoEntidad?: string;
  idEntidad?: number;
  tipoAccion?: string;
  usuario?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface EstadisticasHistorial {
  cambiosPorDia: Array<{ fecha: string; total: number }>;
  cambiosPorTipo: Array<{ tipoEntidad: string; total: number }>;
  totalCambios: number;
}
