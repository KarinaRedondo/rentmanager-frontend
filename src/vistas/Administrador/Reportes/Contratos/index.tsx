import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import {
  obtenerReporteContrato,
  descargarReporteContratoPDF,
  descargarArchivo,
} from "../../../../servicios/reportes";
import type { DTOReporteContratoCompleto } from "../../../../modelos/types/Reporte";
import styles from "./ReporteContrato.module.css";
import {
  FileText,
  Download,
  Home,
  User,
  DollarSign,
  CreditCard,
  Clock,
  ArrowLeft,
  Users,
  AlertCircle,
  Calendar,
  ArrowRight,
} from "react-feather";

// ========================================
// PÁGINA REPORTE DE CONTRATO MEJORADA
// ========================================
//
// MEJORAS IMPLEMENTADAS:
// - Reemplazo de alert() por SweetAlert2 con iconos nativos
// - Sin uso de emojis (preferencia del usuario)
// - Mejor manejo de estados de carga y error
// - Feedback visual mejorado para descargas
// - Validación robusta de datos
// - Mensajes de error más descriptivos

const ReporteContrato: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reporte, setReporte] = useState<DTOReporteContratoCompleto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [descargando, setDescargando] = useState<boolean>(false);
  const [usuarioGenerador, setUsuarioGenerador] = useState<string>("Sistema");

  useEffect(() => {
    if (id) {
      cargarReporte();
    } else {
      setError("ID de contrato no proporcionado");
      setCargando(false);
    }
  }, [id]);

  // CARGAR REPORTE Y EXTRAER USUARIO GENERADOR
  const cargarReporte = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerReporteContrato(Number(id));
      setReporte(data);

      // OBTENER USUARIO DEL DTO
      if (data.usuarioGenerador) {
        const usuario = data.usuarioGenerador;
        const nombreCompleto = `${usuario.nombre || "Sistema"} ${
          usuario.apellido || ""
        }`.trim();
        setUsuarioGenerador(nombreCompleto);
        console.log("Usuario generador obtenido:", nombreCompleto);
      } else {
        setUsuarioGenerador("Sistema");
      }
    } catch (error: any) {
      console.error("Error cargando reporte:", error);
      const mensajeError = 
        error.response?.data?.mensaje || 
        error.message || 
        "Error al cargar el reporte";
      setError(mensajeError);
      setUsuarioGenerador("Sistema");
      
      // Mostrar error con SweetAlert2
      await Swal.fire({
        title: "Error al Cargar",
        text: mensajeError,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDescargando(true);
      
      // Mostrar loading
      Swal.fire({
        title: "Generando PDF",
        text: "Por favor espere...",
        icon: "info",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

      const blob = await descargarReporteContratoPDF(Number(id));
      descargarArchivo(blob, `reporte_contrato_${id}_${Date.now()}.pdf`);
      
      // Cerrar loading y mostrar éxito
      await Swal.fire({
        title: "Éxito",
        text: "PDF descargado exitosamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error descargando PDF:", error);
      
      await Swal.fire({
        title: "Error al Descargar",
        text: error.response?.data?.mensaje || "Error al descargar el PDF",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setDescargando(false);
    }
  };

  const formatearFecha = (fecha: string): string => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatearFechaHora = (fecha: string): string => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const formatearMoneda = (valor: number): string => {
    if (valor === null || valor === undefined) return "N/A";
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(valor);
    } catch {
      return "N/A";
    }
  };

  // OBTENER NOMBRE DE USUARIO (priorizar nombreUsuarioResponsable)
  const obtenerNombreUsuario = (cambio: any): string => {
    if (
      cambio.nombreUsuarioResponsable &&
      typeof cambio.nombreUsuarioResponsable === "string"
    ) {
      const nombre = cambio.nombreUsuarioResponsable.trim();
      if (nombre && nombre !== "[null]" && nombre !== "null") {
        return nombre;
      }
    }
    if (cambio.usuarioResponsable) {
      if (typeof cambio.usuarioResponsable === "string") {
        const nombre = cambio.usuarioResponsable.trim();
        if (nombre && nombre !== "[null]" && nombre !== "null") {
          return nombre;
        }
      }
    }
    if (cambio.idUsuarioResponsable) {
      return `Usuario #${cambio.idUsuarioResponsable}`;
    }
    return "Sistema Automático";
  };

  // OBTENER CLASE CSS PARA BADGE DE ESTADO
  const obtenerClaseEstado = (estado: string): string => {
    const estadoNormalizado = estado?.toUpperCase() || "";
    const clasesEstado: Record<string, string> = {
      ACTIVO: styles.estadoACTIVO,
      INACTIVO: styles.estadoINACTIVO,
      PENDIENTE: styles.estadoPENDIENTE,
      PAGADO: styles.estadoPAGADO,
      VENCIDO: styles.estadoVENCIDO,
      CANCELADO: styles.estadoCANCELADO,
      COMPLETADO: styles.estadoCOMPLETADO,
      FINALIZADO: styles.estadoFINALIZADO,
    };
    return clasesEstado[estadoNormalizado] || styles.badgeDefault;
  };

  // OBTENER CLASE CSS PARA BADGE DE ACCIÓN
  const obtenerClaseAccion = (accion: string): string => {
    const accionNormalizada = accion?.toUpperCase() || "";
    const clasesAccion: Record<string, string> = {
      CREACION: styles.accionCREACION,
      ACTUALIZACION: styles.accionACTUALIZACION,
      ELIMINACION: styles.accionELIMINACION,
      CAMBIO_ESTADO: styles.accionCAMBIO_ESTADO,
      TRANSICION: styles.accionTRANSICION,
    };
    return clasesAccion[accionNormalizada] || styles.badgeDefault;
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.contenedor}>
            <div className={styles.cargando}>
              <div className={styles.spinner}></div>
              <p>Generando reporte...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.contenedor}>
            <div className={styles.errorContenedor}>
              <AlertCircle size={48} color="#dc3545" />
              <h2>Error</h2>
              <p className={styles.error}>{error || "Reporte no encontrado"}</p>
              <button 
                className={styles.btnVolver}
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <Header />
      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* ===== ENCABEZADO CON USUARIO REAL ===== */}
          <div className={styles.encabezado}>
            <div className={styles.tituloSeccion}>
              <button className={styles.btnVolver} onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1>
                  <FileText size={32} />
                  Reporte de Contrato #{reporte.contrato.idContrato}
                </h1>
                <p className={styles.subtitulo}>
                  <Calendar size={14} />
                  Generado el {formatearFecha(reporte.fechaGeneracion)} por{" "}
                  <strong>{usuarioGenerador}</strong>
                </p>
              </div>
            </div>
            <button
              className={styles.btnDescargar}
              onClick={descargarPDF}
              disabled={descargando}
            >
              <Download size={20} />
              {descargando ? "Descargando..." : "Descargar PDF"}
            </button>
          </div>

          {/* ===== INFORMACIÓN DEL CONTRATO ===== */}
          <div className={styles.seccion}>
            <h2>
              <FileText size={24} />
              Información del Contrato
            </h2>
            <div className={styles.grid2}>
              <div className={styles.campo}>
                <label>
                  <Calendar size={14} /> Fecha Inicio:
                </label>
                <p>{formatearFecha(reporte.contrato.fechaInicio)}</p>
              </div>
              <div className={styles.campo}>
                <label>
                  <Calendar size={14} /> Fecha Fin:
                </label>
                <p>{formatearFecha(reporte.contrato.fechaFin)}</p>
              </div>
              <div className={styles.campo}>
                <label>
                  <DollarSign size={14} /> Valor Mensual:
                </label>
                <p className={styles.valorDestacado}>
                  {formatearMoneda(reporte.contrato.valorMensual)}
                </p>
              </div>
              <div className={styles.campo}>
                <label>Estado:</label>
                <span
                  className={`${styles.badge} ${obtenerClaseEstado(
                    reporte.contrato.estado
                  )}`}
                >
                  {reporte.contrato.estado}
                </span>
              </div>
              <div className={styles.campo}>
                <label>Tipo Contrato:</label>
                <p>{reporte.contrato.tipoContrato}</p>
              </div>
              <div className={styles.campo}>
                <label>
                  <CreditCard size={14} /> Forma de Pago:
                </label>
                <p>{reporte.contrato.formaPago}</p>
              </div>
            </div>
            {reporte.contrato.observaciones && (
              <div className={styles.campo} style={{ marginTop: "1rem" }}>
                <label>Observaciones:</label>
                <p className={styles.observaciones}>
                  {reporte.contrato.observaciones}
                </p>
              </div>
            )}
          </div>

          {/* ===== PROPIEDAD ===== */}
          {reporte.propiedad && (
            <div className={styles.seccion}>
              <h2>
                <Home size={24} />
                Propiedad Arrendada
              </h2>
              <div className={styles.grid3}>
                <div className={styles.campo}>
                  <label>Dirección:</label>
                  <p>{reporte.propiedad.direccion}</p>
                </div>
                <div className={styles.campo}>
                  <label>Ciudad:</label>
                  <p>{reporte.propiedad.ciudad}</p>
                </div>
                <div className={styles.campo}>
                  <label>Tipo:</label>
                  <p>{reporte.propiedad.tipo}</p>
                </div>
                <div className={styles.campo}>
                  <label>Área:</label>
                  <p>{reporte.propiedad.area} m²</p>
                </div>
                <div className={styles.campo}>
                  <label>Habitaciones:</label>
                  <p>{reporte.propiedad.habitaciones}</p>
                </div>
                <div className={styles.campo}>
                  <label>Baños:</label>
                  <p>{reporte.propiedad.banos}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== PROPIETARIO ===== */}
          {reporte.propietario && (
            <div className={styles.seccion}>
              <h2>
                <User size={24} />
                Propietario
              </h2>
              <div className={styles.grid3}>
                <div className={styles.campo}>
                  <label>Nombre:</label>
                  <p>
                    {reporte.propietario.nombre} {reporte.propietario.apellido}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Documento:</label>
                  <p>
                    {reporte.propietario.tipoDocumento}{" "}
                    {reporte.propietario.numeroDocumento}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Correo:</label>
                  <p>{reporte.propietario.correo}</p>
                </div>
                <div className={styles.campo}>
                  <label>Teléfono:</label>
                  <p>{reporte.propietario.telefono}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== INQUILINO ===== */}
          {reporte.inquilino && (
            <div className={styles.seccion}>
              <h2>
                <Users size={24} />
                Inquilino
              </h2>
              <div className={styles.grid3}>
                <div className={styles.campo}>
                  <label>Nombre:</label>
                  <p>
                    {reporte.inquilino.nombre} {reporte.inquilino.apellido}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Documento:</label>
                  <p>
                    {reporte.inquilino.tipoDocumento}{" "}
                    {reporte.inquilino.numeroDocumento}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Correo:</label>
                  <p>{reporte.inquilino.correo}</p>
                </div>
                <div className={styles.campo}>
                  <label>Teléfono:</label>
                  <p>{reporte.inquilino.telefono}</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== FACTURAS ===== */}
          {reporte.facturas && reporte.facturas.length > 0 && (
            <div className={styles.seccion}>
              <h2>
                <CreditCard size={24} />
                Facturas Generadas ({reporte.facturas.length})
              </h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Emisión</th>
                      <th>Vencimiento</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.facturas.map((factura) => (
                      <tr key={factura.idFactura}>
                        <td>#{factura.idFactura}</td>
                        <td>{formatearFecha(factura.fechaEmision)}</td>
                        <td>{formatearFecha(factura.fechaVencimiento)}</td>
                        <td className={styles.valorDestacado}>
                          {formatearMoneda(factura.total)}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${obtenerClaseEstado(
                              factura.estado
                            )}`}
                          >
                            {factura.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== PAGOS ===== */}
          {reporte.pagos && reporte.pagos.length > 0 && (
            <div className={styles.seccion}>
              <h2>
                <DollarSign size={24} />
                Pagos Realizados ({reporte.pagos.length})
              </h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Método</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.pagos.map((pago) => (
                      <tr key={pago.idPago}>
                        <td>#{pago.idPago}</td>
                        <td>{formatearFecha(pago.fecha)}</td>
                        <td className={styles.valorDestacado}>
                          {formatearMoneda(pago.monto)}
                        </td>
                        <td>{pago.metodoPago}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${obtenerClaseEstado(
                              pago.estado
                            )}`}
                          >
                            {pago.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== HISTORIAL ===== */}
          {reporte.historialCambios && reporte.historialCambios.length > 0 && (
            <div className={styles.seccion}>
              <h2>
                <Clock size={24} />
                Historial de Cambios ({reporte.historialCambios.length})
              </h2>
              <div className={styles.timeline}>
                {reporte.historialCambios.map((cambio) => (
                  <div key={cambio.idHistorial} className={styles.timelineItem}>
                    <div className={styles.timelineMarker}></div>
                    <div className={styles.timelineContenido}>
                      <div className={styles.timelineEncabezado}>
                        <span
                          className={`${styles.badge} ${obtenerClaseAccion(
                            cambio.tipoAccion
                          )}`}
                        >
                          {cambio.tipoAccion}
                        </span>
                        <span className={styles.timelineFecha}>
                          <Clock size={14} />
                          {formatearFechaHora(cambio.fechaCambio)}
                        </span>
                      </div>
                      <div className={styles.timelineDetalle}>
                        <p>
                          <strong>Estado:</strong>{" "}
                          {cambio.estadoAnterior || "N/A"}{" "}
                          <ArrowRight size={14} className={styles.iconoFlecha} />{" "}
                          {cambio.estadoNuevo}
                        </p>
                        <p>
                          <Users size={14} className={styles.iconoInline} />
                          <strong>Usuario:</strong>{" "}
                          {obtenerNombreUsuario(cambio)}
                        </p>
                        {cambio.observacion && (
                          <p className={styles.observacionHistorial}>
                            <strong>Observación:</strong> {cambio.observacion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReporteContrato;
