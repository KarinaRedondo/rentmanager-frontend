import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../componentes/Header";
import Footer from "../../componentes/Footer";
import { BotonComponente } from "../../componentes/ui/Boton";
import { UsuarioService } from "../../servicios/usuarios";
import { PropiedadService } from "../../servicios/propiedades";
const { obtenerPropiedades, eliminarPropiedad, actualizarPropiedad } =
  PropiedadService;
import { obtenerContratos } from "../../servicios/contratos";
import { obtenerFacturas } from "../../servicios/facturas";
import type { DTOPropiedadRespuesta } from "../../modelos/types/Propiedad";
import type { DTOContratoRespuesta } from "../../modelos/types/Contrato";
import type { DTOFacturaRespuesta } from "../../modelos/types/Factura";
import { EstadoContrato } from "../../modelos/enumeraciones/estadoContrato";
import { EstadoFactura } from "../../modelos/enumeraciones/estadoFactura";
import { EstadoPropiedad } from "../../modelos/enumeraciones/estadoPropiedad";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";
import styles from "./AdminDashboard.module.css";
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  Info,
  MoreVertical,
  Home,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
} from "react-feather";

interface Alerta {
  id: number;
  tipo: "warning" | "error" | "info";
  mensaje: string;
  tiempo: string;
}

interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido?: string;
  correo: string;
  tipoUsuario: string;
  estado: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [propiedades, setPropiedades] = useState<DTOPropiedadRespuesta[]>([]);
  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const [procesando, setProcesando] = useState<boolean>(false);

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
      console.log("👤 Usuario parseado:", usuario);

      // Verificar tanto 'rol' como 'tipoUsuario' para compatibilidad
      const rolUsuario = usuario.rol || usuario.tipoUsuario;

      if (
        rolUsuario !== "ADMINISTRADOR" &&
        rolUsuario !== TipoUsuario.ADMINISTRADOR
      ) {
        console.error("🚫 Acceso denegado: usuario no es administrador");
        console.error("Rol encontrado:", rolUsuario);
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      console.log(
        "✅ Acceso verificado - Usuario:",
        usuario.nombre,
        "| Rol:",
        rolUsuario
      );
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

      console.log("🔄 Iniciando carga de datos del dashboard...");

      const resultados = await Promise.allSettled([
        cargarUsuarios(),
        cargarPropiedades(),
        cargarContratos(),
        cargarFacturas(),
      ]);

      // Procesar usuarios
      if (resultados[0].status === "fulfilled") {
        setUsuarios(resultados[0].value);
        console.log("✅ Usuarios cargados:", resultados[0].value.length);
      } else {
        console.warn(
          "⚠️ No se pudieron cargar usuarios:",
          resultados[0].reason
        );
        setUsuarios([]);
      }

      // Procesar propiedades
      if (resultados[1].status === "fulfilled") {
        setPropiedades(resultados[1].value);
        console.log("✅ Propiedades cargadas:", resultados[1].value.length);
      } else {
        console.warn(
          "⚠️ No se pudieron cargar propiedades:",
          resultados[1].reason
        );
        setPropiedades([]);
      }

      // Procesar contratos
      if (resultados[2].status === "fulfilled") {
        setContratos(resultados[2].value);
        console.log("✅ Contratos cargados:", resultados[2].value.length);
      } else {
        console.warn(
          "⚠️ No se pudieron cargar contratos:",
          resultados[2].reason
        );
        setContratos([]);
      }

      // Procesar facturas
      if (resultados[3].status === "fulfilled") {
        setFacturas(resultados[3].value);
        console.log("✅ Facturas cargadas:", resultados[3].value.length);
      } else {
        console.warn(
          "⚠️ No se pudieron cargar facturas:",
          resultados[3].reason
        );
        setFacturas([]);
      }

      // Generar alertas
      const contratosValidos =
        resultados[2].status === "fulfilled" ? resultados[2].value : [];
      const propiedadesValidas =
        resultados[1].status === "fulfilled" ? resultados[1].value : [];
      generarAlertas(contratosValidos, propiedadesValidas);

      console.log("✅ Carga de datos completada exitosamente");
    } catch (err: any) {
      console.error("❌ Error crítico al cargar datos:", err);
      setError(err.message || "Error al cargar los datos del dashboard");
    } finally {
      setCargando(false);
    }
  };

  // ============================================
  // CARGAR DATOS
  // ============================================
  const cargarUsuarios = async (): Promise<Usuario[]> => {
    try {
      console.log("🔄 Llamando a UsuarioService.listarTodos()...");
      const data = await UsuarioService.listarTodos();
      console.log("📦 Datos recibidos:", data);
      console.log("📊 Cantidad de usuarios:", data.length);
      console.log("👤 Primer usuario:", data[0]);
      return data;
    } catch (err: any) {
      console.error("❌ Error al cargar usuarios:", err);
      throw new Error("No se pudieron cargar los usuarios");
    }
  };

  const cargarPropiedades = async (): Promise<DTOPropiedadRespuesta[]> => {
    try {
      const data = await obtenerPropiedades();
      return data;
    } catch (err: any) {
      console.error("Error al cargar propiedades:", err);
      throw new Error("No se pudieron cargar las propiedades");
    }
  };

  const cargarContratos = async (): Promise<DTOContratoRespuesta[]> => {
    try {
      const data = await obtenerContratos();
      return data;
    } catch (err: any) {
      console.error("Error al cargar contratos:", err);
      throw new Error("No se pudieron cargar los contratos");
    }
  };

  const cargarFacturas = async (): Promise<DTOFacturaRespuesta[]> => {
    try {
      const data = await obtenerFacturas();
      return data;
    } catch (err: any) {
      console.error("Error al cargar facturas:", err);
      throw new Error("No se pudieron cargar las facturas");
    }
  };

  // ============================================
  // GENERAR ALERTAS
  // ============================================
  const generarAlertas = (
    contratosData: DTOContratoRespuesta[],
    propiedadesData: DTOPropiedadRespuesta[]
  ) => {
    const nuevasAlertas: Alerta[] = [];

    // Calcular fecha 30 días adelante
    const fechaActual = new Date();
    const fecha30Dias = new Date();
    fecha30Dias.setDate(fechaActual.getDate() + 30);

    // Alerta: Contratos próximos a vencer
    const contratosPorVencer = contratosData.filter((contrato) => {
      if (!contrato.fechaFin) return false;
      const fechaFin = new Date(contrato.fechaFin);
      return (
        fechaFin >= fechaActual &&
        fechaFin <= fecha30Dias &&
        contrato.estado === EstadoContrato.ACTIVO
      );
    });

    if (contratosPorVencer.length > 0) {
      nuevasAlertas.push({
        id: 1,
        tipo: "warning",
        mensaje: `${contratosPorVencer.length} contratos vencen en los próximos 30 días`,
        tiempo: "Hace 2 horas",
      });
    }

    // Alerta: Propiedades en verificación
    const propiedadesVerificacion = propiedadesData.filter(
      (prop) => prop.estado === EstadoPropiedad.EN_VERIFICACION
    );

    if (propiedadesVerificacion.length > 0) {
      nuevasAlertas.push({
        id: 2,
        tipo: "error",
        mensaje: `${propiedadesVerificacion.length} propiedades requieren aprobación urgente`,
        tiempo: "Hace 4 horas",
      });
    }

    // Alerta informativa
    nuevasAlertas.push({
      id: 3,
      tipo: "info",
      mensaje: "Nuevo reporte financiero disponible",
      tiempo: "Hace 1 día",
    });

    setAlertas(nuevasAlertas);
  };

  // ============================================
  // CALCULAR ESTADÍSTICAS
  // ============================================
  const calcularEstadisticas = () => {
    const totalPropiedades = propiedades.length;
    const contratosActivos = contratos.filter(
      (c) => c.estado === EstadoContrato.ACTIVO
    ).length;
    const totalUsuarios = usuarios.length;
    const pagosPendientes = facturas
      .filter((f) => f.estado === EstadoFactura.PENDIENTE)
      .reduce((sum, f) => sum + (f.total || 0), 0);

    return {
      totalPropiedades,
      contratosActivos,
      totalUsuarios,
      pagosPendientes,
    };
  };

  // ============================================
  // HANDLERS - USUARIOS
  // ============================================
  const handleVerUsuario = (usuario: Usuario) => {
    console.log("👁️ Ver usuario:", usuario.idUsuario);
    setMenuAbierto(null);
    navigate(`/administrador/usuarios/${usuario.idUsuario}`);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    console.log("✏️ Editar usuario:", usuario.idUsuario);
    setMenuAbierto(null);
    navigate(`/administrador/usuarios/editar/${usuario.idUsuario}`);
  };

  const handleEliminarUsuario = async (usuario: Usuario) => {
    setMenuAbierto(null);

    const confirmar = window.confirm(
      `¿Está seguro de suspender al usuario ${usuario.nombre} ${
        usuario.apellido || ""
      }?\n\nEsta acción desactivará su cuenta.`
    );

    if (!confirmar) return;

    try {
      setProcesando(true);
      console.log("🗑️ Suspendiendo usuario:", usuario.idUsuario);

      await UsuarioService.eliminar(usuario.idUsuario);

      // Recargar usuarios
      const usuariosActualizados = await cargarUsuarios();
      setUsuarios(usuariosActualizados);

      alert("✅ Usuario suspendido correctamente");
    } catch (err: any) {
      console.error("❌ Error al suspender usuario:", err);
      alert(`❌ Error al suspender el usuario: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // HANDLERS - PROPIEDADES
  // ============================================
  const handleVerPropiedad = (propiedad: DTOPropiedadRespuesta) => {
    console.log("👁️ Ver propiedad:", propiedad.idPropiedad);
    setMenuAbierto(null);
    navigate(`/administrador/propiedades/${propiedad.idPropiedad}`);
  };

  const handleEditarPropiedad = (propiedad: DTOPropiedadRespuesta) => {
    console.log("✏️ Editar propiedad:", propiedad.idPropiedad);
    setMenuAbierto(null);
    navigate(`/administrador/propiedades/editar/${propiedad.idPropiedad}`);
  };

  const handleAprobarPropiedad = async (propiedad: DTOPropiedadRespuesta) => {
    setMenuAbierto(null);

    const confirmar = window.confirm(
      `¿Aprobar la propiedad en ${propiedad.direccion}?\n\nCambiará su estado a DISPONIBLE.`
    );

    if (!confirmar) return;

    try {
      setProcesando(true);
      console.log("✅ Aprobando propiedad:", propiedad.idPropiedad);

      if (!propiedad.idPropiedad) {
        throw new Error("ID de propiedad inválido");
      }

      await actualizarPropiedad(propiedad.idPropiedad, {
        ...propiedad,
        estado: EstadoPropiedad.DISPONIBLE,
      });

      // Recargar propiedades
      const propiedadesActualizadas = await cargarPropiedades();
      setPropiedades(propiedadesActualizadas);

      // Actualizar alertas
      generarAlertas(contratos, propiedadesActualizadas);

      alert("✅ Propiedad aprobada correctamente");
    } catch (err: any) {
      console.error("❌ Error al aprobar propiedad:", err);
      alert(`❌ Error al aprobar la propiedad: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminarPropiedad = async (propiedad: DTOPropiedadRespuesta) => {
    setMenuAbierto(null);

    const confirmar = window.confirm(
      `¿Está seguro de eliminar la propiedad en ${propiedad.direccion}?\n\n⚠️ Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setProcesando(true);
      console.log("🗑️ Eliminando propiedad:", propiedad.idPropiedad);

      if (!propiedad.idPropiedad) {
        throw new Error("ID de propiedad inválido");
      }

      await eliminarPropiedad(propiedad.idPropiedad);

      // Recargar propiedades
      const propiedadesActualizadas = await cargarPropiedades();
      setPropiedades(propiedadesActualizadas);

      alert("✅ Propiedad eliminada correctamente");
    } catch (err: any) {
      console.error("❌ Error al eliminar propiedad:", err);
      alert(`❌ Error al eliminar la propiedad: ${err.message}`);
    } finally {
      setProcesando(false);
    }
  };

  // ============================================
  // HANDLERS - NAVEGACIÓN
  // ============================================
  const handleNuevoUsuario = () => {
    console.log("➕ Navegando a nuevo usuario");
    navigate("/administrador/usuarios/nuevo");
  };

  const handleVerReportes = () => {
    console.log("📊 Navegando a reportes");
    navigate("/administrador/reportes");
  };

  const handleVerTodosUsuarios = () => {
    console.log("👥 Navegando a todos los usuarios");
    navigate("/administrador/usuarios");
  };

  const handleVerTodasPropiedades = () => {
    console.log("🏘️ Navegando a todas las propiedades");
    navigate("/administrador/propiedades");
  };

  // ============================================
  // UTILIDADES
  // ============================================
  const toggleMenu = (id: number) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  const obtenerIconoAlerta = (tipo: string) => {
    switch (tipo) {
      case "warning":
        return <AlertTriangle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "info":
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const obtenerColorEstado = (estado: string | undefined): string => {
    if (!estado) return styles.estadoDefault;

    const estadoLower = estado.toLowerCase();
    if (estadoLower === "activo" || estadoLower === "disponible") {
      return styles.estadoActivo;
    } else if (
      estadoLower === "pendiente" ||
      estadoLower.includes("verificacion")
    ) {
      return styles.estadoPendiente;
    } else if (estadoLower === "inactivo" || estadoLower === "suspendido") {
      return styles.estadoInactivo;
    } else if (estadoLower === "arrendada") {
      return styles.estadoArrendada;
    } else if (estadoLower.includes("mantenimiento")) {
      return styles.estadoMantenimiento;
    }
    return styles.estadoDefault;
  };

  const formatearEstado = (estado: string | undefined): string => {
    if (!estado) return "DESCONOCIDO";
    return estado.replace(/_/g, " ");
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
            <p>Cargando datos del panel de administración...</p>
            <small className={styles.textoCargando}>
              Por favor espere mientras cargamos la información
            </small>
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
            <XCircle size={64} className={styles.iconoError} />
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

  // ============================================
  // RENDERIZADO PRINCIPAL
  // ============================================
  return (
    <div className={styles.dashboard}>
      <Header />

      {/* Overlay de procesamiento */}
      {procesando && (
        <div className={styles.overlay}>
          <div className={styles.overlayContenido}>
            <div className={styles.spinner}></div>
            <p>Procesando...</p>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <div>
              <h1>Panel de Administración</h1>
              <p className={styles.subtitulo}>
                Gestiona usuarios, propiedades y supervisa el sistema completo
              </p>
            </div>
            <div className={styles.accionesEncabezado}></div>
          </div>

          {/* Grid de estadísticas */}
          <div className={styles.gridEstadisticas}>
            {/* Tarjeta 1: Propiedades */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Home size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>
                  Propiedades Registradas
                </p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.totalPropiedades}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Total de propiedades en el sistema
                </p>
                <div className={styles.tendencia}>
                  <TrendingUp size={14} />
                  <span>+12% vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Contratos */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>Contratos Activos</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.contratosActivos}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Contratos vigentes
                </p>
                <div className={styles.tendencia}>
                  <TrendingUp size={14} />
                  <span>+8% vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Usuarios */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Users size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>Usuarios Totales</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.totalUsuarios}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Propietarios, inquilinos y contadores
                </p>
                <div className={styles.tendencia}>
                  <TrendingUp size={14} />
                  <span>+15% vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Pagos */}
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <DollarSign size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.tituloEstadistica}>Pagos Pendientes</p>
                <h2 className={styles.valorEstadistica}>
                  ${estadisticas.pagosPendientes.toLocaleString("es-CO")}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Facturas por cobrar
                </p>
                <div
                  className={`${styles.tendencia} ${styles.tendenciaNegativa}`}
                >
                  <TrendingDown size={14} />
                  <span>-5% vs mes anterior</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Tablas */}
          <div className={styles.gridTablas}>
            {/* Usuarios Recientes */}
            <div className={styles.tarjeta}>
              <div className={styles.headerTarjeta}>
                <div>
                  <h3>Usuarios Recientes</h3>
                  <p className={styles.subtituloTarjeta}>
                    Últimos usuarios registrados en el sistema
                  </p>
                </div>
                <button
                  className={styles.btnSecundario}
                  onClick={handleVerTodosUsuarios}
                >
                  Ver todos
                </button>
              </div>
              <div className={styles.contenidoTarjeta}>
                {usuarios.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <Users size={48} className={styles.iconoSinDatos} />
                    <p>No hay usuarios registrados</p>
                  </div>
                ) : (
                  usuarios.slice(0, 4).map((usuario) => (
                    <div key={usuario.idUsuario} className={styles.itemLista}>
                      <div className={styles.avatarItem}>
                        <Users size={20} />
                      </div>
                      <div className={styles.infoItem}>
                        <p className={styles.nombreItem}>
                          {usuario.nombre} {usuario.apellido || ""}
                        </p>
                        <p className={styles.emailItem}>{usuario.correo}</p>
                      </div>
                      <div className={styles.badgesItem}>
                        <span className={styles.badgeRol}>
                          {usuario.tipoUsuario}
                        </span>
                        <span className={obtenerColorEstado(usuario.estado)}>
                          {formatearEstado(usuario.estado)}
                        </span>
                      </div>
                      <div className={styles.menuContainer}>
                        <button
                          className={styles.btnMenu}
                          onClick={() => toggleMenu(usuario.idUsuario)}
                          title="Más opciones"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {menuAbierto === usuario.idUsuario && (
                          <div className={styles.menuDesplegable}>
                            <button onClick={() => handleVerUsuario(usuario)}>
                              <Eye size={16} />
                              Ver detalles
                            </button>
                            <button
                              onClick={() => handleEditarUsuario(usuario)}
                            >
                              <Edit2 size={16} />
                              Editar
                            </button>
                            <button
                              className={styles.btnEliminar}
                              onClick={() => handleEliminarUsuario(usuario)}
                            >
                              <Trash2 size={16} />
                              Suspender
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Propiedades Recientes */}
            <div className={styles.tarjeta}>
              <div className={styles.headerTarjeta}>
                <div>
                  <h3>Propiedades Recientes</h3>
                  <p className={styles.subtituloTarjeta}>
                    Últimas propiedades registradas
                  </p>
                </div>
                <button
                  className={styles.btnSecundario}
                  onClick={handleVerTodasPropiedades}
                >
                  Ver todas
                </button>
              </div>
              <div className={styles.contenidoTarjeta}>
                {propiedades.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <Home size={48} className={styles.iconoSinDatos} />
                    <p>No hay propiedades registradas</p>
                  </div>
                ) : (
                  propiedades.slice(0, 3).map((propiedad) => (
                    <div
                      key={propiedad.idPropiedad}
                      className={styles.itemLista}
                    >
                      <div className={styles.avatarItem}>
                        <Home size={20} />
                      </div>
                      <div className={styles.infoItem}>
                        <p className={styles.nombreItem}>
                          {propiedad.direccion}
                        </p>
                        <p className={styles.emailItem}>
                          {propiedad.ciudad} •{" "}
                          {propiedad.nombrePropietario || "Sin propietario"}
                        </p>
                      </div>
                      <div className={styles.badgesItem}>
                        <span className={obtenerColorEstado(propiedad.estado)}>
                          {formatearEstado(propiedad.estado)}
                        </span>
                      </div>
                      <div className={styles.menuContainer}>
                        <button
                          className={styles.btnMenu}
                          onClick={() => toggleMenu(propiedad.idPropiedad!)}
                          title="Más opciones"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {menuAbierto === propiedad.idPropiedad && (
                          <div className={styles.menuDesplegable}>
                            <button
                              onClick={() => handleEditarPropiedad(propiedad)}
                            >
                              <Edit2 size={16} />
                              Editar
                            </button>
                            {propiedad.estado ===
                              EstadoPropiedad.EN_VERIFICACION && (
                              <button
                                className={styles.btnAprobar}
                                onClick={() =>
                                  handleAprobarPropiedad(propiedad)
                                }
                              >
                                <CheckCircle size={16} />
                                Aprobar
                              </button>
                            )}
                            <button
                              className={styles.btnEliminar}
                              onClick={() => handleEliminarPropiedad(propiedad)}
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
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

export default AdminDashboard;
