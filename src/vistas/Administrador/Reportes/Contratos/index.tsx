import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "react-feather";

// ========================================
// PÁGINA REPORTE DE CONTRATO
// ========================================
//
// Vista completa de reporte detallado de un contrato específico con todos sus datos relacionados.
// Incluye información de contrato, propiedad, propietario, inquilino, facturas, pagos e historial de cambios.
//
// FUNCIONALIDADES:
// - Visualización completa de reporte de contrato con todas sus relaciones.
// - Descarga de reporte en formato PDF.
// - Extracción y visualización de usuario que generó el reporte.
// - Timeline de historial de cambios con usuario responsable real.
// - Tablas de facturas y pagos asociados al contrato.
//
// ESTADO:
// - reporte: Objeto completo DTOReporteContratoCompleto con todos los datos.
// - cargando: Indica si está cargando el reporte.
// - error: Mensaje de error si falla la carga.
// - descargando: Indica si está descargando el PDF.
// - usuarioGenerador: Nombre completo del usuario que generó el reporte.
//
// FUNCIONES PRINCIPALES:
//
// cargarReporte():
// - Obtiene ID de contrato desde URL params.
// - Llama obtenerReporteContrato() del servicio de reportes.
// - Extrae usuario generador del DTO (nombre + apellido).
// - Si no existe usuario en DTO, muestra "Sistema".
// - Maneja errores mostrando mensaje al usuario.
//
// descargarPDF():
// - Llama descargarReporteContratoPDF() para obtener blob.
// - Usa descargarArchivo() para disparar descarga en navegador.
// - Nombre de archivo incluye ID de contrato y timestamp.
// - Muestra indicador de descarga en progreso.
//
// obtenerNombreUsuario():
// - Función robusta para extraer nombre de usuario del historial.
// - Prioriza nombreUsuarioResponsable si existe y es válido.
// - Fallback a usuarioResponsable si es string válido.
// - Fallback a "Usuario #ID" si solo hay ID.
// - Fallback final a "Sistema Automático".
// - Filtra valores null, undefined, "[null]", strings vacíos.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO string a formato largo español.
// - formatearFechaHora(): Convierte ISO string a fecha/hora corta.
// - formatearMoneda(): Formatea números a moneda colombiana (COP).
//
// SECCIONES DEL REPORTE:
//
// Encabezado:
// - Título con ID de contrato.
// - Fecha de generación y usuario real que generó el reporte.
// - Botón volver y botón descargar PDF.
//
// Información del Contrato:
// - Grid con datos principales: Fechas, valor, estado, tipo, forma de pago.
// - Campo observaciones si existe.
//
// Propiedad Arrendada:
// - Grid con datos de propiedad: Dirección, ciudad, tipo, área, habitaciones, baños.
//
// Propietario:
// - Grid con datos personales: Nombre, documento, correo, teléfono.
//
// Inquilino:
// - Grid con datos personales: Nombre, documento, correo, teléfono.
//
// Facturas Generadas:
// - Tabla con lista de facturas asociadas al contrato.
// - Columnas: ID, emisión, vencimiento, total, estado.
// - Contador de facturas en título.
//
// Pagos Realizados:
// - Tabla con lista de pagos asociados a facturas del contrato.
// - Columnas: ID, fecha, monto, método, estado.
// - Contador de pagos en título.
//
// Historial de Cambios:
// - Timeline vertical con todos los cambios de estado.
// - Para cada cambio: Badge de acción, fecha/hora, transición de estados, usuario real.
// - Observaciones si existen.
// - Marcador visual conectando items.
// - Contador de cambios en título.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Generando reporte...".
// - Error: Icono de alerta, mensaje de error y botón volver.
// - Badges coloreados: Estados de contrato, facturas, pagos según tipo.
//
// MEJORA CLAVE:
// - Función obtenerNombreUsuario() con múltiples fallbacks robustos.
// - Priorización de nombreUsuarioResponsable sobre otros campos.
// - Validación exhaustiva de valores nulos y strings vacíos.
// - Garantiza que siempre se muestre un nombre útil.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para secciones de información.
// - Timeline vertical con línea conectora y marcadores.
// - Tablas con scroll horizontal en móviles.
// - Badges con colores semánticos.

const ReporteContrato: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reporte, setReporte] = useState<DTOReporteContratoCompleto | null>(
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
      setError(error.response?.data?.mensaje || "Error al cargar el reporte");
      setUsuarioGenerador("Sistema");
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDescargando(true);
      const blob = await descargarReporteContratoPDF(Number(id));
      descargarArchivo(blob, `reporte_contrato_${id}_${Date.now()}.pdf`);
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
                  <FileText size={32} />
                  Reporte de Contrato #{reporte.contrato.idContrato}
                </h1>
                {/* MOSTRAR USUARIO REAL */}
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

          {/* ===== INFORMACIÓN DEL CONTRATO ===== */}
          <div className={styles.seccion}>
            <h2>
              <FileText size={24} />
              Información del Contrato
            </h2>
            <div className={styles.grid2}>
              <div className={styles.campo}>
                <label>Fecha Inicio:</label>
                <p>{formatearFecha(reporte.contrato.fechaInicio)}</p>
              </div>
              <div className={styles.campo}>
                <label>Fecha Fin:</label>
                <p>{formatearFecha(reporte.contrato.fechaFin)}</p>
              </div>
              <div className={styles.campo}>
                <label>Valor Mensual:</label>
                <p className={styles.valorDestacado}>
                  {formatearMoneda(reporte.contrato.valorMensual)}
                </p>
              </div>
              <div className={styles.campo}>
                <label>Estado:</label>
                <span
                  className={`${styles.badge} ${
                    styles[`estado${reporte.contrato.estado}`]
                  }`}
                >
                  {reporte.contrato.estado}
                </span>
              </div>
              <div className={styles.campo}>
                <label>Tipo Contrato:</label>
                <p>{reporte.contrato.tipoContrato}</p>
              </div>
              <div className={styles.campo}>
                <label>Forma de Pago:</label>
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
                <User size={24} />
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
                            className={`${styles.badge} ${
                              styles[`estado${factura.estado}`]
                            }`}
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
                            className={`${styles.badge} ${
                              styles[`estado${pago.estado}`]
                            }`}
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
