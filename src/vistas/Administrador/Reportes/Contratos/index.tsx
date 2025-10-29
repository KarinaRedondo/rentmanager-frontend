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
} from "react-feather";

const ReporteContrato: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reporte, setReporte] = useState<DTOReporteContratoCompleto | null>(null);
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
      const data = await obtenerReporteContrato(Number(id));
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
                  <FileText size={32} />
                  Reporte de Contrato #{reporte.contrato.idContrato}
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

          {/* Información del Contrato */}
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
                <span className={`${styles.badge} ${styles[`estado${reporte.contrato.estado}`]}`}>
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
              <div className={styles.campo}>
                <label>Observaciones:</label>
                <p className={styles.observaciones}>{reporte.contrato.observaciones}</p>
              </div>
            )}
          </div>

          {/* Propiedad */}
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
                  <p>{reporte.propietario.nombre} {reporte.propietario.apellido}</p>
                </div>
                <div className={styles.campo}>
                  <label>Documento:</label>
                  <p>{reporte.propietario.tipoDocumento} {reporte.propietario.numeroDocumento}</p>
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

          {/* Inquilino */}
          {reporte.inquilino && (
            <div className={styles.seccion}>
              <h2>
                <User size={24} />
                Inquilino
              </h2>
              <div className={styles.grid3}>
                <div className={styles.campo}>
                  <label>Nombre:</label>
                  <p>{reporte.inquilino.nombre} {reporte.inquilino.apellido}</p>
                </div>
                <div className={styles.campo}>
                  <label>Documento:</label>
                  <p>{reporte.inquilino.tipoDocumento} {reporte.inquilino.numeroDocumento}</p>
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

          {/* Facturas */}
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
                          <span className={`${styles.badge} ${styles[`estado${factura.estado}`]}`}>
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

          {/* Pagos */}
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
                          <span className={`${styles.badge} ${styles[`estado${pago.estado}`]}`}>
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

          {/* Historial */}
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
                        <span className={`${styles.badge} ${styles[`accion${cambio.tipoAccion}`]}`}>
                          {cambio.tipoAccion}
                        </span>
                        <span className={styles.timelineFecha}>
                          {formatearFecha(cambio.fechaCambio)}
                        </span>
                      </div>
                      <div className={styles.timelineDetalle}>
                        <p>
                          <strong>Estado:</strong> {cambio.estadoAnterior || "N/A"} → {cambio.estadoNuevo}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReporteContrato;
