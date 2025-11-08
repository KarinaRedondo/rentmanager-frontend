import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { ModalComponente } from "../../../componentes/Modal";
import InputCustom from "../../../componentes/ui/Input";
import {
  obtenerContratos,
  crearContrato,
  actualizarContrato,
  analizarTransicionContrato,
  ejecutarTransicionContrato,
} from "../../../servicios/contratos";
import { PropiedadService } from "../../../servicios/propiedades";
import { UsuarioService } from "../../../servicios/usuarios";
import type { DTOContratoRespuesta } from "../../../modelos/types/Contrato";
import type { DTOPropiedadRespuesta } from "../../../modelos/types/Propiedad";
import type { DTOUsuarioRespuesta } from "../../../modelos/types/Usuario";
import type { Evento } from "../../../modelos/enumeraciones/evento";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import { EstadoContrato } from "../../../modelos/enumeraciones/estadoContrato";
import styles from "./PropietarioContratos.module.css";
import {
  FileText,
  Home,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  ArrowLeft,
  Filter,
} from "react-feather";

// ========================================
// GESTIÓN DE CONTRATOS - ROL PROPIETARIO
// ========================================
//
// Página completa de administración de contratos para propietarios con CRUD y transiciones.
// Permite crear, editar, visualizar y gestionar estados de contratos de propiedades.
//
// FUNCIONALIDADES:
// - Listado completo de contratos con filtros.
// - CRUD completo: Crear, editar, visualizar contratos.
// - Transiciones de estado validadas con autómata.
// - Modal de formulario para crear/editar.
// - Modal de resultados de transiciones.
// - Estadísticas de contratos por estado.
// - Navegación a detalle de contrato.
//
// SEGURIDAD:
// - verificarAcceso(): Valida autenticación y rol PROPIETARIO exclusivamente.
// - Redirección a login si no hay sesión.
// - Redirección a home si rol no es PROPIETARIO.
//
// ESTADO PRINCIPAL:
// - contratos: Lista completa de contratos.
// - contratosFiltrados: Subset filtrado por estado.
// - propiedades: Lista de propiedades para selección.
// - inquilinos: Lista de usuarios con rol INQUILINO.
// - cargando: Indica carga inicial.
// - error: Mensaje de error.
// - filtroEstado: Estado seleccionado ("TODOS", "ACTIVO", "CREADO", "TERMINADO").
//
// ESTADO DEL MODAL:
// - modalAbierto: Boolean para mostrar/ocultar modal formulario.
// - modoEdicion: Boolean (true: editar, false: crear).
// - contratoEditando: Contrato que se está editando.
// - guardando: Indica operación de guardado en curso.
//
// ESTADO DE TRANSICIONES:
// - resultadoTransicion: Resultado de validación (ResultadoValidacion).
// - resultadoEjecucion: Resultado de ejecución (ResultadoEjecucion).
// - mostrarModalTransicion: Boolean para modal de transiciones.
//
// ESTADO DEL FORMULARIO:
// - idPropiedad: ID de propiedad seleccionada (string).
// - idInquilino: ID de inquilino seleccionado (string).
// - fechaInicio, fechaFin: Fechas del contrato.
// - valorMensual: Valor mensual del arriendo (string para input).
// - estadoContrato: Estado del contrato (enum EstadoContrato).
// - tipoContrato: Tipo (RESIDENCIAL, COMERCIAL, etc).
// - formaPago: Forma de pago (MENSUAL, TRIMESTRAL, etc).
// - observaciones: Texto opcional.
//
// INTERFACES:
// - ResultadoValidacion: { valido, motivo?, recomendaciones?, alternativas? }
// - ResultadoEjecucion: { exito, mensaje, estadoActual }
//
// FUNCIONES DE CARGA:
//
// cargarDatos():
// - Carga paralela con Promise.all de contratos, propiedades y usuarios.
// - Ordena contratos por fechaInicio descendente.
// - Filtra usuarios para obtener solo INQUILINO/INQUILINOS.
// - Logging extensivo de datos recibidos y procesados.
// - Advertencias si no hay propiedades o inquilinos.
// - Maneja arrays vacíos como fallback.
//
// aplicarFiltros():
// - Filtra por estado si no es "TODOS".
// - Actualiza contratosFiltrados.
//
// FUNCIONES DEL MODAL:
//
// abrirModalNuevo():
// - Resetea todos los campos del formulario.
// - Establece modoEdicion = false.
// - Establece valores por defecto.
// - Logging de apertura.
//
// abrirModalEditar():
// - **CORRECCIÓN**: Carga IDs correctamente desde objetos anidados.
// - Intenta contrato.propiedad?.idPropiedad o contrato.propiedad.
// - Intenta contrato.inquilino?.idUsuario o contrato.idInquilino.
// - Convierte a string para selects.
// - Carga todos los campos del contrato.
// - Logging de datos cargados.
// - Establece modoEdicion = true.
//
// handleGuardar():
// - Validaciones:
//   * Propiedad seleccionada (id != 0)
//   * Inquilino seleccionado (id != 0)
//   * Fechas ingresadas
//   * Valor mensual > 0
// - Construye objeto contratoData con:
//   * Objeto propiedad completo (busca en array)
//   * idInquilino, idPropietario (desde usuario logueado)
//   * Fechas, valor mensual, estado, tipo, forma de pago, observaciones
// - Si modoEdicion: actualizarContrato()
// - Si no: crearContrato()
// - Logging de datos enviados.
// - Recarga datos después de éxito.
// - Alert con mensajes de éxito/error.
//
// FUNCIONES DE TRANSICIONES:
//
// manejarTransicion():
// - Recibe contratoId y evento.
// - Logging de inicio.
// - **Análisis**: analizarTransicionContrato(contratoId, evento).
// - Si no válida: Muestra modal con motivo, recomendaciones, alternativas.
// - Si válida: **Ejecuta** ejecutarTransicionContrato(contratoId, evento).
// - Muestra modal con resultado.
// - Si exitosa: Recarga datos.
// - Try-catch con manejo de errores.
//
// TRANSICIONES DISPONIBLES:
// - ACTIVAR_CONTRATO
// - SUSPENDER_CONTRATO
// - REANUDAR_CONTRATO
// - TERMINAR_CONTRATO
// - RENOVAR_CONTRATO
// - RECHAZAR_CONTRATO
//
// ESTADOS DE CONTRATO:
// - CREADO: Azul con icono Clock
// - ACTIVO: Verde con icono CheckCircle
// - SUSPENDIDO: Rojo con icono XCircle
// - RECHAZADO: Rojo con icono XCircle
// - TERMINADO: Gris con icono FileText
//
// UTILIDADES:
//
// formatearFecha():
// - Parsing manual robusto con split('-').
// - Validación de 3 partes.
// - Creación de Date con valores numéricos.
// - Validación con isNaN().
// - Formato corto DD/MM/AAAA.
//
// obtenerEstadoClase(): Asigna clase CSS según estado.
// obtenerIconoEstado(): Retorna icono coloreado según estado.
//
// COMPONENTES VISUALES:
//
// Encabezado:
// - Botón volver al dashboard.
// - Título "Mis Contratos".
// - Botón "+ Nuevo Contrato".
//
// Estadísticas (Grid 4 columnas):
// 1. Total Contratos
// 2. Activos
// 3. Creados
// 4. Finalizados
//
// Filtros:
// - Botones: Todos, Activos, Creados, Terminados.
// - Botón activo con estilo diferenciado.
//
// Grid de Contratos:
// - Cards con:
//   * Header: ID, dirección propiedad, icono de estado
//   * Cuerpo:
//     - Inquilino (nombre completo con fallback)
//     - Fecha inicio
//     - Fecha fin
//     - Separador
//     - Valor mensual (destacado)
//     - Badge de estado
//   * Acciones:
//     - Botón "Ver Detalle"
//     - Botón "Editar"
//   * Select de transiciones
//
// Modal Formulario (CRUD):
// - Select de propiedad con mensaje si vacío.
// - Select de inquilino con mensaje si vacío.
// - Inputs de fechas (row).
// - Input valor mensual (number).
// - Select tipo contrato (RESIDENCIAL, COMERCIAL, etc).
// - Select forma de pago (MENSUAL, TRIMESTRAL, etc).
// - Input observaciones (opcional).
// - Select estado (CREADO, ACTIVO, etc).
// - Logging en onChange de selects.
//
// Modal Transiciones:
// - **Tres estados**:
//   1. **Cargando**: Spinner con mensaje.
//   2. **No válida**: Icono ❌, motivo, recomendaciones, alternativas.
//   3. **Ejecutada**: Icono ✅ o ❌, mensaje, estado actual, información adicional.
//
// NAVEGACIÓN:
// - Volver: /propietario/dashboard
// - Ver detalle: /propietario/contratos/{id}
// - Editar: Modal con datos del contrato
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando contratos...".
// - Sin contratos: Icono FileText, mensaje informativo.
// - Estados vacíos: Mensajes si no hay propiedades o inquilinos en selects.
//
// LOGGING EXTENSIVO:
// - Apertura de modales.
// - Propiedad e inquilino seleccionados.
// - Datos cargados en formulario de edición.
// - Datos enviados al guardar.
// - Inicio y resultado de transiciones.
// - Estado actual de datos (useEffect).
// - Warnings si no hay datos.
//
// CARACTERÍSTICAS DESTACADAS:
// - **Corrección marcada**: Carga correcta de IDs en edición.
// - **Validaciones completas**: Antes de guardar.
// - **Sistema de transiciones**: Con validación previa y feedback detallado.
// - **Logging exhaustivo**: Para debugging en producción.
// - **Manejo robusto de datos**: Fallbacks múltiples.
// - **Estados condicionales**: Mensajes si no hay datos.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para estadísticas y contratos.
// - Cards con diseño visual completo.
// - Modal con secciones coloreadas según resultado.
// - Badges y botones con estados hover.

