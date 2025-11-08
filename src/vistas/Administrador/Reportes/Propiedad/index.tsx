import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "react-feather";

// ========================================
// PÁGINA REPORTE DE PROPIEDAD
// ========================================
//
// Vista completa de reporte detallado de una propiedad con todos sus datos relacionados.
// Incluye propiedad, propietario, contratos, historial de propiedad e historial de contratos.
//
// FUNCIONALIDADES:
// - Visualización completa de reporte de propiedad con todas sus relaciones.
// - Descarga de reporte en formato PDF.
// - Extracción y visualización de usuario que generó el reporte.
// - Timeline dual: Historial de propiedad e historial de contratos consolidado.
// - Tabla de contratos asociados a la propiedad.
// - Visualización de servicios públicos disponibles.
//
// ESTADO:
// - reporte: Objeto completo DTOReportePropiedadCompleto.
// - cargando: Indica si está cargando el reporte.
// - descargando: Indica si está descargando el PDF.
// - error: Mensaje de error si falla la carga.
// - usuarioGenerador: Nombre completo del usuario que generó el reporte.
//
// FUNCIONES PRINCIPALES:
//
// cargarReporte():
// - Obtiene ID de propiedad desde URL params.
// - Llama obtenerReportePropiedad() del servicio de reportes.
// - Extrae usuario generador del DTO desde usuarioGenerador (UsuarioPrincipal en backend).
// - Si no existe usuario en DTO, muestra "Sistema".
//
// descargarPDF():
// - Llama descargarReportePropiedadPDF() para obtener blob.
// - Usa descargarArchivo() para disparar descarga.
// - Nombre de archivo incluye ID y timestamp.
//
// obtenerNombreUsuario():
// - Extrae nombre de usuario del historial con múltiples fallbacks.
// - Prioriza nombreUsuarioResponsable.
// - Fallback a usuarioResponsable, luego ID, luego "Sistema Automático".
// - Filtra valores null, undefined, "[null]", strings vacíos.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearFechaHora(): Convierte ISO a fecha/hora corta.
// - formatearMoneda(): Formatea números a moneda COP.
//
// SECCIONES DEL REPORTE:
//
// Encabezado:
// - Título con ID de propiedad.
// - Fecha de generación y usuario real.
// - Botón volver y botón descargar PDF.
//
// Información de la Propiedad:
// - Grid con: Dirección, ciudad, tipo, estado.
// - Lista de servicios públicos si existe.
// - Descripción detallada si existe.
//
// Propietario:
// - Grid con: Nombre, documento, correo, teléfono.
//
// Contratos Asociados:
// - Tabla con lista de contratos de la propiedad.
// - Columnas: ID, fecha inicio, fecha fin, valor mensual, estado.
// - Contador de contratos en título.
//
// Historial de la Propiedad:
// - Timeline con cambios específicos de la propiedad.
// - Badge de acción, fecha/hora, transición estados, usuario real.
// - Observaciones si existen.
// - Contador de cambios en título.
//
// Historial de Contratos:
// - Timeline con cambios de todos los contratos de la propiedad.
// - Badge de acción, fecha/hora, transición estados, usuario real.
// - Observaciones si existen.
// - Contador de cambios en título.
//
// HISTORIAL CONSOLIDADO:
// - Estructura especial que agrupa dos tipos de historial:
//   1. historialPropiedad: Cambios directos de la propiedad.
//   2. historialContratos: Cambios de contratos asociados.
// - Permite ver evolución completa de propiedad y sus contratos.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Generando reporte...".
// - Error: Icono de alerta, mensaje y botón volver.
// - Badges coloreados: Estados de propiedad y contratos según tipo.
// - Timeline vertical con línea conectora.
// - Servicios públicos en badges pequeños.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 3 columnas para información.
// - Timeline vertical con marcadores y línea.
// - Tabla con scroll horizontal en móviles.
// - Badges con colores semánticos.

