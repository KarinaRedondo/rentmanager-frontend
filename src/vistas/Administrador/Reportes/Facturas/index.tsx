import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../../componentes/Header';
import Footer from '../../../../componentes/Footer';
import { obtenerReporteFactura, descargarReporteFacturaPDF, descargarArchivo } from '../../../../servicios/reportes';
import { Download, ArrowLeft, FileText, DollarSign, Calendar, User } from 'react-feather';
import styles from './ReporteFactura.module.css';
import type { DTOReporteFacturaCompleto } from '../../../../modelos/types/Reporte';

const ReporteFactura: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState<DTOReporteFacturaCompleto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReporte();
  }, [id]);

  const cargarReporte = async () => {
    try {
      setCargando(true);
      const data = await obtenerReporteFactura(Number(id));
      setReporte(data);
    } catch (error) {
      console.error('Error cargando reporte:', error);
      setError('Error al cargar el reporte de factura');
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setCargando(true);
      const blob = await descargarReporteFacturaPDF(Number(id));
      descargarArchivo(blob, `reporte_factura_${id}_${Date.now()}.pdf`);
      alert('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF');
    } finally {
      setCargando(false);
    }
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
            <FileText size={48} />
            <h2>Error</h2>
            <p>{error || 'No se pudo cargar el reporte'}</p>
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
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <div>
              <h1>
                <FileText size={32} />
                Reporte de Factura #{reporte.factura.idFactura}
              </h1>
              <p className={styles.fecha}>
                Generado el: {new Date(reporte.fechaGeneracion).toLocaleString('es-CO')}
              </p>
            </div>
            <div className={styles.botones}>
              <button onClick={descargarPDF} className={styles.btnDescargar}>
                <Download size={20} />
                Descargar PDF
              </button>
              <button onClick={() => navigate(-1)} className={styles.btnVolver}>
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>
          </div>

          {/* Información de la Factura */}
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
                <p>{new Date(reporte.factura.fechaEmision).toLocaleDateString('es-CO')}</p>
              </div>
              <div className={styles.campo}>
                <label>
                  <Calendar size={16} />
                  Fecha Vencimiento:
                </label>
                <p>{new Date(reporte.factura.fechaVencimiento).toLocaleDateString('es-CO')}</p>
              </div>
              <div className={styles.campo}>
                <label>
                  <DollarSign size={16} />
                  Total:
                </label>
                <p className={styles.monto}>${reporte.factura.total.toLocaleString('es-CO')}</p>
              </div>
              <div className={styles.campo}>
                <label>Estado:</label>
                <p className={`${styles.badge} ${styles[`estado${reporte.factura.estado}`]}`}>
                  {reporte.factura.estado}
                </p>
              </div>
            </div>
          </section>

          {/* Información del Contrato */}
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
                    {new Date(reporte.contrato.fechaInicio).toLocaleDateString('es-CO')} -{' '}
                    {new Date(reporte.contrato.fechaFin).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Valor Mensual:</label>
                  <p className={styles.monto}>${reporte.contrato.valorMensual.toLocaleString('es-CO')}</p>
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

          {/* Información de la Propiedad */}
          {reporte.propiedad && (
            <section className={styles.seccion}>
              <h2>🏠 Propiedad</h2>
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

          {/* Información del Inquilino */}
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
                    {reporte.inquilino.tipoDocumento} {reporte.inquilino.numeroDocumento}
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

          {/* Información del Propietario */}
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
            </section>
          )}

          {/* Pagos Asociados */}
          {reporte.pagosAsociados && reporte.pagosAsociados.length > 0 && (
            <section className={styles.seccion}>
              <h2>💰 Pagos Realizados ({reporte.pagosAsociados.length})</h2>
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
                        <td>{new Date(pago.fecha).toLocaleDateString('es-CO')}</td>
                        <td className={styles.monto}>${pago.monto.toLocaleString('es-CO')}</td>
                        <td>{pago.metodoPago}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[`estado${pago.estado}`]}`}>
                            {pago.estado}
                          </span>
                        </td>
                        <td>{pago.referenciaTransaccion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen de Pagos */}
              <div className={styles.resumenPagos}>
                <div className={styles.resumenItem}>
                  <label>Total Pagado:</label>
                  <p className={styles.montoTotal}>
                    $
                    {reporte.pagosAsociados
                      .reduce((sum, p) => sum + p.monto, 0)
                      .toLocaleString('es-CO')}
                  </p>
                </div>
                <div className={styles.resumenItem}>
                  <label>Saldo Pendiente:</label>
                  <p className={styles.montoPendiente}>
                    $
                    {Math.max(
                      0,
                      reporte.factura.total -
                        reporte.pagosAsociados.reduce((sum, p) => sum + p.monto, 0)
                    ).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Historial de Cambios */}
          {reporte.historialCambios && reporte.historialCambios.length > 0 && (
            <section className={styles.seccion}>
              <h2>📜 Historial de Cambios ({reporte.historialCambios.length})</h2>
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
                        <td>{new Date(cambio.fechaCambio).toLocaleString('es-CO')}</td>
                        <td>
                          <span className={styles.badgeAccion}>{cambio.tipoAccion}</span>
                        </td>
                        <td>{cambio.estadoAnterior || '-'}</td>
                        <td>{cambio.estadoNuevo}</td>
                        <td>{cambio.usuarioResponsable || 'Sistema'}</td>
                        <td className={styles.observacion}>{cambio.observacion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Usuario Generador */}
          {reporte.usuarioGenerador && (
            <div className={styles.footer}>
              <p>
                <strong>Reporte generado por:</strong> {reporte.usuarioGenerador.nombre}{' '}
                {reporte.usuarioGenerador.apellido}
              </p>
              <p>
                <strong>Fecha de generación:</strong>{' '}
                {new Date(reporte.fechaGeneracion).toLocaleString('es-CO')}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReporteFactura;