const { obtenerPropiedades } = PropiedadService;

// Interfaces para transiciones
interface ResultadoValidacion {
  valido: boolean;
  motivo?: string;
  recomendaciones?: string[];
  alternativas?: string[];
}

interface ResultadoEjecucion {
  exito: boolean;
  mensaje: string;
  estadoActual: string;
}

const PropietarioContratos: React.FC = () => {
  const navigate = useNavigate();

  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [contratosFiltrados, setContratosFiltrados] = useState<
    DTOContratoRespuesta[]
  >([]);
  const [propiedades, setPropiedades] = useState<DTOPropiedadRespuesta[]>([]);
  const [inquilinos, setInquilinos] = useState<DTOUsuarioRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

  // Estado del Modal
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [contratoEditando, setContratoEditando] =
    useState<DTOContratoRespuesta | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Estados para transiciones
  const [resultadoTransicion, setResultadoTransicion] =
    useState<ResultadoValidacion | null>(null);
  const [resultadoEjecucion, setResultadoEjecucion] =
    useState<ResultadoEjecucion | null>(null);
  const [mostrarModalTransicion, setMostrarModalTransicion] = useState(false);

  // Estados del formulario
  const [idPropiedad, setIdPropiedad] = useState<string>("0");
  const [idInquilino, setIdInquilino] = useState<string>("0");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [valorMensual, setValorMensual] = useState<string>("0");
  const [estadoContrato, setEstadoContrato] = useState<EstadoContrato>(
    EstadoContrato.CREADO
  );
  const [tipoContrato, setTipoContrato] = useState<string>("RESIDENCIAL");
  const [formaPago, setFormaPago] = useState<string>("MENSUAL");
  const [observaciones, setObservaciones] = useState<string>("");

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, contratos]);

  // Efecto para debug
  useEffect(() => {
    console.log("Estado actual de datos:", {
      propiedades: propiedades.length,
      inquilinos: inquilinos.length,
      contratos: contratos.length,
    });
  }, [propiedades, inquilinos, contratos]);

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
        rolUsuario !== "PROPIETARIO" &&
        rolUsuario !== TipoUsuario.PROPIETARIO
      ) {
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarDatos();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      console.log("Iniciando carga de datos...");

      const [contratosData, propiedadesData, usuariosData] = await Promise.all([
        obtenerContratos(),
        obtenerPropiedades(),
        UsuarioService.listarTodos(),
      ]);

      const contratosArray = Array.isArray(contratosData) ? contratosData : [];
      const propiedadesArray = Array.isArray(propiedadesData)
        ? propiedadesData
        : [];
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];

      console.log("Datos recibidos del backend:", {
        contratos: contratosArray.length,
        propiedades: propiedadesArray.length,
        usuarios: usuariosArray.length,
      });

      const contratosOrdenados = contratosArray.sort((a, b) => {
        const fechaA = a.fechaInicio || "";
        const fechaB = b.fechaInicio || "";
        return fechaB.localeCompare(fechaA);
      });

      const inquilinosArray = usuariosArray.filter((u) => {
        const tipo = String(u.tipoUsuario || u.rol || "").toUpperCase();
        return tipo === "INQUILINO" || tipo === "INQUILINOS";
      });

      console.log("Datos procesados:", {
        contratos: contratosOrdenados.length,
        propiedades: propiedadesArray.length,
        inquilinos: inquilinosArray.length,
      });

      setContratos(contratosOrdenados);
      setPropiedades(propiedadesArray);
      setInquilinos(inquilinosArray);

      // Advertencias si no hay datos
      if (propiedadesArray.length === 0) {
        console.warn("No se cargaron propiedades");
      }
      if (inquilinosArray.length === 0) {
        console.warn("No se cargaron inquilinos");
      }
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    if (filtroEstado === "TODOS") {
      setContratosFiltrados(contratos);
    } else {
      const filtrados = contratos.filter(
        (c) => String(c.estado).toUpperCase() === filtroEstado
      );
      setContratosFiltrados(filtrados);
    }
  };

  const abrirModalNuevo = () => {
    console.log("➕ Abriendo modal para nuevo contrato");
    setModoEdicion(false);
    setContratoEditando(null);
    setIdPropiedad("0");
    setIdInquilino("0");
    setFechaInicio("");
    setFechaFin("");
    setValorMensual("0");
    setEstadoContrato(EstadoContrato.CREADO);
    setFormaPago("MENSUAL");
    setTipoContrato("RESIDENCIAL");
    setObservaciones("");
    setModalAbierto(true);
  };

  const abrirModalEditar = (contrato: DTOContratoRespuesta) => {
    console.log("📝 Abriendo modal para editar contrato:", contrato);

    setModoEdicion(true);
    setContratoEditando(contrato);

    // CORREGIDO: Cargar IDs correctamente
    const propiedadId = String(
      contrato.propiedad?.idPropiedad || contrato.propiedad || 0
    );
    const inquilinoId = String(
      contrato.inquilino?.idUsuario || contrato.idInquilino || 0
    );

    setIdPropiedad(propiedadId);
    setIdInquilino(inquilinoId);
    setFechaInicio(contrato.fechaInicio || "");
    setFechaFin(contrato.fechaFin || "");
    setValorMensual(String(contrato.valorMensual || 0));
    setEstadoContrato(
      (contrato.estado as EstadoContrato) || EstadoContrato.CREADO
    );
    setTipoContrato(contrato.tipoContrato || "RESIDENCIAL");
    setFormaPago(contrato.formaPago || "MENSUAL");
    setObservaciones(contrato.observaciones || "");

    console.log("Datos cargados en formulario:", {
      propiedadId,
      inquilinoId,
      fechaInicio: contrato.fechaInicio,
      fechaFin: contrato.fechaFin,
      valorMensual: contrato.valorMensual,
      estado: contrato.estado,
    });

    setModalAbierto(true);
  };

  const handleGuardar = async () => {
    console.log("Intentando guardar contrato...");

    if (!idPropiedad || parseInt(idPropiedad) === 0) {
      alert("Debe seleccionar una propiedad");
      return;
    }

    if (!idInquilino || parseInt(idInquilino) === 0) {
      alert("Debe seleccionar un inquilino");
      return;
    }

    if (!fechaInicio || !fechaFin) {
      alert("Debe ingresar las fechas de inicio y fin del contrato");
      return;
    }

    if (!valorMensual || parseInt(valorMensual) <= 0) {
      alert("El valor mensual debe ser mayor a 0");
      return;
    }

    try {
      setGuardando(true);

      const usuarioString = localStorage.getItem("usuario");
      const usuario = JSON.parse(usuarioString!);
      const propiedadSeleccionada = propiedades.find(
        (p) => p.idPropiedad === parseInt(idPropiedad)
      );

      const contratoData = {
        propiedad: propiedadSeleccionada,
        idInquilino: parseInt(idInquilino),
        idPropietario: usuario.idUsuario,
        fechaInicio,
        fechaFin,
        valorMensual: parseInt(valorMensual),
        estado: estadoContrato,
        tipoContrato,
        formaPago,
        observaciones,
      };

      console.log("Enviando datos:", contratoData);

      if (modoEdicion && contratoEditando) {
        await actualizarContrato(
          contratoEditando.idContrato || 0,
          contratoData as any
        );
        alert("Contrato actualizado exitosamente");
      } else {
        await crearContrato(contratoData as any);
        alert("Contrato creado exitosamente");
      }

      setModalAbierto(false);
      await cargarDatos();
    } catch (err: any) {
      console.error("Error al guardar:", err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const manejarTransicion = async (
    contratoId: number,
    evento: Evento | string
  ) => {
    if (!evento) return;

    console.log(
      `Iniciando transición: Contrato ${contratoId} → Evento: ${evento}`
    );

    try {
      setResultadoTransicion(null);
      setResultadoEjecucion(null);

      // Validar transición
      const validacion = await analizarTransicionContrato(
        contratoId,
        evento as Evento
      );
      setResultadoTransicion(validacion);

      if (!validacion.valido) {
        console.warn("Transición rechazada:", validacion.motivo);
        setMostrarModalTransicion(true);
        return;
      }

      console.log("Validación exitosa, ejecutando...");

      // Ejecutar transición
      const ejecucion = await ejecutarTransicionContrato(
        contratoId,
        evento as Evento
      );
      setResultadoEjecucion(ejecucion);
      setMostrarModalTransicion(true);

      if (ejecucion.exito) {
        console.log("Transición ejecutada correctamente");
        await cargarDatos();
      } else {
        console.warn("La ejecución falló:", ejecucion.mensaje);
      }
    } catch (err: any) {
      console.error("Error en transición:", err);
      setResultadoTransicion({
        valido: false,
        motivo: err.message || "Error desconocido",
      });
      setMostrarModalTransicion(true);
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
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "Error en fecha";
    }
  };

  const obtenerEstadoClase = (estado: string): string => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "ACTIVO":
        return styles.estadoActivo;
      case "CREADO":
        return styles.estadoPendiente;
      case "SUSPENDIDO":
      case "RECHAZADO":
        return styles.estadoCancelado;
      case "TERMINADO":
        return styles.estadoFinalizado;
      default:
        return styles.estadoPendiente;
    }
  };

  const obtenerIconoEstado = (estado: string) => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "ACTIVO":
        return <CheckCircle size={20} className={styles.iconoVerde} />;
      case "CREADO":
        return <Clock size={20} className={styles.iconoAzul} />;
      case "TERMINADO":
        return <FileText size={20} className={styles.iconoGris} />;
      case "SUSPENDIDO":
      case "RECHAZADO":
        return <XCircle size={20} className={styles.iconoRojo} />;
      default:
        return <Clock size={20} className={styles.iconoAzul} />;
    }
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando contratos...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = {
    total: contratos.length,
    activos: contratos.filter(
      (c) => String(c.estado).toUpperCase() === "ACTIVO"
    ).length,
    pendientes: contratos.filter(
      (c) => String(c.estado).toUpperCase() === "CREADO"
    ).length,
    finalizados: contratos.filter(
      (c) => String(c.estado).toUpperCase() === "TERMINADO"
    ).length,
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/propietario/dashboard")}
            >
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Mis Contratos</h1>
              <p className={styles.subtitulo}>
                Administra los contratos de tus propiedades
              </p>
            </div>
            <BotonComponente
              label="+ Nuevo Contrato"
              onClick={abrirModalNuevo}
            />
          </div>

          {/* Estadísticas */}
          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Total Contratos</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.total}
                </h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Activos</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.activos}
                </h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Clock size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Creados</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.pendientes}
                </h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <XCircle size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Finalizados</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.finalizados}
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
                    filtroEstado === "TODOS"
                      ? styles.filtroActivo
                      : styles.filtroBton
                  }
                  onClick={() => setFiltroEstado("TODOS")}
                >
                  Todos
                </button>
                <button
                  className={
                    filtroEstado === "ACTIVO"
                      ? styles.filtroActivo
                      : styles.filtroBton
                  }
                  onClick={() => setFiltroEstado("ACTIVO")}
                >
                  Activos
                </button>
                <button
                  className={
                    filtroEstado === "CREADO"
                      ? styles.filtroActivo
                      : styles.filtroBton
                  }
                  onClick={() => setFiltroEstado("CREADO")}
                >
                  Creados
                </button>
                <button
                  className={
                    filtroEstado === "TERMINADO"
                      ? styles.filtroActivo
                      : styles.filtroBton
                  }
                  onClick={() => setFiltroEstado("TERMINADO")}
                >
                  Terminados
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Contratos */}
          <div className={styles.listaContratos}>
            {contratosFiltrados.length === 0 ? (
              <div className={styles.sinContratos}>
                <FileText size={64} />
                <h3>No hay contratos para mostrar</h3>
                <p>No se encontraron contratos con el filtro seleccionado</p>
              </div>
            ) : (
              <div className={styles.gridContratos}>
                {contratosFiltrados.map((contrato) => {
                  const propiedad = contrato.propiedad;
                  const direccion =
                    propiedad?.direccion || "Propiedad no identificada";
                  const nombreCompleto =
                    contrato.nombreInquilino && contrato.apellidoInquilino
                      ? `${contrato.nombreInquilino} ${contrato.apellidoInquilino}`
                      : `${contrato.nombreInquilino ?? ""} ${
                          contrato.apellidoInquilino ?? ""
                        }`.trim() || "N/A";

                  return (
                    <div
                      key={contrato.idContrato}
                      className={styles.tarjetaContrato}
                    >
                      <div className={styles.headerContrato}>
                        <div className={styles.infoHeaderContrato}>
                          <h3>Contrato #{contrato.idContrato}</h3>
                          <p className={styles.propiedadContrato}>
                            <Home size={14} />
                            {direccion}
                          </p>
                        </div>
                        <div className={styles.iconoEstadoContrato}>
                          {obtenerIconoEstado(contrato.estado || "")}
                        </div>
                      </div>

                      <div className={styles.cuerpoContrato}>
                        <div className={styles.detalleContrato}>
                          <span className={styles.labelDetalle}>
                            <User size={16} />
                            Inquilino:
                          </span>
                          <span className={styles.valorDetalle}>
                            {nombreCompleto}
                          </span>
                        </div>

                        <div className={styles.detalleContrato}>
                          <span className={styles.labelDetalle}>
                            <Calendar size={16} />
                            Inicio:
                          </span>
                          <span className={styles.valorDetalle}>
                            {formatearFecha(contrato.fechaInicio)}
                          </span>
                        </div>

                        <div className={styles.detalleContrato}>
                          <span className={styles.labelDetalle}>
                            <Calendar size={16} />
                            Fin:
                          </span>
                          <span className={styles.valorDetalle}>
                            {formatearFecha(contrato.fechaFin)}
                          </span>
                        </div>

                        <div className={styles.separadorContrato}></div>

                        <div className={styles.valorMensualContrato}>
                          <span className={styles.labelValor}>
                            <DollarSign size={16} />
                            Valor Mensual:
                          </span>
                          <span className={styles.valorMensual}>
                            $
                            {(contrato.valorMensual || 0).toLocaleString(
                              "es-CO"
                            )}
                          </span>
                        </div>

                        <span
                          className={obtenerEstadoClase(contrato.estado || "")}
                        >
                          {contrato.estado}
                        </span>
                      </div>

                      <div className={styles.accionesContrato}>
                        <button
                          className={styles.btnAccion}
                          onClick={() =>
                            navigate(
                              `/propietario/contratos/${contrato.idContrato}`
                            )
                          }
                        >
                          <Eye size={16} />
                          Ver Detalle
                        </button>
                        <button
                          className={styles.btnAccion}
                          onClick={() => abrirModalEditar(contrato)}
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                      </div>

                      {/* Selector de transiciones de estado */}
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          manejarTransicion(
                            contrato.idContrato || 0,
                            e.target.value
                          );
                          e.target.value = "";
                        }}
                        className={styles.selectTransicion}
                      >
                        <option value="">Transición de Estado...</option>
                        <option value="ACTIVAR_CONTRATO">
                          Activar Contrato
                        </option>
                        <option value="SUSPENDER_CONTRATO">
                          Suspender Contrato
                        </option>
                        <option value="REANUDAR_CONTRATO">
                          Reanudar Contrato
                        </option>
                        <option value="TERMINAR_CONTRATO">
                          Terminar Contrato
                        </option>
                        <option value="RENOVAR_CONTRATO">
                          Renovar Contrato
                        </option>
                        <option value="RECHAZAR_CONTRATO">
                          Rechazar Contrato
                        </option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE FORMULARIO */}
      <ModalComponente
        openModal={modalAbierto}
        setOpenModal={setModalAbierto}
        nombreModal={modoEdicion ? "Editar Contrato" : "Nuevo Contrato"}
        guardar={handleGuardar}
      >
        <div className={styles.formModal}>
          <div className={styles.formGroup}>
            <label>Propiedad *</label>
            <select
              className={styles.selectModal}
              value={idPropiedad}
              onChange={(e) => {
                console.log("Propiedad seleccionada:", e.target.value);
                setIdPropiedad(e.target.value);
              }}
              disabled={guardando}
            >
              <option value="0">Seleccione una propiedad</option>
              {propiedades.map((p) => (
                <option key={p.idPropiedad} value={p.idPropiedad}>
                  {p.direccion} - {p.ciudad}
                </option>
              ))}
            </select>
            {propiedades.length === 0 && (
              <small style={{ color: "red" }}>
                No hay propiedades disponibles
              </small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Inquilino *</label>
            <select
              className={styles.selectModal}
              value={idInquilino}
              onChange={(e) => {
                console.log("Inquilino seleccionado:", e.target.value);
                setIdInquilino(e.target.value);
              }}
              disabled={guardando}
            >
              <option value="0">Seleccione un inquilino</option>
              {inquilinos.map((i) => (
                <option key={i.idUsuario} value={i.idUsuario}>
                  {i.nombre} {i.apellido} - {i.correo}
                </option>
              ))}
            </select>
            {inquilinos.length === 0 && (
              <small style={{ color: "red" }}>
                No hay inquilinos registrados
              </small>
            )}
          </div>

          <div className={styles.formRow}>
            <InputCustom
              title="Fecha Inicio *"
              type="date"
              value={fechaInicio}
              setValue={setFechaInicio}
            />
            <InputCustom
              title="Fecha Fin *"
              type="date"
              value={fechaFin}
              setValue={setFechaFin}
            />
          </div>

          <InputCustom
            title="Valor Mensual *"
            type="number"
            value={valorMensual}
            setValue={setValorMensual}
            placeholder="Ingrese el valor mensual"
          />

          <div className={styles.formGroup}>
            <label>Tipo Contrato *</label>
            <select
              className={styles.selectModal}
              value={tipoContrato}
              onChange={(e) => setTipoContrato(e.target.value)}
              disabled={guardando}
            >
              <option value="RESIDENCIAL">Residencial</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="TEMPORADA_CORTA">Temporada Corta</option>
              <option value="TEMPORADA_LARGA">Temporada Larga</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Forma de Pago *</label>
            <select
              className={styles.selectModal}
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              disabled={guardando}
            >
              <option value="MENSUAL">Mensual</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="SEMESTRAL">Semestral</option>
              <option value="ANUAL">Anual</option>
            </select>
          </div>

          <InputCustom
            title="Observaciones"
            type="text"
            value={observaciones}
            setValue={setObservaciones}
            placeholder="Opcional: Ingrese observaciones"
          />

          <div className={styles.formGroup}>
            <label>Estado *</label>
            <select
              className={styles.selectModal}
              value={estadoContrato}
              onChange={(e) =>
                setEstadoContrato(e.target.value as EstadoContrato)
              }
              disabled={guardando}
            >
              <option value={EstadoContrato.CREADO}>Creado</option>
              <option value={EstadoContrato.ACTIVO}>Activo</option>
              <option value={EstadoContrato.SUSPENDIDO}>Suspendido</option>
              <option value={EstadoContrato.RECHAZADO}>Rechazado</option>
              <option value={EstadoContrato.TERMINADO}>Terminado</option>
            </select>
          </div>
        </div>
      </ModalComponente>

      {/* MODAL DE TRANSICIONES */}
      <ModalComponente
        openModal={mostrarModalTransicion}
        setOpenModal={setMostrarModalTransicion}
        nombreModal="Resultado de Transición de Estado"
        guardar={() => setMostrarModalTransicion(false)}
      >
        <div className={styles.modalResultado}>
          {!resultadoTransicion?.valido ? (
            <>
              <div className={styles.iconoError}>❌</div>
              <h3 className={styles.tituloError}>Transición No Permitida</h3>

              <div className={styles.seccionMotivo}>
                <h4 className={styles.subtituloSeccion}>Motivo del Rechazo:</h4>
                <p className={styles.textoMotivo}>
                  {resultadoTransicion?.motivo || "No se especificó un motivo"}
                </p>
              </div>

              {resultadoTransicion?.recomendaciones &&
                resultadoTransicion.recomendaciones.length > 0 && (
                  <div className={styles.seccionRecomendaciones}>
                    <h4 className={styles.subtituloSeccion}>
                      Recomendaciones:
                    </h4>
                    <ul className={styles.listaRecomendaciones}>
                      {resultadoTransicion.recomendaciones.map((rec, i) => (
                        <li key={i} className={styles.itemRecomendacion}>
                          <span className={styles.numeroItem}>{i + 1}</span>
                          <span className={styles.textoItem}>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {resultadoTransicion?.alternativas &&
                resultadoTransicion.alternativas.length > 0 && (
                  <div className={styles.seccionAlternativas}>
                    <h4 className={styles.subtituloSeccion}>
                      Transiciones Alternativas:
                    </h4>
                    <ul className={styles.listaAlternativas}>
                      {resultadoTransicion.alternativas.map((alt, i) => (
                        <li key={i} className={styles.itemAlternativa}>
                          <span className={styles.iconoCheck}>✓</span>
                          <span className={styles.textoItem}>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className={styles.accionesModal}>
                <button
                  className={styles.btnCerrarModal}
                  onClick={() => setMostrarModalTransicion(false)}
                >
                  Entendido
                </button>
              </div>
            </>
          ) : resultadoEjecucion ? (
            <>
              <div
                className={
                  resultadoEjecucion.exito
                    ? styles.iconoExito
                    : styles.iconoError
                }
              >
                {resultadoEjecucion.exito ? "✅" : "❌"}
              </div>
              <h3
                className={
                  resultadoEjecucion.exito
                    ? styles.tituloExito
                    : styles.tituloError
                }
              >
                {resultadoEjecucion.exito
                  ? "¡Transición Exitosa!"
                  : "Error en la Transición"}
              </h3>

              <div className={styles.seccionMensaje}>
                <h4 className={styles.subtituloSeccion}>
                  {resultadoEjecucion.exito ? "Resultado:" : "Error:"}
                </h4>
                <p className={styles.mensajeResultado}>
                  {resultadoEjecucion.mensaje}
                </p>
              </div>

              <div className={styles.seccionEstadoActual}>
                <h4 className={styles.subtituloSeccion}>Estado Actual:</h4>
                <div className={styles.badgeEstadoActual}>
                  <span className={styles.estadoActualTexto}>
                    {resultadoEjecucion.estadoActual}
                  </span>
                </div>
              </div>

              {resultadoEjecucion.exito && (
                <div className={styles.seccionInformacion}>
                  <p className={styles.textoInformacion}>
                    El contrato ha cambiado de estado exitosamente. Los cambios
                    se han registrado en el historial.
                  </p>
                </div>
              )}

              <div className={styles.accionesModal}>
                <button
                  className={styles.btnCerrarModal}
                  onClick={() => setMostrarModalTransicion(false)}
                >
                  {resultadoEjecucion.exito ? "Perfecto" : "Cerrar"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.spinner}></div>
              <p className={styles.textoCargando}>Analizando transición...</p>
              <p className={styles.textoEspera}>Por favor espera</p>
            </>
          )}
        </div>
      </ModalComponente>

      <Footer />
    </div>
  );
};

export default PropietarioContratos;
