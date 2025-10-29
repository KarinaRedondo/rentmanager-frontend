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
import styles from "./ReportePropiedad.module.css"; // Usa los mismos estilos
import {
  FileText,
  Download,
  Home,
  User,
  Clock,
  ArrowLeft,
  MapPin,
} from "react-feather";

const ReportePropiedad: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reporte, setReporte] = useState<DTOReportePropiedadCompleto | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [descargando, setDescargando] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      cargarReporte();
    }
  }, [id]);

  const cargarReporte = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerReportePropiedad(Number(id));
      setReporte(data);
    } catch (error: any) {
      console.error("Error cargando reporte:", error);
      setError(error.response?.data?.mensaje || "Error al cargar el reporte");
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
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
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
              <FileText size={48} />
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
          {/* Encabezado */}
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
                  Generado el {formatearFecha(reporte.fechaGeneracion)}
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

          {/* Información de la Propiedad */}
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
                <span className={`${styles.badge} ${styles[`estado${reporte.propiedad.estado}`]}`}>
                  {reporte.propiedad.estado}
                </span>
              </div>
            </div>
            {reporte.propiedad.serviciosPublicos && reporte.propiedad.serviciosPublicos.length > 0 && (
              <div className={styles.campo} style={{ marginTop: "1.5rem" }}>
                <label>Servicios Públicos:</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {reporte.propiedad.serviciosPublicos.map((servicio, index) => (
                    <span key={index} className={`${styles.badge} ${styles.badgeServicio}`}>
                      {servicio}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reporte.propiedad.descripcion && (
              <div className={styles.campo} style={{ marginTop: "1.5rem" }}>
                <label>Descripción:</label>
                <p className={styles.observaciones}>{reporte.propiedad.descripcion}</p>
              </div>
            )}
          </div>

          {/* Propietario */}
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
                    {reporte.propietario.tipoDocumento} {reporte.propietario.numeroDocumento}
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

          {/* Contratos */}
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
                          <span className={`${styles.badge} ${styles[`estado${contrato.estado}`]}`}>
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

          {/* Historial Consolidado */}
          {reporte.historialConsolidado && (
            <>
              {reporte.historialConsolidado.historialPropiedad.length > 0 && (
                <div className={styles.seccion}>
                  <h2>
                    <Clock size={24} />
                    Historial de la Propiedad ({reporte.historialConsolidado.historialPropiedad.length})
                  </h2>
                  <div className={styles.timeline}>
                    {reporte.historialConsolidado.historialPropiedad.map((cambio) => (
                      <div key={cambio.idHistorial} className={styles.timelineItem}>
                        <div className={styles.timelineMarker}></div>
                        <div className={styles.timelineContenido}>
                          <div className={styles.timelineEncabezado}>
                            <span className={`${styles.badge} ${styles[`accion${cambio.tipoAccion}`]}`}>
                              {cambio.tipoAccion}
                            </span>
                            <span className={styles.timelineFecha}>
                              {formatearFecha(cambio.fechaCambio)}
                            </span>
                          </div>
                          <div className={styles.timelineDetalle}>
                            <p>
                              <strong>Estado:</strong> {cambio.estadoAnterior || "N/A"} →{" "}
                              {cambio.estadoNuevo}
                            </p>
                            {cambio.usuarioResponsable && (
                              <p>
                                <strong>Usuario:</strong> {cambio.usuarioResponsable}
                              </p>
                            )}
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

              {reporte.historialConsolidado.historialContratos.length > 0 && (
                <div className={styles.seccion}>
                  <h2>
                    <Clock size={24} />
                    Historial de Contratos ({reporte.historialConsolidado.historialContratos.length})
                  </h2>
                  <div className={styles.timeline}>
                    {reporte.historialConsolidado.historialContratos.map((cambio) => (
                      <div key={cambio.idHistorial} className={styles.timelineItem}>
                        <div className={styles.timelineMarker}></div>
                        <div className={styles.timelineContenido}>
                          <div className={styles.timelineEncabezado}>
                            <span className={`${styles.badge} ${styles[`accion${cambio.tipoAccion}`]}`}>
                              {cambio.tipoAccion}
                            </span>
                            <span className={styles.timelineFecha}>
                              {formatearFecha(cambio.fechaCambio)}
                            </span>
                          </div>
                          <div className={styles.timelineDetalle}>
                            <p>
                              <strong>Estado:</strong> {cambio.estadoAnterior || "N/A"} →{" "}
                              {cambio.estadoNuevo}
                            </p>
                            {cambio.usuarioResponsable && (
                              <p>
                                <strong>Usuario:</strong> {cambio.usuarioResponsable}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
