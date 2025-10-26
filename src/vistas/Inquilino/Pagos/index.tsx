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
  Download,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
} from "react-feather";

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
