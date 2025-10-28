import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import {
  obtenerTodosHistoriales,
  buscarHistorialConFiltros,
  exportarHistorialPDF,
  obtenerEstadisticasHistorial,
} from "../../../servicios/historialCambioEstado";
import type {
  DTOHistorialCambioEstadoRespuesta,
  FiltrosHistorial,
  EstadisticasHistorial,
} from "../../../modelos/types/HistorialCambioEstado";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import styles from "./ContadorHistorial.module.css";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  RefreshCw,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart,
} from "react-feather";

const ITEMS_POR_PAGINA = 15;

const ContadorHistorial: React.FC = () => {
  const navigate = useNavigate();

  const [historiales, setHistoriales] = useState<DTOHistorialCambioEstadoRespuesta[]>([]);
  const [historialesFiltrados, setHistorialesFiltrados] = useState<DTOHistorialCambioEstadoRespuesta[]>([]);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);
  const [historialSeleccionado, setHistorialSeleccionado] = useState<DTOHistorialCambioEstadoRespuesta | null>(null);
  const [estadisticas, setEstadisticas] = useState<EstadisticasHistorial | null>(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState<boolean>(false);

  const [filtros, setFiltros] = useState<FiltrosHistorial>({
    tipoEntidad: "",
    idEntidad: undefined,
    tipoAccion: "",
    usuario: "",
    fechaInicio: "",
    fechaFin: "",
  });

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    setHistorialesFiltrados(historiales);
  }, [historiales]);

  const verificarAcceso = async () => {
    try {
      const usuarioString = localStorage.getItem("usuario");
      const token = localStorage.getItem("token");

      if (!usuarioString || !token) {
        navigate("/login");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const rolUsuario = usuario.rol || usuario.tipoUsuario;

      if (
        rolUsuario !== "CONTADOR" &&
        rolUsuario !== TipoUsuario.CONTADOR &&
        rolUsuario !== "ADMINISTRADOR" &&
        rolUsuario !== TipoUsuario.ADMINISTRADOR
      ) {
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarHistoriales();
      await cargarEstadisticas();
    } catch (error) {
      navigate("/login");
    }
  };

  const cargarHistoriales = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerTodosHistoriales();
      setHistoriales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando historiales:", error);
      setError("Error al cargar el historial");
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await obtenerEstadisticasHistorial();
      setEstadisticas(data);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const aplicarFiltros = async () => {
    try {
      setCargando(true);
      setError("");

      const filtrosLimpios: FiltrosHistorial = {};
      if (filtros.tipoEntidad) filtrosLimpios.tipoEntidad = filtros.tipoEntidad;
      if (filtros.idEntidad) filtrosLimpios.idEntidad = filtros.idEntidad;
      if (filtros.tipoAccion) filtrosLimpios.tipoAccion = filtros.tipoAccion;
      if (filtros.usuario) filtrosLimpios.usuario = filtros.usuario;
      if (filtros.fechaInicio) filtrosLimpios.fechaInicio = filtros.fechaInicio;
      if (filtros.fechaFin) filtrosLimpios.fechaFin = filtros.fechaFin;

      const data = await buscarHistorialConFiltros(filtrosLimpios);
      setHistorialesFiltrados(Array.isArray(data) ? data : []);
      setPaginaActual(1);
    } catch (error) {
      console.error("Error aplicando filtros:", error);
      setError("Error al aplicar filtros");
    } finally {
      setCargando(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipoEntidad: "",
      idEntidad: undefined,
      tipoAccion: "",
      usuario: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setHistorialesFiltrados(historiales);
    setPaginaActual(1);
  };

  const exportarPDF = async () => {
    try {
      const blob = await exportarHistorialPDF(filtros);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historial_${new Date().getTime()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exportando PDF:", error);
      alert("Error al exportar el reporte");
    }
  };

  const obtenerClaseTipoAccion = (tipoAccion: string): string => {
    const tipo = tipoAccion.toUpperCase();
    if (tipo === "CREACION") return styles.accionCreacion;
    if (tipo === "ACTUALIZACION") return styles.accionActualizacion;
    if (tipo === "ELIMINACION") return styles.accionEliminacion;
    if (tipo === "CAMBIO_ESTADO") return styles.accionCambioEstado;
    if (tipo === "TRANSICION") return styles.accionTransicion;
    return styles.accionDefault;
  };

  const obtenerIconoEntidad = (tipoEntidad: string): string => {
    switch (tipoEntidad.toUpperCase()) {
      case "PROPIEDAD":
        return "🏠";
      case "CONTRATO":
        return "📄";
      case "FACTURA":
        return "🧾";
      case "PAGO":
        return "💰";
      default:
        return "📋";
    }
  };

  const formatearFecha = (fecha: string): string => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPaginas = Math.ceil(historialesFiltrados.length / ITEMS_POR_PAGINA);
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const historialesMostrados = historialesFiltrados.slice(inicio, fin);

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.contenedor}>
            <div className={styles.cargando}>
              <div className={styles.spinner}></div>
              <p>Cargando historial...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.contenedor}>
            <div className={styles.errorContenedor}>
              <FileText size={48} />
              <h2>Error</h2>
              <p className={styles.error}>{error}</p>
              <button onClick={cargarHistoriales}>Reintentar</button>
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
          <div className={styles.encabezado}>
            <div>
              <h1>
                <FileText size={32} />
                Historial de Cambios
              </h1>
              <p className={styles.subtitulo}>Auditoría y trazabilidad completa del sistema</p>
            </div>
            <div className={styles.botonesEncabezado}>
              <button className={styles.btnEstadisticas} onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}>
                <BarChart size={20} />
                {mostrarEstadisticas ? "Ocultar Estadísticas" : "Ver Estadísticas"}
              </button>
              <button className={styles.btnFiltros} onClick={() => setMostrarFiltros(!mostrarFiltros)}>
                <Filter size={20} />
                {mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}
              </button>
              <button className={styles.btnExportar} onClick={exportarPDF}>
                <Download size={20} />
                Exportar PDF
              </button>
            </div>
          </div>

          {mostrarEstadisticas && estadisticas && (
            <div className={styles.seccionEstadisticas}>
              <h3>
                <TrendingUp size={20} />
                Estadísticas
              </h3>
              <div className={styles.gridEstadisticas}>
                <div className={styles.tarjetaEstadistica}>
                  <div className={styles.estadisticaIcono}>📊</div>
                  <div className={styles.estadisticaInfo}>
                    <p className={styles.estadisticaValor}>{estadisticas.totalCambios}</p>
                    <p className={styles.estadisticaLabel}>Total de Cambios</p>
                  </div>
                </div>

                {estadisticas.cambiosPorTipo && estadisticas.cambiosPorTipo.length > 0 && (
                  <>
                    {estadisticas.cambiosPorTipo.slice(0, 4).map((item: any, idx: number) => (
                      <div key={idx} className={styles.tarjetaEstadistica}>
                        <div className={styles.estadisticaIcono}>{obtenerIconoEntidad(item[0])}</div>
                        <div className={styles.estadisticaInfo}>
                          <p className={styles.estadisticaValor}>{item[1]}</p>
                          <p className={styles.estadisticaLabel}>{item[0]}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {mostrarFiltros && (
            <div className={styles.seccionFiltros}>
              <h3>
                <Filter size={20} />
                Filtros Avanzados
              </h3>
              <div className={styles.gridFiltros}>
                <div className={styles.filtroGrupo}>
                  <label>Tipo de Entidad</label>
                  <select
                    value={filtros.tipoEntidad}
                    onChange={(e) => setFiltros({ ...filtros, tipoEntidad: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Todas</option>
                    <option value="PROPIEDAD">🏠 Propiedades</option>
                    <option value="CONTRATO">📄 Contratos</option>
                    <option value="FACTURA">🧾 Facturas</option>
                    <option value="PAGO">💰 Pagos</option>
                  </select>
                </div>

                <div className={styles.filtroGrupo}>
                  <label>ID de Registro</label>
                  <input
                    type="number"
                    value={filtros.idEntidad || ""}
                    onChange={(e) =>
                      setFiltros({ ...filtros, idEntidad: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="Ej: 123"
                    className={styles.input}
                  />
                </div>

                <div className={styles.filtroGrupo}>
                  <label>Tipo de Acción</label>
                  <select
                    value={filtros.tipoAccion}
                    onChange={(e) => setFiltros({ ...filtros, tipoAccion: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Todas</option>
                    <option value="CREACION">✨ Creación</option>
                    <option value="ACTUALIZACION">✏️ Actualización</option>
                    <option value="ELIMINACION">🗑️ Eliminación</option>
                    <option value="CAMBIO_ESTADO">🔄 Cambio de Estado</option>
                    <option value="TRANSICION">➡️ Transición</option>
                  </select>
                </div>

                <div className={styles.filtroGrupo}>
                  <label>Usuario</label>
                  <input
                    type="text"
                    value={filtros.usuario}
                    onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
                    placeholder="Nombre o email"
                    className={styles.input}
                  />
                </div>

                <div className={styles.filtroGrupo}>
                  <label>Fecha Inicio</label>
                  <input
                    type="datetime-local"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.filtroGrupo}>
                  <label>Fecha Fin</label>
                  <input
                    type="datetime-local"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.botonesAccion}>
                <button className={styles.btnAplicar} onClick={aplicarFiltros}>
                  <Search size={18} />
                  Aplicar Filtros
                </button>
                <button className={styles.btnLimpiar} onClick={limpiarFiltros}>
                  <RefreshCw size={18} />
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {historialesFiltrados.length === 0 ? (
            <div className={styles.sinDatos}>
              <FileText size={48} />
              <p>No se encontraron registros en el historial</p>
            </div>
          ) : (
            <>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Entidad</th>
                      <th>ID Reg</th>
                      <th>Tipo Acción</th>
                      <th>Estado Anterior</th>
                      <th>Estado Nuevo</th>
                      <th>Usuario</th>
                      <th>Fecha y Hora</th>
                      <th>Ver</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialesMostrados.map((historial) => (
                      <tr key={historial.idHistorial}>
                        <td>{historial.idHistorial}</td>
                        <td>
                          <span className={styles.badgeModulo}>
                            {obtenerIconoEntidad(historial.tipoEntidad)} {historial.tipoEntidad}
                          </span>
                        </td>
                        <td className={styles.idRegistro}>#{historial.idEntidad}</td>
                        <td>
                          <span className={`${styles.badgeAccion} ${obtenerClaseTipoAccion(historial.tipoAccion)}`}>
                            {historial.tipoAccion}
                          </span>
                        </td>
                        <td className={styles.estado}>{historial.estadoAnterior || "-"}</td>
                        <td className={styles.estado}>{historial.estadoNuevo || "-"}</td>
                        <td className={styles.usuario}>
                          <User size={14} />
                          {historial.nombreUsuarioResponsable || "Sistema"}
                        </td>
                        <td className={styles.fecha}>
                          <Calendar size={14} />
                          {formatearFecha(historial.fechaCambio)}
                        </td>
                        <td className={styles.version}>v{historial.version || 1}</td>
                        <td>
                          <button
                            className={styles.btnVer}
                            onClick={() => setHistorialSeleccionado(historial)}
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className={styles.paginacion}>
                  <button onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))} disabled={paginaActual === 1}>
                    <ChevronLeft size={18} /> Anterior
                  </button>
                  <span>
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* MODAL DE DETALLES */}
      {historialSeleccionado && (
        <div className={styles.modalOverlay} onClick={() => setHistorialSeleccionado(null)}>
          <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                <FileText size={20} />
                Detalles del Cambio #{historialSeleccionado.idHistorial}
              </h2>
              <button className={styles.btnCerrar} onClick={() => setHistorialSeleccionado(null)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detallesGrid}>
                <div className={styles.detalleCampo}>
                  <label>Entidad:</label>
                  <p className={styles.badgeModulo}>
                    {obtenerIconoEntidad(historialSeleccionado.tipoEntidad)} {historialSeleccionado.tipoEntidad}
                  </p>
                </div>

                <div className={styles.detalleCampo}>
                  <label>ID de Registro:</label>
                  <p className={styles.idRegistro}>#{historialSeleccionado.idEntidad}</p>
                </div>

                <div className={styles.detalleCampo}>
                  <label>Tipo de Acción:</label>
                  <p
                    className={`${styles.badgeAccion} ${obtenerClaseTipoAccion(historialSeleccionado.tipoAccion)}`}
                  >
                    {historialSeleccionado.tipoAccion}
                  </p>
                </div>

                <div className={styles.detalleCampo}>
                  <label>Usuario Responsable:</label>
                  <p>{historialSeleccionado.nombreUsuarioResponsable || "Sistema"}</p>
                </div>

                {historialSeleccionado.emailUsuario && (
                  <div className={styles.detalleCampo}>
                    <label>Email:</label>
                    <p>{historialSeleccionado.emailUsuario}</p>
                  </div>
                )}

                <div className={styles.detalleCampo}>
                  <label>Fecha y Hora:</label>
                  <p>{formatearFecha(historialSeleccionado.fechaCambio)}</p>
                </div>

                <div className={styles.detalleCampo}>
                  <label>Versión:</label>
                  <p>v{historialSeleccionado.version || 1}</p>
                </div>

                {historialSeleccionado.ipOrigen && (
                  <div className={styles.detalleCampo}>
                    <label>IP Origen:</label>
                    <p>{historialSeleccionado.ipOrigen}</p>
                  </div>
                )}
              </div>

              <div className={styles.separador}></div>

              <div className={styles.transicion}>
                <h3>Transición de Estado</h3>
                <div className={styles.transicionVisual}>
                  <div className={styles.estadoBox}>
                    <label>Estado Anterior</label>
                    <p>{historialSeleccionado.estadoAnterior || "N/A"}</p>
                  </div>
                  <div className={styles.flecha}>→</div>
                  <div className={styles.estadoBox}>
                    <label>Estado Nuevo</label>
                    <p>{historialSeleccionado.estadoNuevo || "N/A"}</p>
                  </div>
                </div>
              </div>

              {historialSeleccionado.observacion && (
                <>
                  <div className={styles.separador}></div>
                  <div className={styles.detalleCampo}>
                    <label>Observación:</label>
                    <p className={styles.descripcion}>{historialSeleccionado.observacion}</p>
                  </div>
                </>
              )}

              {historialSeleccionado.motivo && (
                <>
                  <div className={styles.separador}></div>
                  <div className={styles.detalleCampo}>
                    <label>Motivo:</label>
                    <p className={styles.motivo}>{historialSeleccionado.motivo}</p>
                  </div>
                </>
              )}

              {historialSeleccionado.datosAnteriores && (
                <>
                  <div className={styles.separador}></div>
                  <div className={styles.detalleCampo}>
                    <label>Datos Anteriores (JSON):</label>
                    <pre className={styles.jsonViewer}>
                      {JSON.stringify(JSON.parse(historialSeleccionado.datosAnteriores), null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {historialSeleccionado.datosNuevos && (
                <>
                  <div className={styles.separador}></div>
                  <div className={styles.detalleCampo}>
                    <label>Datos Nuevos (JSON):</label>
                    <pre className={styles.jsonViewer}>
                      {JSON.stringify(JSON.parse(historialSeleccionado.datosNuevos), null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCerrarModal} onClick={() => setHistorialSeleccionado(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContadorHistorial;
