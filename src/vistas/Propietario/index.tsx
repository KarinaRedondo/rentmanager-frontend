import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../componentes/Header";
import Footer from "../../componentes/Footer";
import { BotonComponente } from "../../componentes/ui/Boton";
import { PropiedadService } from "../../servicios/propiedades";
const { obtenerPropiedades } = PropiedadService;
import { obtenerContratos } from "../../servicios/contratos";
import { obtenerFacturas } from "../../servicios/facturas";
import type { DTOPropiedadRespuesta } from "../../modelos/types/Propiedad";
import type { DTOContratoRespuesta } from "../../modelos/types/Contrato";
import type { DTOFacturaRespuesta } from "../../modelos/types/Factura";
import { EstadoPropiedad } from "../../modelos/enumeraciones/estadoPropiedad";
import { EstadoFactura } from "../../modelos/enumeraciones/estadoFactura";
import { EstadoContrato } from "../../modelos/enumeraciones/estadoContrato";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";
import styles from "./PropietarioDashboard.module.css";
import {
  Home,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  MoreVertical,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
} from "react-feather";

// Imágenes de propiedades por defecto
const IMAGENES_PROPIEDADES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&h=250&fit=crop",
];

const PropietarioDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [propiedades, setPropiedades] = useState<DTOPropiedadRespuesta[]>([]);
  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

  // ============================================
  // CARGAR DATOS AL MONTAR
  // ============================================
  useEffect(() => {
    verificarAcceso();
  }, []);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.menuContainer}`)) {
        setMenuAbierto(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================
  // VERIFICAR ACCESO
  // ============================================
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

      if (rolUsuario !== "PROPIETARIO" && rolUsuario !== TipoUsuario.PROPIETARIO) {
        console.error("🚫 Acceso denegado: usuario no es propietario");
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      console.log("✅ Acceso verificado - Usuario:", usuario.nombre);
      await cargarDatosIniciales();
    } catch (err: any) {
      console.error("❌ Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  // ============================================
  // CARGA INICIAL
  // ============================================
  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError("");

      console.log("🔄 Iniciando carga de datos del propietario...");

      const resultados = await Promise.allSettled([
        cargarPropiedades(),
        cargarContratos(),
        cargarFacturas(),
      ]);

      console.log("📦 Resultados de Promise.allSettled:", resultados);

      // Procesar propiedades
      if (resultados[0].status === "fulfilled") {
        setPropiedades(resultados[0].value);
        console.log("✅ Propiedades cargadas:", resultados[0].value.length, resultados[0].value);
      } else {
        console.warn("⚠️ No se pudieron cargar propiedades:", resultados[0].reason);
        setPropiedades([]);
      }

      // Procesar contratos
      if (resultados[1].status === "fulfilled") {
        setContratos(resultados[1].value);
        console.log("✅ Contratos cargados:", resultados[1].value.length, resultados[1].value);
      } else {
        console.warn("⚠️ No se pudieron cargar contratos:", resultados[1].reason);
        setContratos([]);
      }

      // Procesar facturas
      if (resultados[2].status === "fulfilled") {
        setFacturas(resultados[2].value);
        console.log("✅ Facturas cargadas:", resultados[2].value.length, resultados[2].value);
      } else {
        console.warn("⚠️ No se pudieron cargar facturas:", resultados[2].reason);
        setFacturas([]);
      }

      console.log("📊 Estado final:");
      console.log("  - Propiedades:", propiedades.length);
      console.log("  - Contratos:", contratos.length);
      console.log("  - Facturas:", facturas.length);

      console.log("✅ Carga de datos completada");
    } catch (err: any) {
      console.error("❌ Error al cargar datos:", err);
      setError("Error al cargar los datos del portfolio");
    } finally {
      setCargando(false);
    }
  };

  // ============================================
  // CARGAR DATOS
  // ============================================
  const cargarPropiedades = async (): Promise<DTOPropiedadRespuesta[]> => {
    try {
      console.log("📡 Llamando a obtenerPropiedades()...");
      const data = await obtenerPropiedades();
      console.log("🔍 Propiedades recibidas:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al cargar propiedades:", error);
      return [];
    }
  };

  const cargarContratos = async (): Promise<DTOContratoRespuesta[]> => {
    try {
      console.log("📡 Llamando a obtenerContratos()...");
      const data = await obtenerContratos();
      console.log("🔍 Contratos recibidos:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al cargar contratos:", error);
      return [];
    }
  };

  const cargarFacturas = async (): Promise<DTOFacturaRespuesta[]> => {
    try {
      console.log("📡 Llamando a obtenerFacturas()...");
      const data = await obtenerFacturas();
      console.log("🔍 Facturas recibidas:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Error al cargar facturas:", error);
      return [];
    }
  };

  // ============================================
  // CALCULAR ESTADÍSTICAS
  // ============================================
  const calcularEstadisticas = () => {
    const totalPropiedades = propiedades.length;
    
    const propiedadesArrendadas = propiedades.filter(
      (p) => p.estado === EstadoPropiedad.ARRENDADA
    ).length;

    const ingresosMes = facturas
      .filter((f) => {
        if (!f.fechaEmision) return false;
        const fecha = new Date(f.fechaEmision);
        const mesActual = new Date().getMonth();
        return fecha.getMonth() === mesActual && f.estado === EstadoFactura.PAGADA;
      })
      .reduce((sum, f) => sum + (f.total || 0), 0);

    const contratosActivos = contratos.filter(
      (c) => c.estado === EstadoContrato.ACTIVO
    ).length;

    // Calcular ocupación
    const disponibles = propiedades.filter(
      (p) => p.estado === EstadoPropiedad.DISPONIBLE
    ).length;

    const mantenimiento = propiedades.filter(
      (p) => p.estado === EstadoPropiedad.EN_MANTENIMIENTO
    ).length;

    const reservadas = propiedades.filter(
      (p) => p.estado === EstadoPropiedad.RESERVADA
    ).length;

    const porcentajeOcupacion = totalPropiedades > 0
      ? Math.round((propiedadesArrendadas / totalPropiedades) * 100)
      : 0;

    return {
      totalPropiedades,
      propiedadesArrendadas,
      ingresosMes,
      contratosActivos,
      disponibles,
      mantenimiento,
      reservadas,
      porcentajeOcupacion,
    };
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleVerPropiedad = (propiedad: DTOPropiedadRespuesta) => {
    setMenuAbierto(null);
    navigate(`/propietario/propiedades/${propiedad.idPropiedad}`);
  };

  const handleEditarPropiedad = (propiedad: DTOPropiedadRespuesta) => {
    setMenuAbierto(null);
    navigate(`/propietario/propiedades/editar/${propiedad.idPropiedad}`);
  };

  const handleVerContrato = (contrato: DTOContratoRespuesta) => {
    setMenuAbierto(null);
    navigate(`/propietario/contratos/${contrato.idContrato}`);
  };

  const handleVerFactura = (factura: DTOFacturaRespuesta) => {
    setMenuAbierto(null);
    navigate(`/propietario/facturas/${factura.idFactura}`);
  };

  const toggleMenu = (id: number) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const obtenerImagenPropiedad = (index: number): string => {
    return IMAGENES_PROPIEDADES[index % IMAGENES_PROPIEDADES.length];
  };

  const obtenerColorEstado = (estado: string | undefined): string => {
    if (!estado) return styles.estadoDefault;

    const estadoLower = estado.toLowerCase();
    if (estadoLower === "arrendada") return styles.estadoArrendada;
    if (estadoLower === "disponible") return styles.estadoDisponible;
    if (estadoLower.includes("mantenimiento")) return styles.estadoMantenimiento;
    if (estadoLower === "reservada") return styles.estadoReservada;
    return styles.estadoDefault;
  };

  const obtenerColorEstadoContrato = (estado: string | undefined): string => {
    if (!estado) return styles.estadoDefault;

    const estadoLower = estado.toLowerCase();
    if (estadoLower === "activo") return styles.estadoActivo;
    if (estadoLower === "finalizado") return styles.estadoFinalizado;
    if (estadoLower === "cancelado") return styles.estadoCancelado;
    if (estadoLower === "pendiente") return styles.estadoPendiente;
    return styles.estadoDefault;
  };

  const formatearEstado = (estado: string | undefined): string => {
    if (!estado) return "DESCONOCIDO";
    return estado.replace(/_/g, " ");
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

  // ============================================
  // RENDERIZADO - LOADING
  // ============================================
  if (cargando) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando tu portfolio...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ============================================
  // RENDERIZADO - ERROR
  // ============================================
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

  // ============================================
  // RENDERIZADO PRINCIPAL
  // ============================================
  return (
    <div className={styles.dashboard}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <div>
              <h1>Mi Portafolio</h1>
              <p className={styles.subtitulo}>
                Gestiona tus propiedades, contratos y pagos
              </p>
            </div>
            <div className={styles.accionesEncabezado}>
              <BotonComponente
                label="📊 Reportes"
                onClick={() => navigate("/propietario/reportes")}
              />
              <BotonComponente
                label="➕ Nueva Propiedad"
                onClick={() => navigate("/propietario/propiedades/nueva")}
              />
            </div>
          </div>

          {/* Grid de estadísticas */}
          <div className={styles.gridEstadisticas}>
            {/* Tarjeta 1: Mis Propiedades */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Home size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>Mis Propiedades</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.totalPropiedades}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Total de propiedades registradas
                </p>
                <div className={styles.tendencia}>
                  <TrendingUp size={14} />
                  <span>+2% vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Propiedades Arrendadas */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Users size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>Propiedades Arrendadas</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.propiedadesArrendadas}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  {estadisticas.porcentajeOcupacion}% de ocupación
                </p>
                <div className={styles.tendencia}>
                  <TrendingUp size={14} />
                  <span>+12% vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Ingresos del Mes */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <DollarSign size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>Ingresos del Mes</p>
                <h2 className={styles.valorEstadistica}>
                  ${estadisticas.ingresosMes.toLocaleString("es-CO")}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Pagos recibidos este mes
                </p>
                <div className={styles.tendencia}>
                  <TrendingUp size={14} />
                  <span>+8% vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Contratos Activos */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>Contratos Activos</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.contratosActivos}
                </h2>
                <p className={styles.descripcionEstadistica}>Contratos vigentes</p>
                <div className={styles.tendencia}>
                  <TrendingUp size={14} />
                  <span>+0% vs mes anterior</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mis Propiedades */}
          <div className={styles.seccionPropiedades}>
            <div className={styles.headerSeccion}>
              <div>
                <h2>Mis Propiedades</h2>
                <p>Gestiona el estado de tus propiedades</p>
              </div>
              <button
                className={styles.btnSecundario}
                onClick={() => navigate("/propietario/propiedades")}
              >
                Ver todas
              </button>
            </div>

            {propiedades.length === 0 ? (
              <div className={styles.sinDatos}>
                <Home size={48} className={styles.iconoSinDatos} />
                <p>No tienes propiedades registradas</p>
                <BotonComponente
                  label="Agregar Primera Propiedad"
                  onClick={() => navigate("/propietario/propiedades/nueva")}
                />
              </div>
            ) : (
              <div className={styles.gridPropiedades}>
                {propiedades.slice(0, 4).map((propiedad, index) => (
                  <div key={propiedad.idPropiedad} className={styles.tarjetaPropiedad}>
                    {/* Imagen */}
                    <div className={styles.imagenPropiedad}>
                      <img
                        src={obtenerImagenPropiedad(index)}
                        alt={propiedad.direccion}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x250/e5e7eb/6b7280?text=Propiedad";
                        }}
                      />
                      <span className={obtenerColorEstado(propiedad.estado)}>
                        {formatearEstado(propiedad.estado)}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className={styles.contenidoPropiedad}>
                      <div className={styles.encabezadoPropiedad}>
                        <h3>{propiedad.direccion || "Sin dirección"}</h3>
                        <button
                          className={styles.btnMenu}
                          onClick={() => toggleMenu(propiedad.idPropiedad!)}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuAbierto === propiedad.idPropiedad && (
                          <div className={styles.menuDesplegable}>
                            <button onClick={() => handleVerPropiedad(propiedad)}>
                              Ver detalles
                            </button>
                            <button onClick={() => handleEditarPropiedad(propiedad)}>
                              Editar
                            </button>
                          </div>
                        )}
                      </div>

                      <p className={styles.tipoPropiedad}>
                        <MapPin size={14} /> {propiedad.ciudad || "N/A"}
                      </p>

                      <div className={styles.detallesPropiedad}>
                        <div className={styles.detalle}>
                          <span className={styles.labelDetalle}>Área:</span>
                          <span className={styles.valorDetalle}>
                            {propiedad.area || "N/A"} m²
                          </span>
                        </div>

                        <div className={styles.detalle}>
                          <span className={styles.labelDetalle}>Propietario:</span>
                          <span className={styles.valorDetalle}>
                            {propiedad.nombrePropietario || "Sin asignar"}
                          </span>
                        </div>

                        <div className={styles.detalle}>
                          <Calendar size={14} />
                          <span className={styles.labelDetalle}>Estado:</span>
                          <span className={styles.valorDetalle}>
                            {formatearEstado(propiedad.estado)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid inferior: Resumen de Ocupación y Contratos */}
          <div className={styles.gridInferior}>
            {/* Resumen de Ocupación */}
            <div className={styles.tarjeta}>
              <div className={styles.headerTarjeta}>
                <h3>Resumen de Ocupación</h3>
                <p className={styles.subtituloTarjeta}>
                  Estado actual de tus propiedades
                </p>
              </div>

              <div className={styles.contenidoOcupacion}>
                <div className={styles.estadisticaOcupacion}>
                  <span>Ocupación General</span>
                  <span className={styles.porcentajeOcupacion}>
                    {estadisticas.porcentajeOcupacion}% ({estadisticas.propiedadesArrendadas}/
                    {estadisticas.totalPropiedades})
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className={styles.barraProgreso}>
                  <div
                    className={styles.progresoArrendadas}
                    style={{
                      width: `${estadisticas.totalPropiedades > 0 ? (estadisticas.propiedadesArrendadas / estadisticas.totalPropiedades) * 100 : 0}%`,
                    }}
                  ></div>
                </div>

                {/* Estados */}
                <div className={styles.estadosGrid}>
                  <div className={styles.estadoItem}>
                    <div className={styles.estadoIndicador} style={{ backgroundColor: "#10b981" }}></div>
                    <div>
                      <p className={styles.estadoNumero}>{estadisticas.propiedadesArrendadas}</p>
                      <p className={styles.estadoLabel}>Arrendadas</p>
                    </div>
                  </div>

                  <div className={styles.estadoItem}>
                    <div className={styles.estadoIndicador} style={{ backgroundColor: "#3b82f6" }}></div>
                    <div>
                      <p className={styles.estadoNumero}>{estadisticas.disponibles}</p>
                      <p className={styles.estadoLabel}>Disponibles</p>
                    </div>
                  </div>

                  <div className={styles.estadoItem}>
                    <div className={styles.estadoIndicador} style={{ backgroundColor: "#f59e0b" }}></div>
                    <div>
                      <p className={styles.estadoNumero}>{estadisticas.mantenimiento}</p>
                      <p className={styles.estadoLabel}>Mantenimiento</p>
                    </div>
                  </div>

                  <div className={styles.estadoItem}>
                    <div className={styles.estadoIndicador} style={{ backgroundColor: "#a855f7" }}></div>
                    <div>
                      <p className={styles.estadoNumero}>{estadisticas.reservadas}</p>
                      <p className={styles.estadoLabel}>Reservadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contratos Recientes */}
            <div className={styles.tarjeta}>
              <div className={styles.headerTarjeta}>
                <h3>Contratos Activos</h3>
                <p className={styles.subtituloTarjeta}>Últimos contratos registrados</p>
              </div>

              <div className={styles.listaPagos}>
                {contratos.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <FileText size={48} className={styles.iconoSinDatos} />
                    <p>No hay contratos registrados</p>
                  </div>
                ) : (
                  contratos.slice(0, 3).map((contrato) => (
                    <div key={contrato.idContrato} className={styles.itemPago}>
                      <div className={styles.infoPago}>
                        <p className={styles.propiedadPago}>
                          Contrato #{contrato.idContrato}
                        </p>
                        <p className={styles.inquilinoPago}>
                          {contrato.nombreInquilino || "Sin inquilino asignado"}
                        </p>
                        <p className={styles.fechaPago}>
                          <Calendar size={12} /> {formatearFecha(contrato.fechaInicio)} - {formatearFecha(contrato.fechaFin)}
                        </p>
                      </div>
                      <div className={styles.montoPago}>
                        <p className={styles.valorPago}>
                          ${(contrato.valorMensual || 0).toLocaleString("es-CO")}
                        </p>
                        <span className={obtenerColorEstadoContrato(contrato.estado)}>
                          {formatearEstado(contrato.estado)}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                <button
                  className={styles.btnVerTodos}
                  onClick={() => navigate("/propietario/contratos")}
                >
                  Ver todos los contratos
                </button>
              </div>
            </div>
          </div>

          {/* Facturas Recientes */}
          <div className={styles.seccionPropiedades}>
            <div className={styles.headerSeccion}>
              <div>
                <h2>Facturas Recientes</h2>
                <p>Últimas facturas emitidas</p>
              </div>
              <button
                className={styles.btnSecundario}
                onClick={() => navigate("/propietario/facturas")}
              >
                Ver todas
              </button>
            </div>

            <div className={styles.tarjeta}>
              <div className={styles.listaFacturas}>
                {facturas.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <DollarSign size={48} className={styles.iconoSinDatos} />
                    <p>No hay facturas registradas</p>
                  </div>
                ) : (
                  facturas.slice(0, 5).map((factura) => (
                    <div key={factura.idFactura} className={styles.itemFactura}>
                      <div className={styles.iconoFactura}>
                        {factura.estado === EstadoFactura.PAGADA ? (
                          <CheckCircle size={20} className={styles.iconoPagada} />
                        ) : factura.estado === EstadoFactura.PENDIENTE ? (
                          <Clock size={20} className={styles.iconoPendiente} />
                        ) : (
                          <XCircle size={20} className={styles.iconoVencida} />
                        )}
                      </div>
                      <div className={styles.infoFactura}>
                        <p className={styles.numeroFactura}>
                          Factura #{factura.idFactura}
                        </p>
                        <p className={styles.conceptoFactura}>
                          Arriendo mensual
                        </p>
                        <p className={styles.fechaFactura}>
                          Emitida: {formatearFecha(factura.fechaEmision)}
                        </p>
                      </div>
                      <div className={styles.montoFactura}>
                        <p className={styles.valorFactura}>
                          ${(factura.total || 0).toLocaleString("es-CO")}
                        </p>
                        <span
                          className={
                            factura.estado === EstadoFactura.PAGADA
                              ? styles.estadoPagada
                              : factura.estado === EstadoFactura.PENDIENTE
                              ? styles.estadoPendiente
                              : styles.estadoVencida
                          }
                        >
                          {formatearEstado(factura.estado)}
                        </span>
                      </div>
                      <button
                        className={styles.btnVerDetalle}
                        onClick={() => handleVerFactura(factura)}
                      >
                        Ver
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropietarioDashboard;
