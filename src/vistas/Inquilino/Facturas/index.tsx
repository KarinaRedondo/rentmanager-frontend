import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { obtenerFacturas } from "../../../servicios/facturas";
import type { DTOFacturaRespuesta } from "../../../modelos/types/Factura";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import styles from "./InquilinoFacturas.module.css";
import {
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  ArrowLeft,
} from "react-feather";

// ========================================
// LISTA DE FACTURAS - ROL INQUILINO
// ========================================
//
// Vista de facturas del inquilino con estadísticas, filtros y acciones de pago.
// Diseñada para consulta y gestión básica de facturas de alquiler.
//
// FUNCIONALIDADES:
// - Listado completo de facturas del inquilino.
// - Ordenamiento por fecha de emisión (más reciente primero).
// - Filtrado por estado: Todas, Pendientes, Pagadas.
// - Estadísticas agregadas: Total, pendientes, pagadas, total pendiente (monetario).
// - Navegación a detalle de factura.
// - Botón "Pagar Ahora" para facturas pendientes/generadas.
// - Grid de cards responsive con diseño visual atractivo.
//
// SEGURIDAD:
// - verificarAcceso(): Valida autenticación y rol INQUILINO exclusivamente.
// - Redirección a login si no hay sesión.
// - Redirección a home si rol no es INQUILINO.
//
// ESTADO:
// - facturas: Lista completa de facturas.
// - facturasFiltradas: Subset filtrado según estado seleccionado.
// - cargando: Indica operación de carga en curso.
// - error: Mensaje de error si falla carga.
// - filtroEstado: Estado seleccionado ("TODAS", "PENDIENTE", "PAGADA").
//
// FUNCIONES PRINCIPALES:
//
// cargarFacturas():
// - Obtiene lista completa con obtenerFacturas().
// - Ordena por fechaEmision descendente (más reciente primero).
// - Maneja arrays vacíos.
// - Logging de facturas cargadas.
//
// aplicarFiltros():
// - Se ejecuta automáticamente al cambiar filtroEstado o facturas.
// - Si estado es "TODAS", muestra todas las facturas.
// - Si no, filtra por estado específico con normalización a mayúsculas.
//
// FORMATEO DE FECHAS:
//
// Todas las funciones de formateo usan parsing manual robusto:
// 1. Split por '-' para obtener [año, mes, día]
// 2. Validación de formato (3 partes)
// 3. Creación de Date con valores numéricos
// 4. Validación de fecha válida con isNaN()
// 5. Formateo con toLocaleDateString("es-CO")
// 6. Manejo de errores con mensajes descriptivos
//
// formatearFecha(): Formato largo (ej: "15 de enero de 2025")
// formatearFechaCorta(): Formato corto (ej: "15/01/2025")
// obtenerNombreMes(): Mes y año (ej: "enero de 2025")
//
// UTILIDADES:
//
// obtenerEstadoClase():
// - Asigna clase CSS según estado de factura.
// - PAGADA/COMPLETADA: Verde
// - PENDIENTE/GENERADA: Naranja
// - VENCIDA: Rojo
// - Default: Naranja
//
// obtenerIconoEstado():
// - Retorna componente React con icono coloreado.
// - PAGADA/COMPLETADA: CheckCircle verde
// - PENDIENTE/GENERADA: Clock naranja
// - VENCIDA: AlertCircle rojo
// - Default: Clock naranja
//
// COMPONENTES VISUALES:
//
// Encabezado:
// - Botón volver al dashboard.
// - Título "Mis Facturas".
// - Subtítulo descriptivo.
//
// Estadísticas (Grid 4 columnas):
// 1. Total Facturas: Cantidad total.
// 2. Pendientes: Cantidad con estado PENDIENTE o GENERADA.
// 3. Pagadas: Cantidad con estado PAGADA o COMPLETADA.
// 4. Total Pendiente: Suma monetaria de facturas pendientes.
//
// Filtros:
// - Icono Filter.
// - Tres botones: Todas, Pendientes, Pagadas.
// - Botón activo con estilo diferenciado.
//
// Grid de Facturas:
// - Cards con diseño visual completo.
// - Header:
//   * ID de factura
//   * Dirección de propiedad
//   * Periodo (mes y año de emisión)
//   * Icono de estado coloreado
// - Cuerpo:
//   * Fecha emisión con icono Calendar
//   * Fecha vencimiento con icono Calendar
//   * Separador visual
//   * Total destacado
//   * Badge de estado
// - Acciones:
//   * Botón "Ver Detalle" (siempre visible)
//   * Botón "Pagar Ahora" (solo si PENDIENTE o GENERADA)
//
// NAVEGACIÓN:
// - A dashboard: /inquilino/dashboard
// - A detalle de factura: /inquilino/facturas/{id}
// - A crear pago: /inquilino/pagos/nuevo
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando facturas...".
// - Error: Icono AlertCircle, mensaje y botón reintentar.
// - Sin facturas: Icono FileText, mensaje informativo.
//
// CARACTERÍSTICAS DESTACADAS:
// - Parsing robusto de fechas con validación múltiple.
// - Manejo de errores descriptivo en fechas.
// - Estadísticas calculadas dinámicamente.
// - Botón "Pagar Ahora" condicional según estado.
// - Diseño visual atractivo con iconos y colores semánticos.
// - Extracción de datos relacionados: contrato → propiedad → dirección.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive de 4 columnas para estadísticas.
// - Grid adaptativo para cards de facturas.
// - Badges y botones con estados hover.
// - Iconos integrados con colores según estado.