const ReportePropiedad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reporte, setReporte] = useState<DTOReportePropiedadCompleto | null>(
    null
  );
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [descargando, setDescargando] = useState<boolean>(false);
  const [usuarioGenerador, setUsuarioGenerador] = useState<string>("Sistema");

  useEffect(() => {
    if (id) {
      cargarReporte();
    }
  }, [id]);

  // CARGAR REPORTE Y EXTRAER USUARIO GENERADOR
  const cargarReporte = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerReportePropiedad(Number(id));
      setReporte(data);

      // OBTENER USUARIO DEL DTO (desde el backend con UsuarioPrincipal)
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
      setError(error.response?.data?.mensaje || "Error al cargar el reporte");
      setUsuarioGenerador("Sistema");
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDescargando(true);
      const blob = await descargarReportePropiedadPDF(Number(id));
      descargarArchivo(blob, `reporte_propiedad_${id}_${Date.now()}.pdf`);
      alert("PDF descargado exitosamente");
    } catch (error: any) {
      console.error("Error descargando PDF:", error);
      alert("Error al descargar el PDF");
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
    if (!valor && valor !== 0) return "N/A";
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
    // 1️ PRIORIDAD: nombreUsuarioResponsable (string con nombre completo)
    if (
      cambio.nombreUsuarioResponsable &&
      typeof cambio.nombreUsuarioResponsable === "string"
    ) {
      const nombre = cambio.nombreUsuarioResponsable.trim();
      if (nombre && nombre !== "[null]" && nombre !== "null") {
        return nombre;
      }
    }

    // 2️ FALLBACK: usuarioResponsable (puede ser string o número)
    if (cambio.usuarioResponsable) {
      if (typeof cambio.usuarioResponsable === "string") {
        const nombre = cambio.usuarioResponsable.trim();
        if (nombre && nombre !== "[null]" && nombre !== "null") {
          return nombre;
        }
      }
    }

    // 3️ ÚLTIMO RECURSO: Si tiene ID pero no nombre, mostrar "Usuario #ID"
    if (cambio.idUsuarioResponsable) {
      return `Usuario #${cambio.idUsuarioResponsable}`;
    }

    // 4️ DEFAULT: Sistema
    return "Sistema Automático";
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
              <AlertCircle size={48} color="red" />
              <h2>Error</h2>
              <p className={styles.error}>{error || "Reporte no encontrado"}</p>
              <button onClick={() => navigate(-1)}>Volver</button>
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
                  className={`${styles.badge} ${
                    styles[`estado${reporte.propiedad.estado}`]
                  }`}
                >
                  {reporte.propiedad.estado}
                </span>
              </div>
            </div>
            {reporte.propiedad.serviciosPublicos &&
              reporte.propiedad.serviciosPublicos.length > 0 && (
                <div className={styles.campo} style={{ marginTop: "1.5rem" }}>
                  <label>Servicios Públicos:</label>
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
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
                        <td>{formatearFecha(contrato.fechaInicio)}</td>
                        <td>{formatearFecha(contrato.fechaFin)}</td>
                        <td className={styles.valorDestacado}>
                          {formatearMoneda(contrato.valorMensual)}
                        </td>
                        <td>
                          <span
                            className={`${styles.badge} ${
                              styles[`estado${contrato.estado}`]
                            }`}
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
                                className={`${styles.badge} ${
                                  styles[`accion${cambio.tipoAccion}`]
                                }`}
                              >
                                {cambio.tipoAccion}
                              </span>
                              <span className={styles.timelineFecha}>
                                {formatearFechaHora(cambio.fechaCambio)}
                              </span>
                            </div>
                            <div className={styles.timelineDetalle}>
                              <p>
                                <strong>Estado:</strong>{" "}
                                {cambio.estadoAnterior || "N/A"} →{" "}
                                {cambio.estadoNuevo}
                              </p>
                              {/* USAR FUNCIÓN CORREGIDA */}
                              <p>
                                <strong>
                                  <Users
                                    size={14}
                                    style={{
                                      display: "inline",
                                      marginRight: "0.5rem",
                                    }}
                                  />
                                  Usuario:
                                </strong>{" "}
                                {obtenerNombreUsuario(cambio)}
                              </p>
                              {cambio.observacion && (
                                <p>
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
                                className={`${styles.badge} ${
                                  styles[`accion${cambio.tipoAccion}`]
                                }`}
                              >
                                {cambio.tipoAccion}
                              </span>
                              <span className={styles.timelineFecha}>
                                {formatearFechaHora(cambio.fechaCambio)}
                              </span>
                            </div>
                            <div className={styles.timelineDetalle}>
                              <p>
                                <strong>Estado:</strong>{" "}
                                {cambio.estadoAnterior || "N/A"} →{" "}
                                {cambio.estadoNuevo}
                              </p>
                              {/* USAR FUNCIÓN CORREGIDA */}
                              <p>
                                <strong>
                                  <Users
                                    size={14}
                                    style={{
                                      display: "inline",
                                      marginRight: "0.5rem",
                                    }}
                                  />
                                  Usuario:
                                </strong>{" "}
                                {obtenerNombreUsuario(cambio)}
                              </p>
                              {cambio.observacion && (
                                <p>
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
