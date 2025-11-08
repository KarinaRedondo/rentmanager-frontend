import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import {
  obtenerReporteFactura,
  descargarReporteFacturaPDF,
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
import styles from "./ReporteFactura.module.css";
import type { DTOReporteFacturaCompleto } from "../../../../modelos/types/Reporte";

// ========================================
// PÁGINA REPORTE DE FACTURA
// ========================================
//
// Vista completa de reporte detallado de una factura específica con datos relacionados.
// Incluye factura, contrato, propiedad, inquilino, propietario, pagos e historial de cambios.
//
// FUNCIONALIDADES:
// - Visualización completa de reporte de factura con todas sus relaciones.
// - Descarga de reporte en formato PDF.
// - Extracción y visualización de usuario que generó el reporte.
// - Tabla de historial de cambios con usuario responsable real.
// - Tabla de pagos asociados con resumen de totales.
// - Cálculo automático de saldo pendiente.
//
// ESTADO:
// - reporte: Objeto completo DTOReporteFacturaCompleto.
// - cargando: Indica si está cargando el reporte o descargando PDF.
// - error: Mensaje de error si falla la carga.
// - usuarioGenerador: Nombre completo del usuario que generó el reporte.
//
// FUNCIONES PRINCIPALES:
//
// cargarReporte():
// - Obtiene ID de factura desde URL params.
// - Llama obtenerReporteFactura() del servicio de reportes.
// - Extrae usuario generador del DTO (nombre + apellido).
// - Si no existe usuario en DTO, muestra "Sistema".
//
// descargarPDF():
// - Llama descargarReporteFacturaPDF() para obtener blob.
// - Usa descargarArchivo() para disparar descarga.
// - Nombre de archivo incluye ID y timestamp.
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
// - Título con ID de factura.
// - Fecha de generación y usuario real.
// - Botones: Descargar PDF y Volver.
//
// Información de la Factura:
// - Grid con: ID, fecha emisión, fecha vencimiento, total, estado.
//
// Contrato Asociado:
// - Grid con: ID, periodo, valor mensual, tipo, forma de pago, estado.
//
// Propiedad:
// - Grid con: Dirección, ciudad, tipo, estado, área, habitaciones.
//
// Inquilino:
// - Grid con: Nombre, documento, correo, teléfono.
//
// Propietario:
// - Grid con: Nombre, documento, correo, teléfono.
//
// Pagos Realizados:
// - Tabla con: ID, fecha, monto, método, estado, referencia.
// - Contador de pagos en título.
// - Resumen: Total pagado y saldo pendiente calculado.
//
// Historial de Cambios:
// - Tabla con: Fecha/hora, acción, estado anterior, estado nuevo, usuario, observación.
// - Contador de cambios en título.
// - Función obtenerNombreUsuario() para mostrar usuario real.
//
// CÁLCULOS:
// - Total Pagado: Suma de montos de todos los pagos asociados.
// - Saldo Pendiente: Total factura - Total pagado (mínimo 0).
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje.
// - Error: Icono de alerta, mensaje y botón volver.
// - Badges coloreados: Estados de factura, pagos según tipo.
// - Montos destacados con clase CSS específica.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para información.
// - Tablas con scroll horizontal en móviles.
// - Resumen de pagos en cards destacadas.

const ReporteFactura: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState<DTOReporteFacturaCompleto | null>(
    null
  );
  const [cargando, setCargando] = useState(true);
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
      const data = await obtenerReporteFactura(Number(id));
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
      setError(
        error.response?.data?.mensaje || "Error al cargar el reporte de factura"
      );
      setUsuarioGenerador("Sistema");
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setCargando(true);
      const blob = await descargarReporteFacturaPDF(Number(id));
      descargarArchivo(blob, `reporte_factura_${id}_${Date.now()}.pdf`);
      alert("PDF descargado exitosamente");
    } catch (error: any) {
      console.error("Error descargando PDF:", error);
      alert("Error al descargar el PDF");
    } finally {
      setCargando(false);
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
            <p>Cargando reporte de factura...</p>
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
                Reporte de Factura #{reporte.factura.idFactura}
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
                disabled={cargando}
              >
                <Download size={20} />
                {cargando ? "Descargando..." : "Descargar PDF"}
              </button>
              <button onClick={() => navigate(-1)} className={styles.btnVolver}>
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>
          </div>

          {/* ===== INFORMACIÓN DE LA FACTURA ===== */}
          <section className={styles.seccion}>
            <h2>
              <FileText size={24} />
              Información de la Factura
            </h2>
            <div className={styles.grid}>
              <div className={styles.campo}>
                <label>ID Factura:</label>
                <p className={styles.destacado}>#{reporte.factura.idFactura}</p>
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
                <p
                  className={`${styles.badge} ${
                    styles[`estado${reporte.factura.estado}`]
                  }`}
                >
                  {reporte.factura.estado}
                </p>
              </div>
            </div>
          </section>

          {/* ===== INFORMACIÓN DEL CONTRATO ===== */}
          {reporte.contrato && (
            <section className={styles.seccion}>
              <h2>📄 Contrato Asociado</h2>
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
                  <label>Tipo:</label>
                  <p>{reporte.contrato.tipoContrato}</p>
                </div>
                <div className={styles.campo}>
                  <label>Forma de Pago:</label>
                  <p>{reporte.contrato.formaPago}</p>
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
                <div className={styles.campo}>
                  <label>Estado:</label>
                  <p className={styles.badge}>{reporte.propiedad.estado}</p>
                </div>
                <div className={styles.campo}>
                  <label>Área:</label>
                  <p>{reporte.propiedad.area} m²</p>
                </div>
                <div className={styles.campo}>
                  <label>Habitaciones:</label>
                  <p>{reporte.propiedad.habitaciones}</p>
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
                  <label>Nombre Completo:</label>
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

          {/* ===== INFORMACIÓN DEL PROPIETARIO ===== */}
          {reporte.propietario && (
            <section className={styles.seccion}>
              <h2>
                <User size={24} />
                Propietario
              </h2>
              <div className={styles.grid}>
                <div className={styles.campo}>
                  <label>Nombre Completo:</label>
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
            </section>
          )}

          {/* ===== PAGOS ASOCIADOS ===== */}
          {reporte.pagosAsociados && reporte.pagosAsociados.length > 0 && (
            <section className={styles.seccion}>
              <h2>Pagos Realizados ({reporte.pagosAsociados.length})</h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Método</th>
                      <th>Estado</th>
                      <th>Referencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.pagosAsociados.map((pago) => (
                      <tr key={pago.idPago}>
                        <td>#{pago.idPago}</td>
                        <td>{formatearFecha(pago.fecha)}</td>
                        <td className={styles.monto}>
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
                        <td>{pago.referenciaTransaccion || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RESUMEN DE PAGOS CORREGIDO */}
              <div className={styles.resumenPagos}>
                <div className={styles.resumenItem}>
                  <label>Total Pagado:</label>
                  <p className={styles.montoTotal}>
                    {formatearMoneda(
                      reporte.pagosAsociados.reduce(
                        (sum, p) => sum + p.monto,
                        0
                      )
                    )}
                  </p>
                </div>
                <div className={styles.resumenItem}>
                  <label>Saldo Pendiente:</label>
                  <p className={styles.montoPendiente}>
                    {formatearMoneda(
                      Math.max(
                        0,
                        reporte.factura.total -
                          reporte.pagosAsociados.reduce(
                            (sum, p) => sum + p.monto,
                            0
                          )
                      )
                    )}
                  </p>
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
                      <th>Observación</th>
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
                        <td className={styles.observacion}>
                          {cambio.observacion || "-"}
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

export default ReporteFactura;