const InquilinoFacturas: React.FC = () => {
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState<
    DTOFacturaRespuesta[]
  >([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODAS");

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, facturas]);

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

      await cargarFacturas();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarFacturas = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerFacturas();
      const facturasArray = Array.isArray(data) ? data : [];

      // Ordenar por fecha más reciente
      const facturasOrdenadas = facturasArray.sort((a, b) => {
        const fechaA = a.fechaEmision || "";
        const fechaB = b.fechaEmision || "";
        return fechaB.localeCompare(fechaA);
      });

      setFacturas(facturasOrdenadas);
      console.log("Facturas cargadas:", facturasOrdenadas);
    } catch (err: any) {
      console.error("Error al cargar facturas:", err);
      setError("Error al cargar las facturas");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    if (filtroEstado === "TODAS") {
      setFacturasFiltradas(facturas);
    } else {
      const filtradas = facturas.filter(
        (f) => String(f.estado).toUpperCase() === filtroEstado
      );
      setFacturasFiltradas(filtradas);
    }
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const partes = fecha.split("-");
      if (partes.length !== 3) return "Fecha inválida";

      const [anio, mes, dia] = partes;
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Error en fecha";
    }
  };

  const formatearFechaCorta = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const partes = fecha.split("-");
      if (partes.length !== 3) return "Fecha inválida";

      const [anio, mes, dia] = partes;
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "Error en fecha";
    }
  };

  const obtenerNombreMes = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const partes = fecha.split("-");
      if (partes.length !== 3) return "Mes inválido";

      const [anio, mes, dia] = partes;
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

      if (isNaN(date.getTime())) return "Mes inválido";
      return date.toLocaleDateString("es-CO", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "Error en mes";
    }
  };

  const obtenerEstadoClase = (estado: string): string => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "PAGADA":
      case "COMPLETADA":
        return styles.estadoPagada;
      case "PENDIENTE":
      case "GENERADA":
        return styles.estadoPendiente;
      case "VENCIDA":
        return styles.estadoVencida;
      default:
        return styles.estadoPendiente;
    }
  };

  const obtenerIconoEstado = (estado: string) => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "PAGADA":
      case "COMPLETADA":
        return <CheckCircle size={20} className={styles.iconoVerde} />;
      case "PENDIENTE":
      case "GENERADA":
        return <Clock size={20} className={styles.iconoNaranja} />;
      case "VENCIDA":
        return <AlertCircle size={20} className={styles.iconoRojo} />;
      default:
        return <Clock size={20} className={styles.iconoNaranja} />;
    }
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando facturas...</p>
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
            <AlertCircle size={48} />
            <h2>Error al cargar facturas</h2>
            <p>{error}</p>
            <BotonComponente label="Reintentar" onClick={cargarFacturas} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = {
    total: facturas.length,
    pendientes: facturas.filter((f) => {
      const estado = String(f.estado).toUpperCase();
      return estado === "PENDIENTE" || estado === "GENERADA";
    }).length,
    pagadas: facturas.filter((f) => {
      const estado = String(f.estado).toUpperCase();
      return estado === "PAGADA" || estado === "COMPLETADA";
    }).length,
    totalPendiente: facturas
      .filter((f) => {
        const estado = String(f.estado).toUpperCase();
        return estado === "PENDIENTE" || estado === "GENERADA";
      })
      .reduce((sum, f) => sum + (f.total || 0), 0),
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/inquilino/dashboard")}
            >
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Mis Facturas</h1>
              <p className={styles.subtitulo}>
                Consulta y gestiona tus facturas de alquiler
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Total Facturas</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.total}
                </h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Clock size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Pendientes</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.pendientes}
                </h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Pagadas</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.pagadas}
                </h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <DollarSign size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Total Pendiente</p>
                <h2 className={styles.valorEstadistica}>
                  ${estadisticas.totalPendiente.toLocaleString("es-CO")}
                </h2>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className={styles.seccionFiltros}>
            <div className={styles.filtros}>
              <Filter size={20} />
              <span>Filtrar por estado:</span>
              <div className={styles.grupoFiltros}>
                <button
                  className={
                    filtroEstado === "TODAS"
                      ? styles.filtroActivo
                      : styles.filtroBton
                  }
                  onClick={() => setFiltroEstado("TODAS")}
                >
                  Todas
                </button>
                <button
                  className={
                    filtroEstado === "PENDIENTE"
                      ? styles.filtroActivo
                      : styles.filtroBton
                  }
                  onClick={() => setFiltroEstado("PENDIENTE")}
                >
                  Pendientes
                </button>
                <button
                  className={
                    filtroEstado === "PAGADA"
                      ? styles.filtroActivo
                      : styles.filtroBton
                  }
                  onClick={() => setFiltroEstado("PAGADA")}
                >
                  Pagadas
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Facturas */}
          <div className={styles.listaFacturas}>
            {facturasFiltradas.length === 0 ? (
              <div className={styles.sinFacturas}>
                <FileText size={64} />
                <h3>No hay facturas para mostrar</h3>
                <p>No se encontraron facturas con el filtro seleccionado</p>
              </div>
            ) : (
              <div className={styles.gridFacturas}>
                {facturasFiltradas.map((factura) => {
                  const contrato = factura.contrato;
                  const propiedad = contrato?.propiedad;
                  const direccion =
                    propiedad?.direccion || "Propiedad no identificada";

                  return (
                    <div
                      key={factura.idFactura}
                      className={styles.tarjetaFactura}
                    >
                      <div className={styles.headerFactura}>
                        <div className={styles.infoHeaderFactura}>
                          <h3>Factura #{factura.idFactura}</h3>
                          <p className={styles.propiedadFactura}>{direccion}</p>
                          <p className={styles.periodoFactura}>
                            {obtenerNombreMes(factura.fechaEmision)}
                          </p>
                        </div>
                        <div className={styles.iconoEstadoFactura}>
                          {obtenerIconoEstado(factura.estado || "")}
                        </div>
                      </div>

                      <div className={styles.cuerpoFactura}>
                        <div className={styles.detalleFactura}>
                          <span className={styles.labelDetalle}>
                            <Calendar size={16} />
                            Emisión:
                          </span>
                          <span className={styles.valorDetalle}>
                            {formatearFechaCorta(factura.fechaEmision)}
                          </span>
                        </div>

                        <div className={styles.detalleFactura}>
                          <span className={styles.labelDetalle}>
                            <Calendar size={16} />
                            Vencimiento:
                          </span>
                          <span className={styles.valorDetalle}>
                            {formatearFechaCorta(factura.fechaVencimiento)}
                          </span>
                        </div>

                        <div className={styles.separadorFactura}></div>

                        <div className={styles.totalFactura}>
                          <span className={styles.labelTotal}>Total:</span>
                          <span className={styles.valorTotal}>
                            ${(factura.total || 0).toLocaleString("es-CO")}
                          </span>
                        </div>

                        <span
                          className={obtenerEstadoClase(factura.estado || "")}
                        >
                          {factura.estado}
                        </span>
                      </div>

                      <div className={styles.accionesFactura}>
                        <button
                          className={styles.btnAccion}
                          onClick={() =>
                            navigate(`/inquilino/facturas/${factura.idFactura}`)
                          }
                        >
                          <Eye size={16} />
                          Ver Detalle
                        </button>
                        {(String(factura.estado).toUpperCase() ===
                          "PENDIENTE" ||
                          String(factura.estado).toUpperCase() ===
                            "GENERADA") && (
                          <button
                            className={styles.btnPagar}
                            onClick={() => navigate("/inquilino/pagos/nuevo")}
                          >
                            <DollarSign size={16} />
                            Pagar Ahora
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InquilinoFacturas;
