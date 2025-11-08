import React, { useState, useEffect, type ReactElement } from "react";
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
  ExternalLink,
  Clock,
} from "react-feather";

// ========================================
// HISTORIAL DE CAMBIOS - ROL CONTADOR
// ========================================
//
// Panel de auditoría para visualizar, filtrar y analizar historial completo de cambios del sistema.
// Acceso exclusivo para roles CONTADOR y ADMINISTRADOR.
// Funcionalidad idéntica al historial de administrador pero con permisos de contador.
//
// FUNCIONALIDADES:
// - Visualización completa del historial de cambios en tabla paginada.
// - Filtrado avanzado por entidad, acción, usuario, fechas y ID.
// - Estadísticas agregadas de cambios por tipo de entidad.
// - Exportación de reportes en PDF con filtros aplicados.
// - Vista detallada de cada cambio con datos antes/después.
// - Navegación a reportes específicos de entidad.
//
// SEGURIDAD Y ACCESO:
// - verificarAcceso(): Solo CONTADOR y ADMINISTRADOR.
// - Lectura de token y usuario desde localStorage.
// - Redirección a login si no hay autenticación.
// - Redirección a home si rol no autorizado.
//
// ESTADO:
// - historiales: Lista completa de cambios.
// - historialesFiltrados: Subset filtrado para mostrar.
// - usuariosDisponibles: Lista única de usuarios para filtro.
// - paginaActual: Control de paginación (15 items por página).
// - cargando: Operación en curso.
// - error: Mensaje de error.
// - mostrarFiltros: Toggle para panel de filtros.
// - historialSeleccionado: Cambio seleccionado para modal.
// - estadisticas: Datos agregados.
// - mostrarEstadisticas: Toggle para panel de estadísticas.
// - filtros: Criterios de búsqueda activos.
//
// FUNCIONES PRINCIPALES:
// - verificarAcceso(): Valida autenticación y autorización.
// - cargarHistoriales(): Carga lista completa de historiales.
// - cargarEstadisticas(): Obtiene datos agregados.
// - aplicarFiltros(): Filtra historiales según criterios.
// - limpiarFiltros(): Resetea filtros y muestra lista completa.
// - exportarPDF(): Genera reporte PDF con filtros.
// - verReporte(): Navega a reporte específico según tipo de entidad.
//
// RENDERIZADO DE DATOS:
// - renderizarDatosEntidad(): Dispatcher según tipo.
// - renderizarDatosContrato(): Grid con campos de contrato.
// - renderizarDatosPropiedad(): Grid con campos de propiedad.
// - renderizarDatosFactura(): Grid con campos de factura.
// - renderizarDatosPago(): Grid con campos de pago.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato legible español.
// - obtenerClaseTipoAccion(): Asigna clase CSS según tipo de acción.
// - obtenerIconoEntidad(): Retorna emoji según tipo de entidad.
// - tieneReporteDisponible(): Valida si entidad tiene reporte.
//
// COMPONENTES VISUALES:
// - Encabezado: Título, contador, botones de estadísticas/filtros/exportar.
// - Panel Estadísticas: Total de cambios y tarjetas por tipo de entidad.
// - Panel Filtros: Selects e inputs para filtrado avanzado.
// - Tabla: Listado paginado con columnas completas.
// - Modal Detalles: Vista expandida de cambio con datos antes/después.
//
// PAGINACIÓN:
// - 15 items por página.
// - Controles anterior/siguiente con disabled.
// - Indicador de página actual, total y rango de items.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive.
// - Badges coloreados por acción.
// - Modal con backdrop blur.

const ITEMS_POR_PAGINA = 15;

