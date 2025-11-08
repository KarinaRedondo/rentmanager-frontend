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
  FileText,
} from "react-feather";

// ========================================
// DASHBOARD DE CONTADOR
// ========================================
//
// Panel principal financiero para rol Contador con métricas, pagos recientes y facturas pendientes.
// Dashboard especializado en gestión contable y financiera.
//
// FUNCIONALIDADES:
// - Visualización de estadísticas financieras del mes actual.
// - Listado de pagos recientes ordenados por fecha.
// - Listado de facturas pendientes y vencidas.
// - Navegación a secciones completas de pagos y facturas.
// - Cálculo automático de días vencidos en facturas.
//
// SEGURIDAD:
// - verificarAcceso(): Valida autenticación y rol CONTADOR exclusivamente.
// - Redirección a login si no hay sesión.
// - Redirección a home si rol no es CONTADOR.
//
// ESTADO:
// - pagos: Lista completa de pagos del sistema.
// - facturas: Lista completa de facturas.
// - cargando: Indica operación de carga en curso.
// - error: Mensaje de error si falla carga.
// - filtroMeses: Variable declarada pero no utilizada (6 meses por defecto).
//
// FUNCIONES DE CARGA:
// - cargarDatosIniciales(): Carga paralela de pagos y facturas con Promise.allSettled.
// - cargarPagos(): Obtiene lista de pagos, retorna array vacío si falla.
// - cargarFacturas(): Obtiene lista de facturas, retorna array vacío si falla.
//
// CÁLCULO DE ESTADÍSTICAS:
//
// calcularEstadisticas():
// - Ingresos del mes: Suma de pagos VERIFICADO del mes actual.
// - Pagos procesados: Cantidad de pagos VERIFICADO del mes actual.
// - Pagos pendientes: Cantidad de pagos con estado PENDIENTE.
// - Pagos rechazados: Cantidad de pagos con estado RECHAZADO.
// - Filtra por mes y año actual usando fechaCreacion.
//
// obtenerPagosRecientes():
// - Ordena pagos por fechaCreacion descendente.
// - Toma los 4 más recientes.
// - Extrae datos: ID, inquilino (nombre completo), propiedad (dirección), monto, método, referencia, fecha, estado.
// - Maneja casos sin inquilino o propiedad con fallbacks.
//
// obtenerFacturasPendientes():
// - Filtra facturas con estado PENDIENTE o GENERADA.
// - Ordena por fecha de vencimiento ascendente.
// - Toma las 3 primeras.
// - Calcula días vencidos: Diferencia entre fecha actual y fecha vencimiento.
// - Extrae datos: ID, inquilino, propiedad, monto, fecha vencimiento, días vencidos, estado.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato DD/MM/AAAA.
// - formatearMoneda(): Formatea números con separadores de miles.
//
// COMPONENTES VISUALES:
//
// Estadísticas (Grid 4 columnas):
// 1. Ingresos Totales: Suma de pagos verificados del mes.
// 2. Pagos Procesados: Cantidad de pagos verificados del mes.
// 3. Pagos Pendientes: Cantidad de pagos pendientes totales.
// 4. Pagos Rechazados: Cantidad de pagos rechazados totales.
//
// Pagos Recientes:
// - Lista de 4 últimos pagos con cards.
// - Icono coloreado según estado (verde: VERIFICADO, rojo: RECHAZADO, naranja: PENDIENTE).
// - Información: Inquilino, propiedad, método, referencia, monto, estado, fecha.
// - Botón "Ver todos" navega a /contador/pagos.
//
// Facturas Pendientes:
// - Lista de 3 facturas pendientes/vencidas.
// - Indicador coloreado (rojo: vencida, naranja: pendiente).
// - Información: Inquilino, propiedad, fecha vencimiento, días vencidos (si aplica), monto, estado.
// - Badge rojo si vencida, naranja si pendiente.
// - Botón "Ver todas" navega a /contador/facturas.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando información financiera...".
// - Error: Mensaje y botón reintentar.
// - Badges coloreados: Verde (VERIFICADO), Rojo (RECHAZADO/VENCIDA), Naranja (PENDIENTE).
//
// LÓGICA DE NEGOCIO:
// - Fecha actual como referencia para cálculos.
// - Filtrado por mes/año actual para métricas mensuales.
// - Cálculo de días vencidos: Solo positivos, si es negativo muestra 0.
// - Estados normalizados a mayúsculas para comparación.
//
// NAVEGACIÓN:
// - A pagos completos: /contador/pagos
// - A facturas completas: /contador/facturas
//
// LIMITACIONES:
// - Variable filtroMeses declarada pero no implementada.
// - No hay filtros de rango de fechas.
// - No hay gráficas de tendencias.
// - Estadísticas solo del mes actual.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para estadísticas.
// - Grid doble columna para pagos y facturas.
// - Iconos con colores semánticos.
// - Cards con hover effects.

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
        console.error("No hay sesión activa");
        navigate("/login");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const rolUsuario = usuario.rol || usuario.tipoUsuario;

      if (rolUsuario !== "CONTADOR" && rolUsuario !== TipoUsuario.CONTADOR) {
        console.error("Acceso denegado: usuario no es contador");
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarDatosIniciales();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
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

        const nombreCompleto = inquilino
          ? `${inquilino.nombre || ""} ${inquilino.apellido || ""}`.trim()
          : "Sin inquilino";

        return {
          id: pago.idPago || 0,
          inquilino: nombreCompleto,
          propiedad:
            (contrato as any)?.direccionPropiedad || propiedad?.direccion || "",
          monto: pago.monto || 0,
          metodo: pago.metodoPago || "",
          referencia: pago.referenciaTransaccion || "",
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
        const fechaA = new Date(
          a.fechaVencimiento || a.fechaEmision || ""
        ).getTime();
        const fechaB = new Date(
          b.fechaVencimiento || b.fechaEmision || ""
        ).getTime();
        return fechaA - fechaB;
      })
      .slice(0, 3)
      .map((factura) => {
        const contrato = factura.contrato;
        const propiedad = contrato?.propiedad;
        const inquilino = contrato?.inquilino;

        const nombreCompleto = inquilino
          ? `${inquilino.nombre || ""} ${inquilino.apellido || ""}`.trim()
          : "Sin inquilino";

        const diasVencidos = Math.floor(
          (new Date().getTime() -
            new Date(factura.fechaVencimiento || "").getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          id: factura.idFactura || 0,
          inquilino: nombreCompleto,
          propiedad:
            (contrato as any)?.direccionPropiedad || propiedad?.direccion || "",
          monto: factura.total || 0,
          fechaVencimiento:
            factura.fechaVencimiento || factura.fechaEmision || "",
          diasVencidos: diasVencidos > 0 ? diasVencidos : 0,
          estado: String(factura.estado).toUpperCase(),
        };
      });
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("es-CO", {
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
            <BotonComponente
              label="Reintentar"
              onClick={cargarDatosIniciales}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = calcularEstadisticas();
  const pagosRecientes = obtenerPagosRecientes();
  const facturasPendientes = obtenerFacturasPendientes();

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
            <div className={styles.botonesAccion}></div>
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
                <p className={styles.descripcionEstadistica}>
                  Requieren procesamiento
                </p>
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
                <p className={styles.descripcionEstadistica}>
                  Pagos con problemas
                </p>
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
                <button
                  className={styles.btnLink}
                  onClick={() => navigate("/contador/pagos")}
                >
                  Ver todos
                </button>
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
                        <p className={styles.nombreInquilino}>
                          {pago.inquilino}
                        </p>
                        <p className={styles.propiedadPago}>{pago.propiedad}</p>
                        <p className={styles.detallePago}>
                          {pago.metodo} • {pago.referencia}
                        </p>
                      </div>
                    </div>
                    <div className={styles.infoPagoDer}>
                      <p className={styles.montoPago}>
                        {formatearMoneda(pago.monto)}
                      </p>
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
                      <p className={styles.fechaPago}>
                        {formatearFecha(pago.fecha)}
                      </p>
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
                <button
                  className={styles.btnLink}
                  onClick={() => navigate("/contador/facturas")}
                >
                  Ver todas
                </button>
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
                        <p className={styles.nombreInquilino}>
                          {factura.inquilino}
                        </p>
                        <p className={styles.propiedadFactura}>
                          {factura.propiedad}
                        </p>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContadorDashboard;
