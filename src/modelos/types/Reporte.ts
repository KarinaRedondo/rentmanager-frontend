export interface DTOContratoReporte {
  idContrato: number;
  fechaInicio: string;
  fechaFin: string;
  valorMensual: number;
  estado: string;
  observaciones?: string;
  tipoContrato: string;
  formaPago: string;
}

export interface DTOPropiedadReporte {
  idPropiedad: number;
  direccion: string;
  ciudad: string;
  tipo: string;
  estado: string;
  descripcion?: string;
  area: number;
  habitaciones: number;
  banos: number;
  parqueaderos: number;
  amoblado: boolean;
  piso: number;
  anoConstruccion: number;
  serviciosPublicos?: string[];
}

export interface DTOUsuarioReporte {
  idUsuario?: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  tipoUsuario?: string;
  estado?: string;
  fechaRegistro?: string;
}

export interface DTOFacturaReporte {
  idFactura: number;
  fechaEmision: string;
  fechaVencimiento: string;
  total: number;
  estado: string;
}

export interface DTOPagoReporte {
  idPago: number;
  fecha: string;
  monto: number;
  metodoPago: string;
  estado: string;
  referenciaTransaccion?: string;
  comprobanteUrl?: string;
  bancoOrigen?: string;
  bancoDestino?: string;
}

export interface DTOHistorialCambio {
  idHistorial: number;
  tipoEntidad: string;
  tipoAccion: string;
  estadoAnterior?: string;
  estadoNuevo: string;
  fechaCambio: string;
  usuarioResponsable?: string;
  observacion?: string;
  motivo?: string;
}

export interface DTOHistorialConsolidado {
  historialPropiedad: DTOHistorialCambio[];
  historialContratos: DTOHistorialCambio[];
  historialFacturas: DTOHistorialCambio[];
  historialPagos: DTOHistorialCambio[];
}

export interface DTOReporteContratoCompleto {
  contrato: DTOContratoReporte;
  propiedad?: DTOPropiedadReporte;
  propietario?: DTOUsuarioReporte;
  inquilino?: DTOUsuarioReporte;
  facturas: DTOFacturaReporte[];
  pagos: DTOPagoReporte[];
  historialCambios: DTOHistorialCambio[];
  fechaGeneracion: string;
  usuarioGenerador?: DTOUsuarioReporte;
}

export interface DTOReportePropiedadCompleto {
  propiedad: DTOPropiedadReporte;
  propietario?: DTOUsuarioReporte;
  contratos: DTOContratoReporte[];
  historialConsolidado: DTOHistorialConsolidado;
  fechaGeneracion: string;
  usuarioGenerador?: DTOUsuarioReporte;
}

export interface DTOReportePagoCompleto {
  pago: DTOPagoReporte;
  factura?: DTOFacturaReporte;
  contrato?: DTOContratoReporte;
  propiedad?: DTOPropiedadReporte;
  inquilino?: DTOUsuarioReporte;
  propietario?: DTOUsuarioReporte;
  historialCambios: DTOHistorialCambio[];
  fechaGeneracion: string;
  usuarioGenerador?: DTOUsuarioReporte;
}

export interface DTOReporteFacturaCompleto {
  factura: DTOFacturaReporte;
  contrato?: DTOContratoReporte;
  propiedad?: DTOPropiedadReporte;
  inquilino?: DTOUsuarioReporte;
  propietario?: DTOUsuarioReporte;
  pagosAsociados: DTOPagoReporte[];
  historialCambios: DTOHistorialCambio[];
  fechaGeneracion: string;
  usuarioGenerador?: DTOUsuarioReporte;
}

export interface DTOFiltrosReporte {
  tipoEntidad?: string;
  idEntidad?: number;
  tipoAccion?: string;
  usuario?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface DTOReportePersonalizado {
  historial: DTOHistorialCambio[];
  filtrosAplicados: DTOFiltrosReporte;
  totalRegistros: number;
  fechaGeneracion: string;
  usuarioGenerador?: DTOUsuarioReporte;
}