const ContadorHistorial: React.FC = () => {
  const navigate = useNavigate();

  const [historiales, setHistoriales] = useState<
    DTOHistorialCambioEstadoRespuesta[]
  >([]);
  const [historialesFiltrados, setHistorialesFiltrados] = useState<
    DTOHistorialCambioEstadoRespuesta[]
  >([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<string[]>([]);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);
  const [historialSeleccionado, setHistorialSeleccionado] =
    useState<DTOHistorialCambioEstadoRespuesta | null>(null);
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasHistorial | null>(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] =
    useState<boolean>(false);

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
      const historialesArray = Array.isArray(data) ? data : [];
      setHistoriales(historialesArray);
      setHistorialesFiltrados(historialesArray);

      const usuarios = [
        ...new Set(
          historialesArray
            .map((h) => h.nombreUsuarioResponsable)
            .filter((u): u is string => !!u)
        ),
      ].sort();
      setUsuariosDisponibles(usuarios);
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

      const hayFiltros =
        filtros.tipoEntidad ||
        filtros.idEntidad ||
        filtros.tipoAccion ||
        filtros.usuario ||
        filtros.fechaInicio ||
        filtros.fechaFin;

      if (!hayFiltros) {
        setHistorialesFiltrados(historiales);
        setPaginaActual(1);
        setCargando(false);
        return;
      }

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
      setCargando(true);
      const blob = await exportarHistorialPDF(filtros);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historial_${new Date().getTime()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      alert("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error exportando PDF:", error);
      alert("Error al exportar el reporte");
    } finally {
      setCargando(false);
    }
  };

  const verReporte = (tipoEntidad: string, idEntidad: number) => {
    const usuarioString = localStorage.getItem("usuario");
    const usuario = JSON.parse(usuarioString || "{}");
    const rol = (usuario.rol || usuario.tipoUsuario || "").toLowerCase();

    switch (tipoEntidad) {
      case "CONTRATO":
        navigate(`/${rol}/reporte/contrato/${idEntidad}`);
        break;
      case "PROPIEDAD":
        navigate(`/${rol}/reporte/propiedad/${idEntidad}`);
        break;
      case "PAGO":
        navigate(`/${rol}/reporte/pago/${idEntidad}`);
        break;
      case "FACTURA":
        navigate(`/${rol}/reporte/factura/${idEntidad}`);
        break;
      default:
        alert("Tipo de reporte no disponible para esta entidad");
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
        return "info";
      case "CONTRATO":
        return "question";
      case "FACTURA":
        return "warning";
      case "PAGO":
        return "success";
      default:
        return "info";
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

  const tieneReporteDisponible = (tipoEntidad: string): boolean => {
    return (
      tipoEntidad === "CONTRATO" ||
      tipoEntidad === "PROPIEDAD" ||
      tipoEntidad === "PAGO" ||
      tipoEntidad === "FACTURA"
    );
  };

  const renderizarDatosEntidad = (
    datos: any,
    tipoEntidad: string
  ): ReactElement => {
    if (!datos || typeof datos !== "object") {
      return <p className={styles.noData}>No hay datos disponibles</p>;
    }

    switch (tipoEntidad) {
      case "CONTRATO":
        return renderizarDatosContrato(datos);
      case "PROPIEDAD":
        return renderizarDatosPropiedad(datos);
      case "FACTURA":
        return renderizarDatosFactura(datos);
      case "PAGO":
        return renderizarDatosPago(datos);
      default:
        return (
          <pre className={styles.jsonViewer}>
            {JSON.stringify(datos, null, 2)}
          </pre>
        );
    }
  };

  const renderizarDatosContrato = (contrato: any): ReactElement => {
    return (
      <div className={styles.gridDatosEntidad}>
        {contrato.idContrato && (
          <div className={styles.campoEntidad}>
            <label>ID:</label>
            <p>#{contrato.idContrato}</p>
          </div>
        )}
        {contrato.fechaInicio && (
          <div className={styles.campoEntidad}>
            <label>Fecha Inicio:</label>
            <p>{new Date(contrato.fechaInicio).toLocaleDateString("es-CO")}</p>
          </div>
        )}
        {contrato.fechaFin && (
          <div className={styles.campoEntidad}>
            <label>Fecha Fin:</label>
            <p>{new Date(contrato.fechaFin).toLocaleDateString("es-CO")}</p>
          </div>
        )}
        {contrato.valorMensual !== undefined && (
          <div className={styles.campoEntidad}>
            <label>Valor Mensual:</label>
            <p className={styles.valorMonetario}>
              ${contrato.valorMensual.toLocaleString("es-CO")}
            </p>
          </div>
        )}
        {contrato.estado && (
          <div className={styles.campoEntidad}>
            <label>Estado:</label>
            <p className={styles.badgeEstado}>{contrato.estado}</p>
          </div>
        )}
        {contrato.tipoContrato && (
          <div className={styles.campoEntidad}>
            <label>Tipo:</label>
            <p>{contrato.tipoContrato}</p>
          </div>
        )}
        {contrato.formaPago && (
          <div className={styles.campoEntidad}>
            <label>Forma de Pago:</label>
            <p>{contrato.formaPago}</p>
          </div>
        )}
        {contrato.observaciones && (
          <div className={styles.campoEntidadFull}>
            <label>Observaciones:</label>
            <p className={styles.textoDescripcion}>{contrato.observaciones}</p>
          </div>
        )}
      </div>
    );
  };

  const renderizarDatosPropiedad = (propiedad: any): ReactElement => {
    return (
      <div className={styles.gridDatosEntidad}>
        {propiedad.idPropiedad && (
          <div className={styles.campoEntidad}>
            <label>ID:</label>
            <p>#{propiedad.idPropiedad}</p>
          </div>
        )}
        {propiedad.direccion && (
          <div className={styles.campoEntidad}>
            <label>Dirección:</label>
            <p>{propiedad.direccion}</p>
          </div>
        )}
        {propiedad.ciudad && (
          <div className={styles.campoEntidad}>
            <label>Ciudad:</label>
            <p>{propiedad.ciudad}</p>
          </div>
        )}
        {propiedad.tipo && (
          <div className={styles.campoEntidad}>
            <label>Tipo:</label>
            <p>{propiedad.tipo}</p>
          </div>
        )}
        {propiedad.estado && (
          <div className={styles.campoEntidad}>
            <label>Estado:</label>
            <p className={styles.badgeEstado}>{propiedad.estado}</p>
          </div>
        )}
        {propiedad.area && (
          <div className={styles.campoEntidad}>
            <label>Área:</label>
            <p>{propiedad.area} m²</p>
          </div>
        )}
        {propiedad.habitaciones && (
          <div className={styles.campoEntidad}>
            <label>Habitaciones:</label>
            <p>{propiedad.habitaciones}</p>
          </div>
        )}
        {propiedad.banos && (
          <div className={styles.campoEntidad}>
            <label>Baños:</label>
            <p>{propiedad.banos}</p>
          </div>
        )}
        {propiedad.parqueaderos && (
          <div className={styles.campoEntidad}>
            <label>Parqueaderos:</label>
            <p>{propiedad.parqueaderos}</p>
          </div>
        )}
        {propiedad.amoblado !== undefined && (
          <div className={styles.campoEntidad}>
            <label>Amoblado:</label>
            <p>{propiedad.amoblado ? "Sí" : "No"}</p>
          </div>
        )}
        {propiedad.piso && (
          <div className={styles.campoEntidad}>
            <label>Piso:</label>
            <p>{propiedad.piso}</p>
          </div>
        )}
        {propiedad.anoConstruccion && (
          <div className={styles.campoEntidad}>
            <label>Año Construcción:</label>
            <p>{propiedad.anoConstruccion}</p>
          </div>
        )}
        {propiedad.descripcion && (
          <div className={styles.campoEntidadFull}>
            <label>Descripción:</label>
            <p className={styles.textoDescripcion}>{propiedad.descripcion}</p>
          </div>
        )}
      </div>
    );
  };

  const renderizarDatosFactura = (factura: any): ReactElement => {
    return (
      <div className={styles.gridDatosEntidad}>
        {factura.idFactura && (
          <div className={styles.campoEntidad}>
            <label>ID:</label>
            <p>#{factura.idFactura}</p>
          </div>
        )}
        {factura.numeroFactura && (
          <div className={styles.campoEntidad}>
            <label>Número:</label>
            <p>{factura.numeroFactura}</p>
          </div>
        )}
        {factura.fechaEmision && (
          <div className={styles.campoEntidad}>
            <label>Fecha Emisión:</label>
            <p>{new Date(factura.fechaEmision).toLocaleDateString("es-CO")}</p>
          </div>
        )}
        {factura.fechaVencimiento && (
          <div className={styles.campoEntidad}>
            <label>Fecha Vencimiento:</label>
            <p>
              {new Date(factura.fechaVencimiento).toLocaleDateString("es-CO")}
            </p>
          </div>
        )}
        {factura.total !== undefined && (
          <div className={styles.campoEntidad}>
            <label>Total:</label>
            <p className={styles.valorMonetario}>
              ${factura.total.toLocaleString("es-CO")}
            </p>
          </div>
        )}
        {factura.estado && (
          <div className={styles.campoEntidad}>
            <label>Estado:</label>
            <p className={styles.badgeEstado}>{factura.estado}</p>
          </div>
        )}
        {factura.concepto && (
          <div className={styles.campoEntidadFull}>
            <label>Concepto:</label>
            <p className={styles.textoDescripcion}>{factura.concepto}</p>
          </div>
        )}
      </div>
    );
  };

  const renderizarDatosPago = (pago: any): ReactElement => {
    return (
      <div className={styles.gridDatosEntidad}>
        {pago.idPago && (
          <div className={styles.campoEntidad}>
            <label>ID:</label>
            <p>#{pago.idPago}</p>
          </div>
        )}
        {pago.fecha && (
          <div className={styles.campoEntidad}>
            <label>Fecha:</label>
            <p>{new Date(pago.fecha).toLocaleString("es-CO")}</p>
          </div>
        )}
        {pago.monto !== undefined && (
          <div className={styles.campoEntidad}>
            <label>Monto:</label>
            <p className={styles.valorMonetario}>
              ${pago.monto.toLocaleString("es-CO")}
            </p>
          </div>
        )}
        {pago.metodoPago && (
          <div className={styles.campoEntidad}>
            <label>Método:</label>
            <p>{pago.metodoPago}</p>
          </div>
        )}
        {pago.estado && (
          <div className={styles.campoEntidad}>
            <label>Estado:</label>
            <p className={styles.badgeEstado}>{pago.estado}</p>
          </div>
        )}
        {pago.referenciaTransaccion && (
          <div className={styles.campoEntidad}>
            <label>Referencia:</label>
            <p>{pago.referenciaTransaccion}</p>
          </div>
        )}
        {pago.bancoOrigen && (
          <div className={styles.campoEntidad}>
            <label>Banco Origen:</label>
            <p>{pago.bancoOrigen}</p>
          </div>
        )}
        {pago.bancoDestino && (
          <div className={styles.campoEntidad}>
            <label>Banco Destino:</label>
            <p>{pago.bancoDestino}</p>
          </div>
        )}
      </div>
    );
  };

  const totalPaginas = Math.ceil(
    historialesFiltrados.length / ITEMS_POR_PAGINA
  );
  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const fin = inicio + ITEMS_POR_PAGINA;
  const historialesMostrados = historialesFiltrados.slice(inicio, fin);

  if (cargando && historiales.length === 0) {
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

  if (error && historiales.length === 0) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.contenedor}>
            <div className={styles.errorContenedor}>
              <FileText size={48} />
              <h2>Error</h2>
              <p className={styles.error}>{error}</p>
              <button
                onClick={cargarHistoriales}
                className={styles.btnReintentar}
              >
                <RefreshCw size={18} />
                Reintentar
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
          {/* ENCABEZADO */}
          <div className={styles.encabezado}>
            <div>
              <h1>
                <FileText size={32} />
                Historial de Cambios
              </h1>
              <p className={styles.subtitulo}>
                Auditoría y trazabilidad completa •{" "}
                {historialesFiltrados.length} registro(s)
              </p>
            </div>
            <div className={styles.botonesEncabezado}>
              <button
                className={styles.btnEstadisticas}
                onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
              >
                <BarChart size={20} />
                {mostrarEstadisticas ? "Ocultar" : "Estadísticas"}
              </button>
              <button
                className={styles.btnFiltros}
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                <Filter size={20} />
                {mostrarFiltros ? "Ocultar" : "Filtros"}
              </button>
              <button
                className={styles.btnExportar}
                onClick={exportarPDF}
                disabled={cargando}
              >
                <Download size={20} />
                Exportar PDF
              </button>
            </div>
          </div>

          {/* ESTADÍSTICAS */}
          {mostrarEstadisticas && estadisticas && (
            <div className={styles.seccionEstadisticas}>
              <h3>
                <TrendingUp size={20} />
                Estadísticas del Sistema
              </h3>
              <div className={styles.gridEstadisticas}>
                <div className={styles.tarjetaEstadistica}>
                  <div className={styles.estadisticaIcono}>📊</div>
                  <div className={styles.estadisticaInfo}>
                    <p className={styles.estadisticaValor}>
                      {estadisticas.totalCambios || historiales.length}
                    </p>
                    <p className={styles.estadisticaLabel}>Total de Cambios</p>
                  </div>
                </div>

                {estadisticas.cambiosPorTipo &&
                estadisticas.cambiosPorTipo.length > 0 ? (
                  <>
                    {estadisticas.cambiosPorTipo
                      .slice(0, 4)
                      .map((item: any, idx: number) => (
                        <div key={idx} className={styles.tarjetaEstadistica}>
                          <div className={styles.estadisticaIcono}>
                            {obtenerIconoEntidad(item[0])}
                          </div>
                          <div className={styles.estadisticaInfo}>
                            <p className={styles.estadisticaValor}>{item[1]}</p>
                            <p className={styles.estadisticaLabel}>{item[0]}</p>
                          </div>
                        </div>
                      ))}
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* FILTROS */}
          {mostrarFiltros && (
            <div className={styles.seccionFiltros}>
              <h3>
                <Filter size={20} />
                Filtros Avanzados
              </h3>
              <div className={styles.gridFiltros}>
                <div className={styles.filtroGrupo}>
                  <label>
                    <Calendar size={14} /> Tipo de Entidad
                  </label>
                  <select
                    value={filtros.tipoEntidad}
                    onChange={(e) =>
                      setFiltros({ ...filtros, tipoEntidad: e.target.value })
                    }
                    className={styles.select}
                  >
                    <option value="">Todas las entidades</option>
                    <option value="PROPIEDAD">Propiedades</option>
                    <option value="CONTRATO">Contratos</option>
                    <option value="FACTURA">Facturas</option>
                    <option value="PAGO">Pagos</option>
                  </select>
                </div>

                <div className={styles.filtroGrupo}>
                  <label>ID de Registro</label>
                  <input
                    type="number"
                    value={filtros.idEntidad || ""}
                    onChange={(e) =>
                      setFiltros({
                        ...filtros,
                        idEntidad: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Ej: 123"
                    className={styles.input}
                  />
                </div>

                <div className={styles.filtroGrupo}>
                  <label>Tipo de Acción</label>
                  <select
                    value={filtros.tipoAccion}
                    onChange={(e) =>
                      setFiltros({ ...filtros, tipoAccion: e.target.value })
                    }
                    className={styles.select}
                  >
                    <option value="">Todas las acciones</option>
                    <option value="CREACION">Creación</option>
                    <option value="ACTUALIZACION">Actualización</option>
                    <option value="ELIMINACION">Eliminación</option>
                    <option value="CAMBIO_ESTADO">Cambio de Estado</option>
                    <option value="TRANSICION">Transición</option>
                  </select>
                </div>

                <div className={styles.filtroGrupo}>
                  <label>
                    <User size={14} /> Usuario Responsable
                  </label>
                  <select
                    value={filtros.usuario}
                    onChange={(e) =>
                      setFiltros({ ...filtros, usuario: e.target.value })
                    }
                    className={styles.select}
                  >
                    <option value="">Todos los usuarios</option>
                    {usuariosDisponibles.map((usuario) => (
                      <option key={usuario} value={usuario}>
                        {usuario}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filtroGrupo}>
                  <label>
                    <Clock size={14} /> Fecha Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={filtros.fechaInicio}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaInicio: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.filtroGrupo}>
                  <label>
                    <Clock size={14} /> Fecha Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={filtros.fechaFin}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaFin: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.botonesAccion}>
                <button
                  className={styles.btnAplicar}
                  onClick={aplicarFiltros}
                  disabled={cargando}
                >
                  <Search size={18} />
                  {cargando ? "Aplicando..." : "Aplicar Filtros"}
                </button>
                <button className={styles.btnLimpiar} onClick={limpiarFiltros}>
                  <RefreshCw size={18} />
                  Limpiar
                </button>
              </div>
            </div>
          )}

          {/* TABLA */}
          {historialesFiltrados.length === 0 ? (
            <div className={styles.sinDatos}>
              <FileText size={48} />
              <h3>No se encontraron registros</h3>
              <p>No hay cambios que coincidan con los filtros aplicados</p>
              {Object.values(filtros).some((v) => v) && (
                <button onClick={limpiarFiltros} className={styles.btnLimpiar}>
                  <RefreshCw size={18} />
                  Limpiar Filtros
                </button>
              )}
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
                            {obtenerIconoEntidad(historial.tipoEntidad)}{" "}
                            {historial.tipoEntidad}
                          </span>
                        </td>
                        <td className={styles.idRegistro}>
                          #{historial.idEntidad}
                        </td>
                        <td>
                          <span
                            className={`${
                              styles.badgeAccion
                            } ${obtenerClaseTipoAccion(historial.tipoAccion)}`}
                          >
                            {historial.tipoAccion}
                          </span>
                        </td>
                        <td className={styles.estado}>
                          {historial.estadoAnterior || "-"}
                        </td>
                        <td className={styles.estado}>
                          {historial.estadoNuevo || "-"}
                        </td>
                        <td className={styles.usuario}>
                          <User size={14} />
                          {historial.nombreUsuarioResponsable || "Sistema"}
                        </td>
                        <td className={styles.fecha}>
                          <Calendar size={14} />
                          {formatearFecha(historial.fechaCambio)}
                        </td>
                        <td className={styles.version}>
                          v{historial.version || 1}
                        </td>
                        <td>
                          <div className={styles.botonesAccionTabla}>
                            <button
                              className={styles.btnVer}
                              onClick={() =>
                                setHistorialSeleccionado(historial)
                              }
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </button>
                            {tieneReporteDisponible(historial.tipoEntidad) && (
                              <button
                                className={styles.btnReporte}
                                onClick={() =>
                                  verReporte(
                                    historial.tipoEntidad,
                                    historial.idEntidad
                                  )
                                }
                                title="Ver reporte"
                              >
                                <ExternalLink size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className={styles.paginacion}>
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                    disabled={paginaActual === 1}
                  >
                    <ChevronLeft size={18} /> Anterior
                  </button>
                  <span>
                    Página {paginaActual} de {totalPaginas} • {inicio + 1}-
                    {Math.min(fin, historialesFiltrados.length)} de{" "}
                    {historialesFiltrados.length}
                  </span>
                  <button
                    onClick={() =>
                      setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                    }
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
        <div
          className={styles.modalOverlay}
          onClick={() => setHistorialSeleccionado(null)}
        >
          <div
            className={styles.modalContenido}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                <FileText size={20} />
                Detalles del Cambio #{historialSeleccionado.idHistorial}
              </h2>
              <button
                className={styles.btnCerrar}
                onClick={() => setHistorialSeleccionado(null)}
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.seccionModal}>
                <h3>Información General</h3>
                <div className={styles.detallesGrid}>
                  <div className={styles.detalleCampo}>
                    <label>ID:</label>
                    <p>#{historialSeleccionado.idHistorial}</p>
                  </div>
                  <div className={styles.detalleCampo}>
                    <label>Entidad:</label>
                    <p>
                      {obtenerIconoEntidad(historialSeleccionado.tipoEntidad)}{" "}
                      {historialSeleccionado.tipoEntidad}
                    </p>
                  </div>
                  <div className={styles.detalleCampo}>
                    <label>ID Registro:</label>
                    <p>#{historialSeleccionado.idEntidad}</p>
                  </div>
                  <div className={styles.detalleCampo}>
                    <label>Acción:</label>
                    <p
                      className={obtenerClaseTipoAccion(
                        historialSeleccionado.tipoAccion
                      )}
                    >
                      {historialSeleccionado.tipoAccion}
                    </p>
                  </div>
                  <div className={styles.detalleCampo}>
                    <label>Versión:</label>
                    <p>v{historialSeleccionado.version || 1}</p>
                  </div>
                  <div className={styles.detalleCampo}>
                    <label>Fecha:</label>
                    <p>{formatearFecha(historialSeleccionado.fechaCambio)}</p>
                  </div>
                </div>
              </div>

              <div className={styles.seccionModal}>
                <h3>Usuario Responsable</h3>
                <div className={styles.detallesGrid}>
                  <div className={styles.detalleCampo}>
                    <label>Nombre:</label>
                    <p>
                      {historialSeleccionado.nombreUsuarioResponsable ||
                        "Sistema"}
                    </p>
                  </div>
                  {historialSeleccionado.emailUsuario && (
                    <div className={styles.detalleCampo}>
                      <label>Email:</label>
                      <p>{historialSeleccionado.emailUsuario}</p>
                    </div>
                  )}
                  {historialSeleccionado.ipOrigen && (
                    <div className={styles.detalleCampo}>
                      <label>IP:</label>
                      <p>{historialSeleccionado.ipOrigen}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.seccionModal}>
                <h3>Transición</h3>
                <div className={styles.transicionVisual}>
                  <div className={styles.estadoBox}>
                    <label>Anterior</label>
                    <p>{historialSeleccionado.estadoAnterior || "N/A"}</p>
                  </div>
                  <div className={styles.flecha}>→</div>
                  <div className={styles.estadoBox}>
                    <label>Nuevo</label>
                    <p>{historialSeleccionado.estadoNuevo}</p>
                  </div>
                </div>
              </div>

              {historialSeleccionado.datosAnteriores && (
                <div className={styles.seccionModal}>
                  <h3>Datos Anteriores</h3>
                  {(() => {
                    try {
                      return renderizarDatosEntidad(
                        JSON.parse(historialSeleccionado.datosAnteriores),
                        historialSeleccionado.tipoEntidad
                      );
                    } catch {
                      return (
                        <pre className={styles.jsonViewer}>
                          {historialSeleccionado.datosAnteriores}
                        </pre>
                      );
                    }
                  })()}
                </div>
              )}

              {historialSeleccionado.datosNuevos && (
                <div className={styles.seccionModal}>
                  <h3>Datos Nuevos</h3>
                  {(() => {
                    try {
                      return renderizarDatosEntidad(
                        JSON.parse(historialSeleccionado.datosNuevos),
                        historialSeleccionado.tipoEntidad
                      );
                    } catch {
                      return (
                        <pre className={styles.jsonViewer}>
                          {historialSeleccionado.datosNuevos}
                        </pre>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              {tieneReporteDisponible(historialSeleccionado.tipoEntidad) && (
                <button
                  className={styles.btnVerReporte}
                  onClick={() => {
                    verReporte(
                      historialSeleccionado.tipoEntidad,
                      historialSeleccionado.idEntidad
                    );
                    setHistorialSeleccionado(null);
                  }}
                >
                  <ExternalLink size={18} />
                  Ver Reporte
                </button>
              )}
              <button
                className={styles.btnCerrarModal}
                onClick={() => setHistorialSeleccionado(null)}
              >
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
