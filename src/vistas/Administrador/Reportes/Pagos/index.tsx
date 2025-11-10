import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import {
  obtenerReportePago,
  descargarReportePagoPDF,
  descargarArchivo,
} from "../../../../servicios/reportes";
import {
  Download,
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  User,
  Clock,
  Users,
  AlertCircle,
  CreditCard,
  Home,
  ArrowRight,
} from "react-feather";
import styles from "./ReportePago.module.css";
import type { DTOReportePagoCompleto } from "../../../../modelos/types/Reporte";

// ========================================
// PÁGINA REPORTE DE PAGO MEJORADA
// ========================================
//
// MEJORAS IMPLEMENTADAS:
// - SweetAlert2 para alertas modernas
// - Sin emojis (preferencia del usuario)
// - Loading durante descarga de PDF
// - Mejor manejo de errores
// - Feedback visual mejorado
// - Iconos consistentes de Feather
// - Badges dinámicos por estado y acción

const ReportePago: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState<DTOReportePagoCompleto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState("");
  const [usuarioGenerador, setUsuarioGenerador] = useState<string>("Sistema");

  useEffect(() => {
    if (id) {
      cargarReporte();
    } else {
      setError("ID de pago no proporcionado");
      setCargando(false);
    }
  }, [id]);

  // CARGAR REPORTE Y EXTRAER USUARIO GENERADOR
  const cargarReporte = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerReportePago(Number(id));
      console.log("Reporte cargado:", data);
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
        error.response?.data?.message ||
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
      console.log("Iniciando descarga de PDF para pago:", id);

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

      const blob = await descargarReportePagoPDF(Number(id));
      console.log("Blob recibido:", blob);

      descargarArchivo(blob, `reporte_pago_${id}_${Date.now()}.pdf`);

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
        text:
          error.response?.data?.message ||
          error.message ||
          "Error al descargar el PDF",
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
      return new Date(fecha).toLocaleString("es-CO", {
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

  // OBTENER NOMBRE DE USUARIO DEL HISTORIAL
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
      COMPLETADO: styles.estadoCOMPLETADO,
      RECHAZADO: styles.estadoRECHAZADO,
      CANCELADO: styles.estadoCANCELADO,
      CONFIRMADO: styles.estadoCONFIRMADO,
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
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando reporte de pago...</p>
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
          <div className={styles.errorContenedor}>
            <AlertCircle size={48} color="#dc3545" />
            <h2>Error</h2>
            <p className={styles.error}>
              {error || "No se pudo cargar el reporte"}
            </p>
            <button onClick={() => navigate(-1)} className={styles.btnVolver}>
              <ArrowLeft size={18} />
              Volver
            </button>
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
                  Reporte de Pago #{reporte.pago.idPago}
                </h1>
                <p className={styles.subtitulo}>
                  <Calendar size={14} />
                  Generado el {formatearFecha(reporte.fechaGeneracion)} por{" "}
                  <strong>{usuarioGenerador}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={descargarPDF}
              className={styles.btnDescargar}
              disabled={descargando}
            >
              <Download size={20} />
              {descargando ? "Descargando..." : "Descargar PDF"}
            </button>
          </div>

          {/* ===== INFORMACIÓN DEL PAGO ===== */}
          <section className={styles.seccion}>
            <h2>
              <DollarSign size={24} />
              Información del Pago
            </h2>
            <div className={styles.grid}>
              <div className={styles.campo}>
                <label>ID Pago:</label>
                <p className={styles.destacado}>#{reporte.pago.idPago}</p>
              </div>
              <div className={styles.campo}>
                <label>
                  <Calendar size={16} />
                  Fecha:
                </label>
                <p>{formatearFecha(reporte.pago.fecha)}</p>
              </div>
              <div className={styles.campo}>
                <label>
                  <DollarSign size={16} />
                  Monto:
                </label>
                <p className={styles.monto}>
                  {formatearMoneda(reporte.pago.monto)}
                </p>
              </div>
              <div className={styles.campo}>
                <label>
                  <CreditCard size={16} />
                  Método de Pago:
                </label>
                <p>{reporte.pago.metodoPago}</p>
              </div>
              <div className={styles.campo}>
                <label>Estado:</label>
                <span
                  className={`${styles.badge} ${obtenerClaseEstado(
                    reporte.pago.estado
                  )}`}
                >
                  {reporte.pago.estado}
                </span>
              </div>
              {reporte.pago.referenciaTransaccion && (
                <div className={styles.campo}>
                  <label>Referencia:</label>
                  <p>{reporte.pago.referenciaTransaccion}</p>
                </div>
              )}
              {reporte.pago.bancoOrigen && (
                <div className={styles.campo}>
                  <label>Banco Origen:</label>
                  <p>{reporte.pago.bancoOrigen}</p>
                </div>
              )}
              {reporte.pago.bancoDestino && (
                <div className={styles.campo}>
                  <label>Banco Destino:</label>
                  <p>{reporte.pago.bancoDestino}</p>
                </div>
              )}
            </div>
          </section>

          {/* ===== INFORMACIÓN DE LA FACTURA ===== */}
          {reporte.factura && (
            <section className={styles.seccion}>
              <h2>
                <FileText size={24} />
                Factura Asociada
              </h2>
              <div className={styles.grid}>
                <div className={styles.campo}>
                  <label>ID Factura:</label>
                  <p>#{reporte.factura.idFactura}</p>
                </div>
                <div className={styles.campo}>
                  <label>
                    <Calendar size={16} />
                    Fecha Emisión:
                  </label>
                  <p>{formatearFecha(reporte.factura.fechaEmision)}</p>
                </div>
                <div className={styles.campo}>
                  <label>
                    <Calendar size={16} />
                    Fecha Vencimiento:
                  </label>
                  <p>{formatearFecha(reporte.factura.fechaVencimiento)}</p>
                </div>
                <div className={styles.campo}>
                  <label>
                    <DollarSign size={16} />
                    Total:
                  </label>
                  <p className={styles.monto}>
                    {formatearMoneda(reporte.factura.total)}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Estado:</label>
                  <span
                    className={`${styles.badge} ${obtenerClaseEstado(
                      reporte.factura.estado
                    )}`}
                  >
                    {reporte.factura.estado}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ===== INFORMACIÓN DEL CONTRATO ===== */}
          {reporte.contrato && (
            <section className={styles.seccion}>
              <h2>
                <FileText size={24} />
                Contrato
              </h2>
              <div className={styles.grid}>
                <div className={styles.campo}>
                  <label>ID Contrato:</label>
                  <p>#{reporte.contrato.idContrato}</p>
                </div>
                <div className={styles.campo}>
                  <label>
                    <Calendar size={16} />
                    Periodo:
                  </label>
                  <p>
                    {formatearFecha(reporte.contrato.fechaInicio)} -{" "}
                    {formatearFecha(reporte.contrato.fechaFin)}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>
                    <DollarSign size={16} />
                    Valor Mensual:
                  </label>
                  <p className={styles.monto}>
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
              </div>
            </section>
          )}

          {/* ===== INFORMACIÓN DE LA PROPIEDAD ===== */}
          {reporte.propiedad && (
            <section className={styles.seccion}>
              <h2>
                <Home size={24} />
                Propiedad
              </h2>
              <div className={styles.grid}>
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
              </div>
            </section>
          )}

          {/* ===== INFORMACIÓN DEL INQUILINO ===== */}
          {reporte.inquilino && (
            <section className={styles.seccion}>
              <h2>
                <User size={24} />
                Inquilino
              </h2>
              <div className={styles.grid}>
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
            </section>
          )}

          {/* ===== HISTORIAL DE CAMBIOS ===== */}
          {reporte.historialCambios && reporte.historialCambios.length > 0 && (
            <section className={styles.seccion}>
              <h2>
                <Clock size={24} />
                Historial de Cambios ({reporte.historialCambios.length})
              </h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Acción</th>
                      <th>Estado Anterior</th>
                      <th>Estado Nuevo</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.historialCambios.map((cambio) => (
                      <tr key={cambio.idHistorial}>
                        <td>
                          <Clock size={14} className={styles.iconoInline} />
                          {formatearFechaHora(cambio.fechaCambio)}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${obtenerClaseAccion(
                              cambio.tipoAccion
                            )}`}
                          >
                            {cambio.tipoAccion}
                          </span>
                        </td>
                        <td>{cambio.estadoAnterior || "-"}</td>
                        <td>
                          {cambio.estadoAnterior && (
                            <ArrowRight size={14} className={styles.iconoFlecha} />
                          )}
                          {cambio.estadoNuevo}
                        </td>
                        <td>
                          <Users size={14} className={styles.iconoInline} />
                          {obtenerNombreUsuario(cambio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportePago;
