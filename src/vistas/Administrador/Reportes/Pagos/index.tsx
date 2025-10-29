import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../../componentes/Header';
import Footer from '../../../../componentes/Footer';
import { 
  obtenerReportePago, 
  descargarReportePagoPDF,
  descargarArchivo 
} from '../../../../servicios/reportes';
import { Download, ArrowLeft, FileText } from 'react-feather';
import styles from './ReportePago.module.css';
import type { DTOReportePagoCompleto } from '../../../../modelos/types/Reporte';

const ReportePago: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState<DTOReportePagoCompleto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReporte();
  }, [id]);

  const cargarReporte = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerReportePago(Number(id));
      console.log('Reporte cargado:', data);
      setReporte(data);
    } catch (error: any) {
      console.error('Error cargando reporte:', error);
      setError(error.response?.data?.message || 'Error al cargar el reporte');
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDescargando(true);
      console.log('Iniciando descarga de PDF para pago:', id);
      
      const blob = await descargarReportePagoPDF(Number(id));
      console.log('Blob recibido:', blob);
      
      descargarArchivo(blob, `reporte_pago_${id}_${Date.now()}.pdf`);
      alert('✅ PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error descargando PDF:', error);
      alert('❌ Error al descargar el PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setDescargando(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
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
                Reporte de Pago #{reporte.pago.idPago}
              </h1>
              <p className={styles.fecha}>
                Generado el: {formatearFecha(reporte.fechaGeneracion)}
              </p>
            </div>
            <div className={styles.botones}>
              <button 
                onClick={descargarPDF} 
                className={styles.btnDescargar}
                disabled={descargando}
              >
                <Download size={20} />
                {descargando ? 'Descargando...' : 'Descargar PDF'}
              </button>
              <button onClick={() => navigate(-1)} className={styles.btnVolver}>
                <ArrowLeft size={18} />
                Volver
              </button>
            </div>
          </div>

          {/* Información del Pago */}
          <section className={styles.seccion}>
            <h2>💰 Información del Pago</h2>
            <div className={styles.grid}>
              <div className={styles.campo}>
                <label>ID Pago:</label>
                <p className={styles.destacado}>#{reporte.pago.idPago}</p>
              </div>
              <div className={styles.campo}>
                <label>Fecha:</label>
                <p>{formatearFecha(reporte.pago.fecha)}</p>
              </div>
              <div className={styles.campo}>
                <label>Monto:</label>
                <p className={styles.monto}>${reporte.pago.monto.toLocaleString('es-CO')}</p>
              </div>
              <div className={styles.campo}>
                <label>Método de Pago:</label>
                <p>{reporte.pago.metodoPago}</p>
              </div>
              <div className={styles.campo}>
                <label>Estado:</label>
                <p className={`${styles.badge} ${styles[`estado${reporte.pago.estado}`]}`}>
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

          {/* Información de la Factura */}
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
                  <p>{new Date(reporte.factura.fechaEmision).toLocaleDateString('es-CO')}</p>
                </div>
                <div className={styles.campo}>
                  <label>Fecha Vencimiento:</label>
                  <p>{new Date(reporte.factura.fechaVencimiento).toLocaleDateString('es-CO')}</p>
                </div>
                <div className={styles.campo}>
                  <label>Total:</label>
                  <p className={styles.monto}>${reporte.factura.total.toLocaleString('es-CO')}</p>
                </div>
                <div className={styles.campo}>
                  <label>Estado:</label>
                  <p className={styles.badge}>{reporte.factura.estado}</p>
                </div>
              </div>
            </section>
          )}

          {/* Información del Contrato */}
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
                    {new Date(reporte.contrato.fechaInicio).toLocaleDateString('es-CO')} - 
                    {new Date(reporte.contrato.fechaFin).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className={styles.campo}>
                  <label>Valor Mensual:</label>
                  <p className={styles.monto}>${reporte.contrato.valorMensual.toLocaleString('es-CO')}</p>
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
              </div>
            </section>
          )}

          {/* Información del Inquilino */}
          {reporte.inquilino && (
            <section className={styles.seccion}>
              <h2>👤 Inquilino</h2>
              <div className={styles.grid}>
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
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.historialCambios.map((cambio) => (
                      <tr key={cambio.idHistorial}>
                        <td>{formatearFecha(cambio.fechaCambio)}</td>
                        <td><span className={styles.badgeAccion}>{cambio.tipoAccion}</span></td>
                        <td>{cambio.estadoAnterior || '-'}</td>
                        <td>{cambio.estadoNuevo}</td>
                        <td>{cambio.usuarioResponsable || 'Sistema'}</td>
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

