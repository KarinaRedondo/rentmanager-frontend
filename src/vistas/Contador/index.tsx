import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../componentes/Header";
import Footer from "../../componentes/Footer";
import { BotonComponente } from "../../componentes/ui/Boton";
import { obtenerPagos } from "../../servicios/pagos";
import { obtenerFacturas } from "../../servicios/facturas";
import type { DTOPagoRespuesta } from "../../modelos/types/Pago";
import type { DTOFacturaRespuesta } from "../../modelos/types/Factura";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";
import styles from "./ContadorDashboard.module.css";
import {
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Filter,
  Download,
  BarChart2,
  FileText,
} from "react-feather";

const ContadorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [pagos, setPagos] = useState<DTOPagoRespuesta[]>([]);
  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filtroMeses, setFiltroMeses] = useState<number>(6);

  useEffect(() => {
    verificarAcceso();
  }, []);

  const verificarAcceso = async () => {
    try {
      const usuarioString = localStorage.getItem("usuario");
      const token = localStorage.getItem("token");

      if (!usuarioString || !token) {
        console.error("❌ No hay sesión activa");
        navigate("/login");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const rolUsuario = usuario.rol || usuario.tipoUsuario;

      if (rolUsuario !== "CONTADOR" && rolUsuario !== TipoUsuario.CONTADOR) {
        console.error("🚫 Acceso denegado: usuario no es contador");
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      console.log("✅ Acceso verificado - Contador:", usuario.nombre);
      await cargarDatosIniciales();
    } catch (err: any) {
      console.error("❌ Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError("");

      const resultados = await Promise.allSettled([
        cargarPagos(),
        cargarFacturas(),
      ]);

      if (resultados[0].status === "fulfilled") {
        setPagos(resultados[0].value);
      } else {
        setPagos([]);
      }

      if (resultados[1].status === "fulfilled") {
        setFacturas(resultados[1].value);
      } else {
        setFacturas([]);
      }
    } catch (err: any) {
      setError("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  const cargarPagos = async (): Promise<DTOPagoRespuesta[]> => {
    try {
      const data = await obtenerPagos();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  };

  const cargarFacturas = async (): Promise<DTOFacturaRespuesta[]> => {
    try {
      const data = await obtenerFacturas();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  };

  // ============================================
  // CALCULAR ESTADÍSTICAS
  // ============================================
  const calcularEstadisticas = () => {
    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();

    // Ingresos totales del mes actual
    const ingresosMes = pagos
      .filter((p) => {
        const fecha = new Date((p as any).fechaCreacion || "");
        return (
          fecha.getMonth() === mesActual &&
          fecha.getFullYear() === añoActual &&
          String(p.estado).toUpperCase() === "VERIFICADO"
        );
      })
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    // Pagos procesados este mes
    const pagosProcesados = pagos.filter((p) => {
      const fecha = new Date((p as any).fechaCreacion || "");
      return (
        fecha.getMonth() === mesActual &&
        fecha.getFullYear() === añoActual &&
        String(p.estado).toUpperCase() === "VERIFICADO"
      );
    }).length;

    // Pagos pendientes
    const pagosPendientes = pagos.filter((p) => {
      const estado = String(p.estado).toUpperCase();
      return estado === "PENDIENTE";
    }).length;

    // Pagos rechazados
    const pagosRechazados = pagos.filter((p) => {
      const estado = String(p.estado).toUpperCase();
      return estado === "RECHAZADO";
    }).length;

    return {
      ingresosMes,
      pagosProcesados,
      pagosPendientes,
      pagosRechazados,
    };
  };

  // ============================================
  // OBTENER PAGOS RECIENTES
  // ============================================
  const obtenerPagosRecientes = () => {
    return pagos
      .sort((a, b) => {
        const fechaA = new Date((a as any).fechaCreacion || "").getTime();
        const fechaB = new Date((b as any).fechaCreacion || "").getTime();
        return fechaB - fechaA;
      })
      .slice(0, 4)
      .map((pago) => {
        const factura = pago.factura;
        const contrato = factura?.contrato;
        const propiedad = contrato?.propiedad;
        const inquilino = contrato?.inquilino;

        return {
          id: pago.idPago || 0,
          inquilino: inquilino?.nombre || "N/A",
          propiedad:
            (contrato as any)?.direccionPropiedad ||
            propiedad?.direccion ||
            "N/A",
          monto: pago.monto || 0,
          metodo: pago.metodoPago || "N/A",
          referencia: pago.referenciaTransaccion || "N/A",
          fecha: (pago as any).fechaCreacion || "",
          estado: String(pago.estado || "PENDIENTE").toUpperCase(),
        };
      });
  };

  // ============================================
  // OBTENER FACTURAS PENDIENTES
  // ============================================
  const obtenerFacturasPendientes = () => {
    return facturas
      .filter((f) => {
        const estado = String(f.estado).toUpperCase();
        return estado === "PENDIENTE" || estado === "GENERADA";
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fechaVencimiento || a.fechaEmision || "").getTime();
        const fechaB = new Date(b.fechaVencimiento || b.fechaEmision || "").getTime();
        return fechaA - fechaB;
      })
      .slice(0, 3)
      .map((factura) => {
        const contrato = factura.contrato;
        const propiedad = contrato?.propiedad;
        const inquilino = contrato?.inquilino;

        const diasVencidos = Math.floor(
          (new Date().getTime() -
            new Date(factura.fechaVencimiento || "").getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          id: factura.idFactura || 0,
          inquilino: inquilino?.nombre || "N/A",
          propiedad:
            (contrato as any)?.direccionPropiedad ||
            propiedad?.direccion ||
            "N/A",
          monto: factura.total || 0,
          fechaVencimiento: factura.fechaVencimiento || factura.fechaEmision || "",
          diasVencidos: diasVencidos > 0 ? diasVencidos : 0,
          estado: String(factura.estado).toUpperCase(),
        };
      });
  };

  // ============================================
  // OBTENER INGRESOS MENSUALES
  // ============================================
  const obtenerIngresosMensuales = () => {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const mesActual = new Date().getMonth();
    const añoActual = new Date().getFullYear();

    const ingresosPorMes = [];

    for (let i = filtroMeses - 1; i >= 0; i--) {
      let mes = mesActual - i;
      let año = añoActual;

      if (mes < 0) {
        mes += 12;
        año -= 1;
      }

      const ingresos = pagos
        .filter((p) => {
          const fecha = new Date((p as any).fechaCreacion || "");
          return (
            fecha.getMonth() === mes &&
            fecha.getFullYear() === año &&
            String(p.estado).toUpperCase() === "VERIFICADO"
          );
        })
        .reduce((sum, p) => sum + (p.monto || 0), 0);

      ingresosPorMes.push({
        mes: meses[mes],
        ingresos,
      });
    }

    return ingresosPorMes;
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatearMoneda = (monto: number): string => {
    return `$${monto.toLocaleString("es-CO")}`;
  };

  if (cargando) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando información financiera...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.main}>
          <div className={styles.errorContenedor}>
            <h2>Error al cargar datos</h2>
            <p className={styles.error}>{error}</p>
            <BotonComponente label="Reintentar" onClick={cargarDatosIniciales} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = calcularEstadisticas();
  const pagosRecientes = obtenerPagosRecientes();
  const facturasPendientes = obtenerFacturasPendientes();
  const ingresosMensuales = obtenerIngresosMensuales();
  const maxIngresos = Math.max(...ingresosMensuales.map((m) => m.ingresos));

  return (
    <div className={styles.dashboard}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <div>
              <h1>Panel Financiero</h1>
              <p className={styles.subtitulo}>
                Gestiona facturación, pagos y genera reportes financieros
              </p>
            </div>
            <div className={styles.botonesAccion}>
              <button className={styles.btnSecundario}>
                <Filter size={18} />
                Filtros
              </button>
              <button className={styles.btnSecundario}>
                <Download size={18} />
                Exportar
              </button>
              <button className={styles.btnPrimario}>
                <BarChart2 size={18} />
                Generar Reporte
              </button>
            </div>
          </div>

          {/* Grid de estadísticas */}
          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <DollarSign size={24} />
              </div>
              <div>
                <p className={styles.tituloEstadistica}>Ingresos Totales</p>
                <h2 className={styles.valorEstadistica}>
                  {formatearMoneda(estadisticas.ingresosMes)}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  <TrendingUp size={14} className={styles.iconoPositivo} />
                  +12% vs mes anterior
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className={styles.tituloEstadistica}>Pagos Procesados</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.pagosProcesados}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  <TrendingUp size={14} className={styles.iconoPositivo} />
                  +8% vs mes anterior
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Clock size={24} />
              </div>
              <div>
                <p className={styles.tituloEstadistica}>Pagos Pendientes</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.pagosPendientes}
                </h2>
                <p className={styles.descripcionEstadistica}>Requieren procesamiento</p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <XCircle size={24} />
              </div>
              <div>
                <p className={styles.tituloEstadistica}>Pagos Rechazados</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.pagosRechazados}
                </h2>
                <p className={styles.descripcionEstadistica}>Pagos con problemas</p>
              </div>
            </div>
          </div>

          {/* Grid: Pagos Recientes y Facturas Pendientes */}
          <div className={styles.gridDobleColumna}>
            {/* Pagos Recientes */}
            <div className={styles.tarjetaSeccion}>
              <div className={styles.headerSeccion}>
                <div>
                  <h3>
                    <DollarSign size={20} /> Pagos Recientes
                  </h3>
                  <p>Últimos pagos procesados y pendientes</p>
                </div>
                <button className={styles.btnLink}>Ver todos</button>
              </div>

              <div className={styles.listaPagos}>
                {pagosRecientes.map((pago) => (
                  <div key={pago.id} className={styles.itemPago}>
                    <div className={styles.infoPagoIzq}>
                      <div
                        className={`${styles.iconoEstado} ${
                          pago.estado === "VERIFICADO"
                            ? styles.iconoVerde
                            : pago.estado === "RECHAZADO"
                            ? styles.iconoRojo
                            : styles.iconoNaranja
                        }`}
                      >
                        {pago.estado === "VERIFICADO" ? (
                          <CheckCircle size={16} />
                        ) : pago.estado === "RECHAZADO" ? (
                          <XCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>
                      <div>
                        <p className={styles.nombreInquilino}>{pago.inquilino}</p>
                        <p className={styles.propiedadPago}>{pago.propiedad}</p>
                        <p className={styles.detallePago}>
                          {pago.metodo} • {pago.referencia}
                        </p>
                      </div>
                    </div>
                    <div className={styles.infoPagoDer}>
                      <p className={styles.montoPago}>{formatearMoneda(pago.monto)}</p>
                      <span
                        className={`${styles.badge} ${
                          pago.estado === "VERIFICADO"
                            ? styles.badgeVerde
                            : pago.estado === "RECHAZADO"
                            ? styles.badgeRojo
                            : styles.badgeNaranja
                        }`}
                      >
                        {pago.estado}
                      </span>
                      <p className={styles.fechaPago}>{formatearFecha(pago.fecha)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facturas Pendientes */}
            <div className={styles.tarjetaSeccion}>
              <div className={styles.headerSeccion}>
                <div>
                  <h3>
                    <FileText size={20} /> Facturas Pendientes
                  </h3>
                  <p>Facturas por cobrar y vencidas</p>
                </div>
                <button className={styles.btnLink}>Ver todas</button>
              </div>

              <div className={styles.listaFacturas}>
                {facturasPendientes.map((factura) => (
                  <div key={factura.id} className={styles.itemFactura}>
                    <div className={styles.infoFacturaIzq}>
                      <div
                        className={`${styles.indicadorFactura} ${
                          factura.diasVencidos > 0
                            ? styles.indicadorRojo
                            : styles.indicadorNaranja
                        }`}
                      ></div>
                      <div>
                        <p className={styles.nombreInquilino}>{factura.inquilino}</p>
                        <p className={styles.propiedadFactura}>{factura.propiedad}</p>
                        <p className={styles.detalleFactura}>
                          Vence: {formatearFecha(factura.fechaVencimiento)}
                          {factura.diasVencidos > 0 && (
                            <span className={styles.vencida}>
                              {" "}
                              ({factura.diasVencidos} días vencida)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={styles.infoFacturaDer}>
                      <p className={styles.montoFactura}>
                        {formatearMoneda(factura.monto)}
                      </p>
                      <span
                        className={`${styles.badge} ${
                          factura.diasVencidos > 0
                            ? styles.badgeRojo
                            : styles.badgeNaranja
                        }`}
                      >
                        {factura.diasVencidos > 0 ? "VENCIDA" : "PENDIENTE"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ingresos Mensuales */}
          <div className={styles.tarjetaSeccion}>
            <div className={styles.headerSeccion}>
              <div>
                <h3>
                  <TrendingUp size={20} /> Ingresos Mensuales
                </h3>
                <p>Evolución de ingresos en los últimos {filtroMeses} meses</p>
              </div>
              <select
                className={styles.selectFiltro}
                value={filtroMeses}
                onChange={(e) => setFiltroMeses(Number(e.target.value))}
              >
                <option value={6}>Últimos 6 meses</option>
                <option value={12}>Últimos 12 meses</option>
              </select>
            </div>

            <div className={styles.graficoBarras}>
              {ingresosMensuales.map((mes, index) => {
                const porcentaje = maxIngresos > 0 ? (mes.ingresos / maxIngresos) * 100 : 0;

                return (
                  <div key={index} className={styles.barraContenedor}>
                    <div className={styles.barraWrapper}>
                      <div
                        className={styles.barra}
                        style={{ height: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <p className={styles.labelMes}>{mes.mes}</p>
                    <p className={styles.valorMes}>
                      {formatearMoneda(mes.ingresos)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla de Procesamiento */}
          <div className={styles.tarjetaSeccion}>
            <div className={styles.headerSeccion}>
              <div>
                <h3>Procesamiento de Pagos</h3>
                <p>Gestiona y procesa los pagos pendientes</p>
              </div>
              <select className={styles.selectFiltro}>
                <option>Todos</option>
                <option>Pendientes</option>
                <option>Procesados</option>
                <option>Rechazados</option>
              </select>
            </div>

            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Inquilino</th>
                    <th>Propiedad</th>
                    <th>Monto</th>
                    <th>Método</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosRecientes.slice(0, 5).map((pago) => (
                    <tr key={pago.id}>
                      <td>{pago.inquilino}</td>
                      <td>{pago.propiedad}</td>
                      <td className={styles.montoTabla}>
                        {formatearMoneda(pago.monto)}
                      </td>
                      <td>{pago.metodo}</td>
                      <td>{formatearFecha(pago.fecha)}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            pago.estado === "VERIFICADO"
                              ? styles.badgeVerde
                              : pago.estado === "RECHAZADO"
                              ? styles.badgeRojo
                              : styles.badgeNaranja
                          }`}
                        >
                          {pago.estado}
                        </span>
                      </td>
                      <td>
                        <button className={styles.btnTabla}>Ver</button>
                        {pago.estado === "PENDIENTE" && (
                          <>
                            <button className={styles.btnTabla}>Aprobar</button>
                            <button className={styles.btnTabla}>Rechazar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContadorDashboard;
