import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "react-feather";
import styles from "./ReportePago.module.css";
import type { DTOReportePagoCompleto } from "../../../../modelos/types/Reporte";

// ========================================
// PÁGINA REPORTE DE PAGO
// ========================================
//
// Vista completa de reporte detallado de un pago específico con datos relacionados.
// Incluye pago, factura, contrato, propiedad, inquilino e historial de cambios.
//
// FUNCIONALIDADES:
// - Visualización completa de reporte de pago con todas sus relaciones.
// - Descarga de reporte en formato PDF.
// - Extracción y visualización de usuario que generó el reporte.
// - Tabla de historial de cambios con usuario responsable real.
// - Información detallada de transacción bancaria si existe.
//
// ESTADO:
// - reporte: Objeto completo DTOReportePagoCompleto.
// - cargando: Indica si está cargando el reporte.
// - descargando: Indica si está descargando el PDF.
// - error: Mensaje de error si falla la carga.
// - usuarioGenerador: Nombre completo del usuario que generó el reporte.
//
// FUNCIONES PRINCIPALES:
//
// cargarReporte():
// - Obtiene ID de pago desde URL params.
// - Llama obtenerReportePago() del servicio de reportes.
// - Extrae usuario generador del DTO (nombre + apellido).
// - Si no existe usuario en DTO, muestra "Sistema".
//
// descargarPDF():
// - Llama descargarReportePagoPDF() para obtener blob.
// - Usa descargarArchivo() para disparar descarga.
// - Nombre de archivo incluye ID y timestamp.
// - Logging para debugging de descarga.
//
// obtenerNombreUsuario():
// - Extrae nombre de usuario del historial con múltiples fallbacks.
// - Prioriza nombreUsuarioResponsable.
// - Fallback a usuarioResponsable, luego ID, luego "Sistema Automático".
// - Filtra valores null y strings vacíos.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearFechaHora(): Convierte ISO a fecha/hora corta.
// - formatearMoneda(): Formatea números a moneda COP.
//
// SECCIONES DEL REPORTE:
//
// Encabezado:
// - Título con ID de pago.
// - Fecha de generación y usuario real.
// - Botones: Descargar PDF y Volver.
//
// Información del Pago:
// - Grid con: ID, fecha, monto, método, estado.
// - Campos opcionales: Referencia, banco origen, banco destino.
//
// Factura Asociada:
// - Grid con: ID, fecha emisión, fecha vencimiento, total, estado.
//
// Contrato:
// - Grid con: ID, periodo, valor mensual, estado.
//
// Propiedad:
// - Grid con: Dirección, ciudad, tipo.
//
// Inquilino:
// - Grid con: Nombre, documento, correo, teléfono.
//
// Historial de Cambios:
// - Tabla con: Fecha/hora, acción, estado anterior, estado nuevo, usuario.
// - Contador de cambios en título.
// - Función obtenerNombreUsuario() para mostrar usuario real.
//
// CAMPOS CONDICIONALES:
// - Referencia de transacción solo se muestra si existe.
// - Banco origen solo se muestra si existe.
// - Banco destino solo se muestra si existe.
// - Todas las secciones relacionadas (factura, contrato, etc) solo si existen.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje.
// - Error: Icono de alerta, mensaje y botón volver.
// - Descargando: Botón deshabilitado con texto "Descargando...".
// - Badges coloreados: Estados de pago según tipo.
// - Montos destacados con clase CSS específica.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para información.
// - Tabla con scroll horizontal en móviles.
// - Campos opcionales se ocultan si no hay datos.

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
      setError(error.response?.data?.message || "Error al cargar el reporte");
      setUsuarioGenerador("Sistema");
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDescargando(true);
      console.log("Iniciando descarga de PDF para pago:", id);

      const blob = await descargarReportePagoPDF(Number(id));
      console.log("Blob recibido:", blob);

      descargarArchivo(blob, `reporte_pago_${id}_${Date.now()}.pdf`);
      alert("PDF descargado exitosamente");
    } catch (error: any) {
      console.error("Error descargando PDF:", error);
      alert(
        "Error al descargar el PDF: " +
          (error.response?.data?.message || error.message)
      );
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
          <div className={styles.error}>
            <AlertCircle size={48} color="red" />
            <h2>Error</h2>
            <p>{error || "No se pudo cargar el reporte"}</p>
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
            <div>
              <h1>
                <FileText size={32} />
                Reporte de Pago #{reporte.pago.idPago}
              </h1>
              {/* MOSTRAR USUARIO REAL */}
              <p className={styles.fecha}>
                Generado el {formatearFecha(reporte.fechaGeneracion)} por{" "}
                <strong>{usuarioGenerador}</strong>
              </p>
            </div>
            <div className={styles.botones}>
              <button
                onClick={descargarPDF}
                className={styles.btnDescargar}
                disabled={descargando}
              >
                <Download size={20} />
                {descargando ? "Descargando..." : "Descargar PDF"}
              </button>
              <button onClick={() => navigate(-1)} className={styles.btnVolver}>
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>
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
                <label>Monto:</label>
                <p className={styles.monto}>
                  {formatearMoneda(reporte.pago.monto)}
                </p>
              </div>
              <div className={styles.campo}>
                <label>Método de Pago:</label>
                <p>{reporte.pago.metodoPago}</p>
              </div>
              <div className={styles.campo}>
                <label>Estado:</label>
                <p
                  className={`${styles.badge} ${
                    styles[`estado${reporte.pago.estado}`]
                  }`}
                >
                  {reporte.pago.estado}
                </p>
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
              <h2>🧾 Factura Asociada</h2>
              <div className={styles.grid}>
                <div className={styles.campo}>
                  <label>ID Factura:</label>
                  <p>#{reporte.factura.idFactura}</p>
                </div>
                <div className={styles.campo}>
                  <label>Fecha Emisión:</label>
                  <p>{formatearFecha(reporte.factura.fechaEmision)}</p>
                </div>
                <div className={styles.campo}>
                  <label>Fecha Vencimiento:</label>
                  <p>{formatearFecha(reporte.factura.fechaVencimiento)}</p>
                </div>
                <div className={styles.campo}>
                  <label>Total:</label>
                  <p className={styles.monto}>
                    {formatearMoneda(reporte.factura.total)}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Estado:</label>
                  <p className={styles.badge}>{reporte.factura.estado}</p>
                </div>
              </div>
            </section>
          )}

          {/* ===== INFORMACIÓN DEL CONTRATO ===== */}
          {reporte.contrato && (
            <section className={styles.seccion}>
              <h2>📄 Contrato</h2>
              <div className={styles.grid}>
                <div className={styles.campo}>
                  <label>ID Contrato:</label>
                  <p>#{reporte.contrato.idContrato}</p>
                </div>
                <div className={styles.campo}>
                  <label>Periodo:</label>
                  <p>
                    {formatearFecha(reporte.contrato.fechaInicio)} -{" "}
                    {formatearFecha(reporte.contrato.fechaFin)}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Valor Mensual:</label>
                  <p className={styles.monto}>
                    {formatearMoneda(reporte.contrato.valorMensual)}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Estado:</label>
                  <p className={styles.badge}>{reporte.contrato.estado}</p>
                </div>
              </div>
            </section>
          )}

          {/* ===== INFORMACIÓN DE LA PROPIEDAD ===== */}
          {reporte.propiedad && (
            <section className={styles.seccion}>
              <h2>Propiedad</h2>
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
                        <td>{formatearFechaHora(cambio.fechaCambio)}</td>
                        <td>
                          <span className={styles.badgeAccion}>
                            {cambio.tipoAccion}
                          </span>
                        </td>
                        <td>{cambio.estadoAnterior || "-"}</td>
                        <td>{cambio.estadoNuevo}</td>
                        {/* USAR FUNCIÓN CORREGIDA */}
                        <td>
                          <Users
                            size={14}
                            style={{ display: "inline", marginRight: "0.3rem" }}
                          />
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
