import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import {
  obtenerReportePropiedad,
  descargarReportePropiedadPDF,
  descargarArchivo,
} from "../../../../servicios/reportes";
import type { DTOReportePropiedadCompleto } from "../../../../modelos/types/Reporte";
import styles from "./ReportePropiedad.module.css";
import {
  FileText,
  Download,
  Home,
  User,
  Clock,
  ArrowLeft,
  MapPin,
  Users,
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowRight,
} from "react-feather";

// ========================================
// PÁGINA REPORTE DE PROPIEDAD MEJORADA
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

const ReportePropiedad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reporte, setReporte] = useState<DTOReportePropiedadCompleto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [descargando, setDescargando] = useState<boolean>(false);
  const [usuarioGenerador, setUsuarioGenerador] = useState<string>("Sistema");

  useEffect(() => {
    if (id) {
      cargarReporte();
    } else {
      setError("ID de propiedad no proporcionado");
      setCargando(false);
    }
  }, [id]);

  // CARGAR REPORTE Y EXTRAER USUARIO GENERADOR
  const cargarReporte = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerReportePropiedad(Number(id));
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

      const blob = await descargarReportePropiedadPDF(Number(id));
      descargarArchivo(blob, `reporte_propiedad_${id}_${Date.now()}.pdf`);

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
      DISPONIBLE: styles.estadoDISPONIBLE,
      OCUPADA: styles.estadoOCUPADA,
      MANTENIMIENTO: styles.estadoMANTENIMIENTO,
      ACTIVO: styles.estadoACTIVO,
      INACTIVO: styles.estadoINACTIVO,
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
              <button className={styles.btnVolver} onClick={() => navigate(-1)}>
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
                  <Home size={32} />
                  Reporte de Propiedad #{reporte.propiedad.idPropiedad}
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

          {/* ===== INFORMACIÓN DE LA PROPIEDAD ===== */}
          <div className={styles.seccion}>
            <h2>
              <Home size={24} />
              Información de la Propiedad
            </h2>
            <div className={styles.grid3}>
              <div className={styles.campo}>
                <label>
                  <MapPin size={16} /> Dirección:
                </label>
                <p>{reporte.propiedad.direccion}</p>
              </div>
              <div className={styles.campo}>
                <label>Ciudad:</label>
                <p>{reporte.propiedad.ciudad}</p>
              </div>
              <div className={styles.campo}>
                <label>Tipo:</label>
                <span className={`${styles.badge} ${styles.badgeInfo}`}>
                  {reporte.propiedad.tipo}
                </span>
              </div>
              <div className={styles.campo}>
                <label>Estado:</label>
                <span
                  className={`${styles.badge} ${obtenerClaseEstado(
                    reporte.propiedad.estado
                  )}`}
                >
                  {reporte.propiedad.estado}
                </span>
              </div>
            </div>

            {reporte.propiedad.serviciosPublicos &&
              reporte.propiedad.serviciosPublicos.length > 0 && (
                <div className={styles.campo} style={{ marginTop: "1.5rem" }}>
                  <label>Servicios Públicos:</label>
                  <div className={styles.serviciosGrid}>
                    {reporte.propiedad.serviciosPublicos.map(
                      (servicio, index) => (
                        <span
                          key={index}
                          className={`${styles.badge} ${styles.badgeServicio}`}
                        >
                          {servicio}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            {reporte.propiedad.descripcion && (
              <div className={styles.campo} style={{ marginTop: "1.5rem" }}>
                <label>Descripción:</label>
                <p className={styles.observaciones}>
                  {reporte.propiedad.descripcion}
                </p>
              </div>
            )}
          </div>

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

          {/* ===== CONTRATOS ===== */}
          {reporte.contratos && reporte.contratos.length > 0 && (
            <div className={styles.seccion}>
              <h2>
                <FileText size={24} />
                Contratos Asociados ({reporte.contratos.length})
              </h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Valor Mensual</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.contratos.map((contrato) => (
                      <tr key={contrato.idContrato}>
                        <td>#{contrato.idContrato}</td>
                        <td>
                          <Calendar size={14} className={styles.iconoInline} />
                          {formatearFecha(contrato.fechaInicio)}
                        </td>
                        <td>
                          <Calendar size={14} className={styles.iconoInline} />
                          {formatearFecha(contrato.fechaFin)}
                        </td>
                        <td className={styles.valorDestacado}>
                          <DollarSign size={14} className={styles.iconoInline} />
                          {formatearMoneda(contrato.valorMensual)}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${obtenerClaseEstado(
                              contrato.estado
                            )}`}
                          >
                            {contrato.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== HISTORIAL CONSOLIDADO ===== */}
          {reporte.historialConsolidado && (
            <>
              {reporte.historialConsolidado.historialPropiedad.length > 0 && (
                <div className={styles.seccion}>
                  <h2>
                    <Clock size={24} />
                    Historial de la Propiedad (
                    {reporte.historialConsolidado.historialPropiedad.length})
                  </h2>
                  <div className={styles.timeline}>
                    {reporte.historialConsolidado.historialPropiedad.map(
                      (cambio) => (
                        <div
                          key={cambio.idHistorial}
                          className={styles.timelineItem}
                        >
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
                                <ArrowRight
                                  size={14}
                                  className={styles.iconoFlecha}
                                />{" "}
                                {cambio.estadoNuevo}
                              </p>
                              <p>
                                <Users size={14} className={styles.iconoInline} />
                                <strong>Usuario:</strong>{" "}
                                {obtenerNombreUsuario(cambio)}
                              </p>
                              {cambio.observacion && (
                                <p className={styles.observacionHistorial}>
                                  <strong>Observación:</strong>{" "}
                                  {cambio.observacion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {reporte.historialConsolidado.historialContratos.length > 0 && (
                <div className={styles.seccion}>
                  <h2>
                    <Clock size={24} />
                    Historial de Contratos (
                    {reporte.historialConsolidado.historialContratos.length})
                  </h2>
                  <div className={styles.timeline}>
                    {reporte.historialConsolidado.historialContratos.map(
                      (cambio) => (
                        <div
                          key={cambio.idHistorial}
                          className={styles.timelineItem}
                        >
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
                                <ArrowRight
                                  size={14}
                                  className={styles.iconoFlecha}
                                />{" "}
                                {cambio.estadoNuevo}
                              </p>
                              <p>
                                <Users size={14} className={styles.iconoInline} />
                                <strong>Usuario:</strong>{" "}
                                {obtenerNombreUsuario(cambio)}
                              </p>
                              {cambio.observacion && (
                                <p className={styles.observacionHistorial}>
                                  <strong>Observación:</strong>{" "}
                                  {cambio.observacion}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportePropiedad;

