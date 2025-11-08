import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { obtenerPagos } from "../../../servicios/pagos";
import type { DTOPagoRespuesta } from "../../../modelos/types/Pago";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import styles from "./InquilinoHistorialPagos.module.css";
import {
  DollarSign,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from "react-feather";

// ========================================
// HISTORIAL DE PAGOS - ROL INQUILINO
// ========================================
//
// Vista completa del historial de pagos del inquilino con filtros avanzados y estadísticas.
// Permite consultar todos los pagos realizados y su estado actual.
//
// FUNCIONALIDADES:
// - Listado completo de pagos del inquilino en tabla.
// - Filtrado por búsqueda (referencia o monto).
// - Filtrado por estado del pago.
// - Filtrado por rango de fecha (hoy, semana, mes, trimestre).
// - Estadísticas agregadas: Total pagado, total pendiente, total de pagos.
// - Ordenamiento automático por fecha (más reciente primero).
// - Navegación a detalle de pago.
// - Botón para limpiar filtros.
//
// SEGURIDAD:
// - verificarAcceso(): Valida autenticación y rol INQUILINO exclusivamente.
// - Redirección a login si no hay sesión.
// - Redirección a home si rol no es INQUILINO.
//
// ESTADO:
// - pagos: Lista completa de pagos.
// - pagosFiltrados: Subset filtrado según criterios.
// - cargando: Indica carga inicial.
// - error: Mensaje de error.
// - busqueda: Texto de búsqueda.
// - filtroEstado: Estado seleccionado ("TODOS", "COMPLETADO", "PENDIENTE", etc).
// - filtroFecha: Rango de fecha seleccionado ("TODOS", "HOY", "SEMANA", "MES", "TRIMESTRE").
//
// FUNCIONES PRINCIPALES:
//
// cargarPagos():
// - Obtiene todos los pagos con obtenerPagos().
// - Logging para debugging de estructura.
// - Maneja arrays vacíos.
//
// aplicarFiltros():
// - Se ejecuta automáticamente al cambiar pagos, busqueda, filtroEstado o filtroFecha.
// - **Filtro por búsqueda**:
//   * Busca en referenciaTransaccion (case insensitive)
//   * Busca en monto convertido a string
// - **Filtro por estado**:
//   * Normaliza a mayúsculas
//   * Compara con estado seleccionado
// - **Filtro por fecha** (usando pago.fecha):
//   * HOY: diff === 0 días
//   * SEMANA: diff <= 7 días
//   * MES: diff <= 30 días
//   * TRIMESTRE: diff <= 90 días
//   * Calcula diferencia con fecha actual en días
// - **Ordenamiento**:
//   * Por pago.fecha descendente (más reciente primero)
//   * Usa getTime() para comparación numérica
//
// calcularEstadisticas():
// - Total pagado: Suma de pagos con estado COMPLETADO.
// - Total pendiente: Suma de pagos con estado PENDIENTE.
// - Total pagos: Cantidad total de pagos.
// - Pagos verificados: Cantidad con estado COMPLETADO.
//
// limpiarFiltros():
// - Resetea todos los filtros a valores default.
// - busqueda: ""
// - filtroEstado: "TODOS"
// - filtroFecha: "TODOS"
//
// UTILIDADES:
//
// formatearFecha():
// - Convierte ISO a formato largo con hora (ej: "15 de enero de 2025, 14:30").
// - Validación robusta: isNaN(date.getTime()).
// - Try-catch con mensajes de error descriptivos.
// - Logging de errores en consola.
//
// formatearMoneda():
// - Formatea con separadores de miles.
// - Prefijo $ sin espacio.
//
// obtenerIconoEstado():
// - COMPLETADO/VERIFICADO: CheckCircle
// - FALLIDO/CANCELADO: XCircle
// - Default (PENDIENTE/PROCESANDO): Clock
//
// obtenerClaseEstado():
// - COMPLETADO/VERIFICADO: Verde (estadoVerificado)
// - FALLIDO/CANCELADO: Rojo (estadoRechazado)
// - Default: Naranja (estadoPendiente)
//
// COMPONENTES VISUALES:
//
// Encabezado:
// - Botón volver (navigate(-1)).
// - Título "Historial de Pagos".
// - Subtítulo descriptivo.
//
// Estadísticas (Grid 3 columnas):
// 1. Total Pagado: Monto con cantidad de verificados.
// 2. Total Pendiente: Monto con descripción.
// 3. Total de Pagos: Cantidad total.
//
// Filtros:
// - Barra de búsqueda: Input con icono Search.
// - Select estado: Todos, Completado, Pendiente, Procesando, Fallido, Cancelado.
// - Select fecha: Todas, Hoy, Última semana, Último mes, Último trimestre.
// - Botón "Limpiar filtros": Solo visible si hay filtros activos.
//
// Tabla:
// - Header con título y contador de registros.
// - Columnas:
//   * Fecha (con icono Calendar y formateo con hora)
//   * Referencia (referenciaTransaccion)
//   * Método (metodoPago)
//   * Propiedad (dirección extraída de pago → factura → contrato → propiedad)
//   * Monto (formateado)
//   * Estado (badge con icono y color)
//   * Acciones (botón "Ver detalle")
// - Estado vacío si no hay resultados.
//
// NAVEGACIÓN:
// - Volver: navigate(-1) (página anterior)
// - Ver detalle: /inquilino/pagos/{id}
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando historial de pagos...".
// - Error: Mensaje y botón reintentar.
// - Sin datos: Icono FileText con mensaje.
//
// CARACTERÍSTICAS DESTACADAS:
// - **Uso correcto de pago.fecha**: Todos los filtros y ordenamientos usan pago.fecha.
// - **Comentarios de corrección**: Marcados con ":" para indicar cambios.
// - **Filtros combinables**: Búsqueda + estado + fecha funcionan simultáneamente.
// - **Logging para debugging**: Console.log de datos obtenidos y errores.
// - **Validación robusta de fechas**: Manejo de fechas inválidas.
// - **Extracción de datos anidados**: Acceso seguro con optional chaining.
//
// CÁLCULO DE DIFERENCIA DE FECHAS:
// - Resta timestamps en milisegundos.
// - Divide por (1000 * 60 * 60 * 24) para obtener días.
// - Floor para redondear hacia abajo.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para estadísticas.
// - Tabla con scroll horizontal en móviles.
// - Badges coloreados con iconos.
// - Botón "Limpiar filtros" condicional.

const InquilinoHistorialPagos: React.FC = () => {
  const navigate = useNavigate();

  const [pagos, setPagos] = useState<DTOPagoRespuesta[]>([]);
  const [pagosFiltrados, setPagosFiltrados] = useState<DTOPagoRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroFecha, setFiltroFecha] = useState<string>("TODOS");

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [pagos, busqueda, filtroEstado, filtroFecha]);

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

      if (rolUsuario !== "INQUILINO" && rolUsuario !== TipoUsuario.INQUILINO) {
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarPagos();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarPagos = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerPagos();
      console.log("Pagos obtenidos:", data); // Debug: Ver estructura de datos
      setPagos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error al cargar pagos:", err);
      setError("Error al cargar el historial de pagos");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...pagos];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter((pago) => {
        const referencia = (pago.referenciaTransaccion || "").toLowerCase();
        const monto = (pago.monto || 0).toString();
        return (
          referencia.includes(busqueda.toLowerCase()) ||
          monto.includes(busqueda)
        );
      });
    }

    // Filtro por estado
    if (filtroEstado !== "TODOS") {
      resultado = resultado.filter((pago) => {
        const estado = String(pago.estado || "").toUpperCase();
        return estado === filtroEstado;
      });
    }

    //  : Filtro por fecha usando pago.fecha
    if (filtroFecha !== "TODOS") {
      const hoy = new Date();
      resultado = resultado.filter((pago) => {
        //  Usar pago.fecha en lugar de fechaCreacion
        const fechaPago = new Date(pago.fecha || "");
        const diff = Math.floor(
          (hoy.getTime() - fechaPago.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filtroFecha) {
          case "HOY":
            return diff === 0;
          case "SEMANA":
            return diff <= 7;
          case "MES":
            return diff <= 30;
          case "TRIMESTRE":
            return diff <= 90;
          default:
            return true;
        }
      });
    }

    //  Ordenar por fecha usando pago.fecha
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fecha || "").getTime();
      const fechaB = new Date(b.fecha || "").getTime();
      return fechaB - fechaA;
    });

    setPagosFiltrados(resultado);
  };

  const calcularEstadisticas = () => {
    const totalPagado = pagos
      .filter((p) => String(p.estado).toUpperCase() === "COMPLETADO")
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    const totalPendiente = pagos
      .filter((p) => String(p.estado).toUpperCase() === "PENDIENTE")
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    const totalPagos = pagos.length;

    const pagosVerificados = pagos.filter(
      (p) => String(p.estado).toUpperCase() === "COMPLETADO"
    ).length;

    return {
      totalPagado,
      totalPendiente,
      totalPagos,
      pagosVerificados,
    };
  };

  const obtenerIconoEstado = (estado: string) => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "COMPLETADO":
      case "VERIFICADO":
        return <CheckCircle size={18} />;
      case "FALLIDO":
      case "CANCELADO":
        return <XCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  const obtenerClaseEstado = (estado: string) => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "COMPLETADO":
      case "VERIFICADO":
        return styles.estadoVerificado;
      case "FALLIDO":
      case "CANCELADO":
        return styles.estadoRechazado;
      default:
        return styles.estadoPendiente;
    }
  };

  // Formatear fecha con manejo de errores
  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";

    try {
      const date = new Date(fecha);

      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
  };

  const formatearMoneda = (monto: number): string => {
    return `$${monto.toLocaleString("es-CO")}`;
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("TODOS");
    setFiltroFecha("TODOS");
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando historial de pagos...</p>
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
          <div className={styles.errorContenedor}>
            <h2>Error al cargar datos</h2>
            <p className={styles.error}>{error}</p>
            <BotonComponente label="Reintentar" onClick={cargarPagos} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = calcularEstadisticas();

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <div>
              <button className={styles.btnVolver} onClick={() => navigate(-1)}>
                ← Volver
              </button>
              <h1>Historial de Pagos</h1>
              <p className={styles.subtitulo}>
                Consulta todos tus pagos realizados y pendientes
              </p>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Pagado</p>
                <h2 className={styles.valorEstadistica}>
                  {formatearMoneda(estadisticas.totalPagado)}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  {estadisticas.pagosVerificados} pagos verificados
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Clock size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Pendiente</p>
                <h2 className={styles.valorEstadistica}>
                  {formatearMoneda(estadisticas.totalPendiente)}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  En proceso de verificación
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total de Pagos</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.totalPagos}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Registros en el historial
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className={styles.seccionFiltros}>
            <div className={styles.barraBusqueda}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por referencia o monto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.inputBusqueda}
              />
            </div>

            <div className={styles.filtros}>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={styles.selectFiltro}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="COMPLETADO">Completado</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="PROCESANDO">Procesando</option>
                <option value="FALLIDO">Fallido</option>
                <option value="CANCELADO">Cancelado</option>
              </select>

              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className={styles.selectFiltro}
              >
                <option value="TODOS">Todas las fechas</option>
                <option value="HOY">Hoy</option>
                <option value="SEMANA">Última semana</option>
                <option value="MES">Último mes</option>
                <option value="TRIMESTRE">Último trimestre</option>
              </select>

              {(busqueda ||
                filtroEstado !== "TODOS" ||
                filtroFecha !== "TODOS") && (
                <button className={styles.btnLimpiar} onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Tabla de pagos */}
          <div className={styles.tarjetaTabla}>
            <div className={styles.headerTabla}>
              <h3>
                <DollarSign size={20} />
                Historial Completo
              </h3>
              <p>{pagosFiltrados.length} registros encontrados</p>
            </div>

            {pagosFiltrados.length === 0 ? (
              <div className={styles.sinDatos}>
                <FileText size={48} />
                <p>No se encontraron pagos con los filtros seleccionados</p>
              </div>
            ) : (
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Referencia</th>
                      <th>Método</th>
                      <th>Propiedad</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFiltrados.map((pago) => {
                      const factura = pago.factura;
                      const contrato = factura?.contrato;
                      const propiedad = contrato?.propiedad;
                      const direccion = propiedad?.direccion || "N/A";

                      return (
                        <tr key={pago.idPago}>
                          <td>
                            <div className={styles.celdaFecha}>
                              <Calendar size={16} />
                              {/* : Usar pago.fecha */}
                              {formatearFecha(pago.fecha)}
                            </div>
                          </td>
                          <td className={styles.celdaReferencia}>
                            {pago.referenciaTransaccion || "N/A"}
                          </td>
                          <td>{pago.metodoPago || "N/A"}</td>
                          <td className={styles.celdaPropiedad}>{direccion}</td>
                          <td className={styles.celdaMonto}>
                            {formatearMoneda(pago.monto || 0)}
                          </td>
                          <td>
                            <span
                              className={`${styles.badge} ${obtenerClaseEstado(
                                pago.estado || ""
                              )}`}
                            >
                              {obtenerIconoEstado(pago.estado || "")}
                              {pago.estado}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.btnDetalle}
                              onClick={() =>
                                navigate(`/inquilino/pagos/${pago.idPago}`)
                              }
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InquilinoHistorialPagos;
