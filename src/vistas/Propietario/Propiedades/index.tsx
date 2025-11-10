// ========================================
// GESTIÓN DE PROPIEDADES - ROL PROPIETARIO
// ========================================
//
// Página completa de administración de propiedades para propietarios con CRUD y transiciones.
// Permite crear, editar, eliminar, visualizar y gestionar estados de propiedades.
//
// FUNCIONALIDADES:
// - Listado completo de propiedades con filtros y búsqueda.
// - CRUD completo: Crear, editar, eliminar, visualizar propiedades.
// - Transiciones de estado validadas con autómata.
// - Modal de formulario para crear/editar.
// - Modal de resultados de transiciones.
// - Estadísticas de propiedades por estado y área total.
// - Navegación a detalle de propiedad.
// - Galería de imágenes de Unsplash.
//
// SEGURIDAD:
// - verificarAcceso(): Valida autenticación y rol PROPIETARIO exclusivamente.
// - Redirección a login si no hay sesión.
// - Redirección a home si rol no es PROPIETARIO.
//
// ESTADO PRINCIPAL:
// - propiedades: Lista completa de propiedades.
// - propiedadesFiltradas: Subset filtrado por estado y búsqueda.
// - cargando: Indica carga inicial.
// - error: Mensaje de error.
// - busqueda: Texto de búsqueda.
// - filtroEstado: Estado seleccionado ("TODAS", "DISPONIBLE", "ARRENDADA", etc).
//
// ESTADO DEL MODAL:
// - mostrarModal: Boolean para mostrar/ocultar modal formulario.
// - propiedadSeleccionada: Propiedad que se está editando (null = crear).
//
// ESTADO DE TRANSICIONES:
// - resultadoTransicion: Resultado de validación (ResultadoValidacion).
// - resultadoEjecucion: Resultado de ejecución (ResultadoEjecucion).
// - mostrarModalTransicion: Boolean para modal de transiciones.
//
// ESTADO DEL FORMULARIO:
// - direccion, ciudad: Campos requeridos.
// - area, habitaciones, banos: Campos numéricos requeridos.
// - parqueaderos, pisos, anoConstruccion: Campos numéricos opcionales.
// - amoblado: Boolean (checkbox).
// - descripcion: Texto largo opcional.
// - tipo: Enum TipoPropiedad.
// - estado: Enum EstadoPropiedad.
//
// FUNCIONES DE CARGA:
//
// cargarPropiedades():
// - Obtiene todas las propiedades con PropiedadService.obtenerPropiedades().
// - Logging de datos recibidos.
// - Maneja arrays vacíos como fallback.
//
// aplicarFiltros():
// - Filtra por búsqueda: dirección o ciudad (case-insensitive).
// - Filtra por estado si no es "TODAS".
//
// calcularEstadisticas():
// - Total de propiedades.
// - Disponibles (estado DISPONIBLE).
// - Ocupadas (estado ARRENDADA).
// - Área total (suma de todas las áreas).
//
// FUNCIONES DEL MODAL:
//
// limpiarFormulario():
// - Resetea todos los campos a valores default.
//
// cargarDatosEnFormulario():
// - Carga datos de propiedad en formulario.
// - Maneja campo piso/pisos con @ts-ignore.
// - Convierte números a string para inputs.
//
// abrirModalCrear():
// - Limpia formulario.
// - Establece propiedadSeleccionada = null.
//
// abrirModalEditar():
// - Carga datos en formulario.
// - Establece propiedadSeleccionada.
//
// handleGuardar():
// - Validaciones:
//   * Dirección y ciudad requeridas
//   * Área > 0
// - Obtiene idPropietario desde usuario logueado.
// - **Modo creación**:
//   * Construye objeto con todos los campos
//   * Valores default: parqueaderos=0, piso=1, año=actual
//   * Usa crearPropiedad()
// - **Modo edición**:
//   * Construye objeto similar sin idPropietario
//   * Usa actualizarPropiedad()
// - Recarga propiedades después de éxito.
// - Cierra modal y limpia formulario.
//
// handleEliminar():
// - Confirmación con confirm().
// - Usa eliminarPropiedad().
// - Recarga propiedades después de éxito.
//
// FUNCIONES DE TRANSICIONES:
//
// manejarTransicion():
// - Recibe propiedadId y evento.
// - **Análisis**: analizarTransicionPropiedad(propiedadId, evento).
// - Si no válida: Muestra modal con motivo, recomendaciones, alternativas.
// - Si válida: **Ejecuta** ejecutarTransicionPropiedad(propiedadId, evento).
// - Muestra modal con resultado.
// - Recarga propiedades después de ejecución.
//
// TRANSICIONES DISPONIBLES:
// - CREAR_CONTRATO_PROPIEDAD (Arrendar)
// - TERMINAR_CONTRATO_PROPIEDAD
// - RESERVAR_PROPIEDAD
// - CANCELAR_RESERVA_PROPIEDAD
// - REPORTAR_MANTENIMIENTO_PROPIEDAD
// - FINALIZAR_MANTENIMIENTO_PROPIEDAD
//
// ESTADOS DE PROPIEDAD:
// - DISPONIBLE: Verde
// - ARRENDADA: Naranja
// - EN_MANTENIMIENTO: Gris
// - RESERVADA: Azul
// - EN_VERIFICACION: Amarillo
//
// TIPOS DE PROPIEDAD:
// APARTAMENTO, CASA, DUPLEX, PENTHOUSE, APARTAMENTO_ESTUDIO, CASA_PLAYA,
// OFICINA, LOCAL_COMERCIAL, BODEGA, GALPON, CONSULTORIO, TERRENO, FINCA, GARAJE
//
// COMPONENTES VISUALES:
//
// Encabezado:
// - Botón volver (navigate(-1)).
// - Título "Mis Propiedades".
// - Botón "+ Nueva Propiedad".
//
// Estadísticas (Grid 4 columnas):
// 1. Total Propiedades
// 2. Disponibles (icono verde)
// 3. Arrendadas (icono naranja)
// 4. Área Total (icono azul)
//
// Filtros:
// - Barra de búsqueda con icono Search.
// - Select de estado: Todas, Disponibles, Arrendadas, En Mantenimiento, Reservadas, En Verificación.
//
// Grid de Propiedades:
// - Cards con:
//   * Imagen de Unsplash (rotación del array)
//   * Badge de estado sobre imagen
//   * Dirección (título)
//   * Ciudad con icono MapPin
//   * Características: Área, Habitaciones, Baños
//   * Tags: Amoblado, Parqueaderos (si aplica)
//   * Acciones: Ver, Editar, Eliminar
//   * Select de transiciones
//
// Modal Formulario (CRUD):
// - Grid 2 columnas con inputs:
//   * Dirección, Ciudad, Área, Habitaciones, Baños, Parqueaderos
//   * Pisos, Año Construcción
//   * Select Tipo de Propiedad (14 opciones)
//   * Select Estado (5 opciones)
//   * Checkbox Amoblado
// - Textarea Descripción (full width)
//
// Modal Transiciones:
// - **Tres estados**:
//   1. **Cargando**: Spinner con mensaje.
//   2. **No válida**: Icono ❌, motivo, recomendaciones, alternativas.
//   3. **Ejecutada**: Icono ✅ o ❌, mensaje, estado actual, información adicional.
//
// NAVEGACIÓN:
// - Volver: navigate(-1) (página anterior)
// - Ver propiedad: /propietario/propiedades/{id}
//
// IMÁGENES:
// - Array de 9 URLs de Unsplash con propiedades.
// - Rotación mediante módulo del índice.
// - Fallback a placeholder si falla la carga.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando propiedades...".
// - Error: Mensaje y botón reintentar.
// - Sin datos: Icono Home con mensaje.
//
// CARACTERÍSTICAS:
// - Vista completa para propietario con CRUD y transiciones.
// - Validación de campos requeridos.
// - Manejo de errores del backend.
// - Logging de datos recibidos.
// - Confirmación antes de eliminar.
// - Defaults inteligentes (año actual, piso 1, etc).
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para estadísticas y propiedades.
// - Cards con imágenes y overlays.
// - Modal con secciones coloreadas según resultado.
// - Badges dinámicos según estado.
// - Tags informativos.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import type { DTOPropiedadRespuesta } from "../../../modelos/types/Propiedad";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import { EstadoPropiedad } from "../../../modelos/enumeraciones/estadoPropiedad";
import { PropiedadService } from "../../../servicios/propiedades";
import styles from "./PropietarioPropiedades.module.css";
import { Home, MapPin, Edit3, Eye, Trash2, Plus, Search } from "react-feather";
import { ModalComponente } from "../../../componentes/Modal";
import InputCustom from "../../../componentes/ui/Input";
import { TipoPropiedad } from "../../../modelos/enumeraciones/tipoPropiedad";
import type { Evento } from "../../../modelos/enumeraciones/evento";
import type {
  ResultadoValidacion,
  ResultadoEjecucion,
} from "../../../servicios/propiedades";

const PropietarioPropiedades: React.FC = () => {
  const navigate = useNavigate();

  const [propiedades, setPropiedades] = useState<DTOPropiedadRespuesta[]>([]);
  const [propiedadesFiltradas, setPropiedadesFiltradas] = useState<
    DTOPropiedadRespuesta[]
  >([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODAS");

  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [propiedadSeleccionada, setPropiedadSeleccionada] =
    useState<DTOPropiedadRespuesta | null>(null);

  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [area, setArea] = useState("");
  const [habitaciones, setHabitaciones] = useState("");
  const [banos, setBanos] = useState("");
  const [parqueaderos, setParqueaderos] = useState("");
  const [amoblado, setAmoblado] = useState(false);
  const [pisos, setPisos] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [anoConstruccion, setAnoConstruccion] = useState("");
  const [tipo, setTipo] = useState<TipoPropiedad | "">("");
  const [estado, setEstado] = useState<EstadoPropiedad>(
    EstadoPropiedad.DISPONIBLE
  );

  const [resultadoTransicion, setResultadoTransicion] =
    useState<ResultadoValidacion | null>(null);
  const [resultadoEjecucion, setResultadoEjecucion] =
    useState<ResultadoEjecucion | null>(null);
  const [mostrarModalTransicion, setMostrarModalTransicion] = useState(false);

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [propiedades, busqueda, filtroEstado]);

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
        await Swal.fire({
          title: "Acceso Denegado",
          text: "No tienes permisos para acceder a esta sección",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        navigate("/");
        return;
      }

      await cargarPropiedades();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarPropiedades = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await PropiedadService.obtenerPropiedades();
      console.log("Propiedades recibidas del backend:", data);
      setPropiedades(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("Error al cargar las propiedades");
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...propiedades];

    if (busqueda) {
      resultado = resultado.filter((prop) => {
        const direccion = (prop.direccion || "").toLowerCase();
        const ciudad = (prop.ciudad || "").toLowerCase();
        return (
          direccion.includes(busqueda.toLowerCase()) ||
          ciudad.includes(busqueda.toLowerCase())
        );
      });
    }

    if (filtroEstado !== "TODAS") {
      resultado = resultado.filter((prop) => prop.estado === filtroEstado);
    }

    setPropiedadesFiltradas(resultado);
  };

  const calcularEstadisticas = () => {
    const totalPropiedades = propiedades.length;
    const disponibles = propiedades.filter(
      (p) => p.estado === EstadoPropiedad.DISPONIBLE
    ).length;
    const ocupadas = propiedades.filter(
      (p) => p.estado === EstadoPropiedad.ARRENDADA
    ).length;
    const areaTotal = propiedades.reduce((sum, p) => sum + (p.area || 0), 0);

    return { totalPropiedades, disponibles, ocupadas, areaTotal };
  };

  const limpiarFormulario = () => {
    setDireccion("");
    setCiudad("");
    setArea("");
    setHabitaciones("");
    setBanos("");
    setParqueaderos("");
    setAmoblado(false);
    setPisos("");
    setDescripcion("");
    setAnoConstruccion("");
    setEstado(EstadoPropiedad.DISPONIBLE);
    setTipo("");
  };

  const cargarDatosEnFormulario = (propiedad: DTOPropiedadRespuesta) => {
    setDireccion(propiedad.direccion || "");
    setCiudad(propiedad.ciudad || "");
    setArea(String(propiedad.area || ""));
    setHabitaciones(String(propiedad.habitaciones || ""));
    setBanos(String(propiedad.banos || ""));
    setParqueaderos(String(propiedad.parqueaderos || ""));
    setAmoblado(propiedad.amoblado || false);
    // @ts-ignore
    setPisos(String(propiedad.piso || propiedad.pisos || ""));
    setDescripcion(propiedad.descripcion || "");
    setAnoConstruccion(String(propiedad.anoConstruccion || ""));
    setEstado(propiedad.estado || EstadoPropiedad.DISPONIBLE);
    setTipo(propiedad.tipo || "");
  };

  const abrirModalCrear = () => {
    limpiarFormulario();
    setPropiedadSeleccionada(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (propiedad: DTOPropiedadRespuesta) => {
    cargarDatosEnFormulario(propiedad);
    setPropiedadSeleccionada(propiedad);
    setMostrarModal(true);
  };

  const handleGuardar = async () => {
    try {
      if (!direccion || !ciudad) {
        await Swal.fire({
          title: "Campos Requeridos",
          text: "Dirección y ciudad son obligatorios",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      const areaNum = Number(area);
      const habitacionesNum = Number(habitaciones);
      const banosNum = Number(banos);

      if (areaNum <= 0) {
        await Swal.fire({
          title: "Área Inválida",
          text: "El área debe ser mayor a 0",
          icon: "warning",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      const usuarioString = localStorage.getItem("usuario");
      if (!usuarioString) {
        await Swal.fire({
          title: "Error",
          text: "No se pudo obtener la información del usuario",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const propietarioId = usuario.idUsuario || usuario.id;

      if (!propietarioId) {
        await Swal.fire({
          title: "Error",
          text: "No se pudo obtener el ID del propietario",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
        return;
      }

      if (propiedadSeleccionada === null) {
        const datos: any = {
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          area: areaNum,
          habitaciones: habitacionesNum,
          banos: banosNum,
          parqueaderos: Number(parqueaderos) || 0,
          amoblado: Boolean(amoblado),
          piso: Number(pisos) || 1,
          descripcion: descripcion.trim(),
          anoConstruccion: Number(anoConstruccion) || new Date().getFullYear(),
          estado: estado,
          tipo: tipo || TipoPropiedad.APARTAMENTO,
          idPropietario: propietarioId,
        };

        await PropiedadService.crearPropiedad(datos);
        await Swal.fire({
          title: "Éxito",
          text: "Propiedad creada correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const datosActualizar: any = {
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          area: areaNum,
          habitaciones: habitacionesNum,
          banos: banosNum,
          parqueaderos: Number(parqueaderos) || 0,
          amoblado: Boolean(amoblado),
          piso: Number(pisos) || 1,
          descripcion: descripcion.trim(),
          anoConstruccion: Number(anoConstruccion) || new Date().getFullYear(),
          estado: estado,
          tipo: tipo || TipoPropiedad.APARTAMENTO,
        };

        await PropiedadService.actualizarPropiedad(
          propiedadSeleccionada.idPropiedad || 0,
          datosActualizar
        );
        await Swal.fire({
          title: "Éxito",
          text: "Propiedad actualizada correctamente",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      await cargarPropiedades();
      setMostrarModal(false);
      limpiarFormulario();
    } catch (err: any) {
      console.error("ERROR COMPLETO:", err);
      const mensajeError =
        err.response?.data?.message || err.response?.data?.error || err.message;
      
      await Swal.fire({
        title: "Error",
        text: mensajeError,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const handleEliminar = async (propiedadId: number) => {
    const resultado = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
    });

    if (!resultado.isConfirmed) return;

    try {
      await PropiedadService.eliminarPropiedad(propiedadId);
      await Swal.fire({
        title: "Eliminada",
        text: "Propiedad eliminada correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      await cargarPropiedades();
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      const mensajeError = err.response?.data?.message || err.message;
      
      await Swal.fire({
        title: "Error al Eliminar",
        text: mensajeError,
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const manejarTransicion = async (
    propiedadId: number,
    evento: Evento | string
  ) => {
    if (!evento) return;
    try {
      setResultadoTransicion(null);
      setResultadoEjecucion(null);

      const validacion = await PropiedadService.analizarTransicionPropiedad(
        propiedadId,
        evento as Evento
      );
      setResultadoTransicion(validacion);

      if (!validacion.valido) {
        setMostrarModalTransicion(true);
        return;
      }

      const ejecucion = await PropiedadService.ejecutarTransicionPropiedad(
        propiedadId,
        evento as Evento
      );
      setResultadoEjecucion(ejecucion);
      setMostrarModalTransicion(true);

      await cargarPropiedades();
    } catch (err: any) {
      setResultadoTransicion({
        valido: false,
        motivo: err.message || "Error desconocido",
      });
      setMostrarModalTransicion(true);
    }
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando propiedades...</p>
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
            <BotonComponente label="Reintentar" onClick={cargarPropiedades} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = calcularEstadisticas();
  const esEdicion = propiedadSeleccionada !== null;

  const imagenes = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1599423300746-b62533397364?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1600585154603-03e2a5b81c28?w=400&h=250&fit=crop",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
  ];

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <div>
              <button className={styles.btnVolver} onClick={() => navigate(-1)}>
                ← Volver
              </button>
              <h1>Mis Propiedades</h1>
              <p className={styles.subtitulo}>
                Administra y gestiona tus propiedades en arriendo
              </p>
            </div>
            <button className={styles.btnNuevo} onClick={abrirModalCrear}>
              <Plus size={18} />
              Nueva Propiedad
            </button>
          </div>

          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Home size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Propiedades</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.totalPropiedades}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Propiedades registradas
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div
                className={`${styles.iconoEstadistica} ${styles.iconoVerde}`}
              >
                <Home size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Disponibles</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.disponibles}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Listas para arrendar
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div
                className={`${styles.iconoEstadistica} ${styles.iconoNaranja}`}
              >
                <Home size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Arrendadas</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.ocupadas}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  En arriendo actualmente
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={`${styles.iconoEstadistica} ${styles.iconoAzul}`}>
                <Home size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Área Total</p>
                <h2 className={styles.valorEstadistica}>
                  {estadisticas.areaTotal} m²
                </h2>
                <p className={styles.descripcionEstadistica}>
                  Metros cuadrados totales
                </p>
              </div>
            </div>
          </div>

          <div className={styles.seccionFiltros}>
            <div className={styles.barraBusqueda}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por dirección o ciudad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.inputBusqueda}
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={styles.selectFiltro}
            >
              <option value="TODAS">Todas</option>
              <option value={EstadoPropiedad.DISPONIBLE}>Disponibles</option>
              <option value={EstadoPropiedad.ARRENDADA}>Arrendadas</option>
              <option value={EstadoPropiedad.EN_MANTENIMIENTO}>
                En Mantenimiento
              </option>
              <option value={EstadoPropiedad.RESERVADA}>Reservadas</option>
              <option value={EstadoPropiedad.EN_VERIFICACION}>
                En Verificación
              </option>
            </select>
          </div>

          {propiedadesFiltradas.length === 0 ? (
            <div className={styles.sinDatos}>
              <Home size={48} />
              <p>No se encontraron propiedades</p>
            </div>
          ) : (
            <div className={styles.gridPropiedades}>
              {propiedadesFiltradas.map((propiedad) => (
                <div
                  key={propiedad.idPropiedad}
                  className={styles.tarjetaPropiedad}
                >
                  <div className={styles.imagenPropiedad}>
                    <img
                      src={
                        imagenes[
                          propiedadesFiltradas.indexOf(propiedad) %
                            imagenes.length
                        ]
                      }
                      alt="Propiedad"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x250/e5e7eb/6b7280?text=Propiedad";
                      }}
                    />
                    <span
                      className={`${styles.badge} ${
                        propiedad.estado === EstadoPropiedad.DISPONIBLE
                          ? styles.badgeDisponible
                          : propiedad.estado === EstadoPropiedad.ARRENDADA
                          ? styles.badgeOcupada
                          : styles.badgeMantenimiento
                      }`}
                    >
                      {propiedad.estado === EstadoPropiedad.DISPONIBLE &&
                        "Disponible"}
                      {propiedad.estado === EstadoPropiedad.ARRENDADA &&
                        "Arrendada"}
                      {propiedad.estado === EstadoPropiedad.EN_MANTENIMIENTO &&
                        "Mantenimiento"}
                      {propiedad.estado === EstadoPropiedad.RESERVADA &&
                        "Reservada"}
                      {propiedad.estado === EstadoPropiedad.EN_VERIFICACION &&
                        "En Verificación"}
                    </span>
                  </div>

                  <div className={styles.contenidoPropiedad}>
                    <h3>{propiedad.direccion}</h3>
                    <div className={styles.ubicacion}>
                      <MapPin size={16} />
                      <span>{propiedad.ciudad}</span>
                    </div>

                    <div className={styles.caracteristicas}>
                      <div className={styles.caracteristica}>
                        <span>Área:</span>
                        <strong>{propiedad.area || 0} m²</strong>
                      </div>
                      <div className={styles.caracteristica}>
                        <span>Habitaciones:</span>
                        <strong>{propiedad.habitaciones || 0}</strong>
                      </div>
                      <div className={styles.caracteristica}>
                        <span>Baños:</span>
                        <strong>{propiedad.banos || 0}</strong>
                      </div>
                    </div>

                    <div className={styles.infoAdicional}>
                      {propiedad.amoblado && (
                        <span className={styles.tagAmoblado}>Amoblado</span>
                      )}
                      {propiedad.parqueaderos! > 0 && (
                        <span className={styles.tagParqueadero}>
                          {propiedad.parqueaderos} Parqueaderos
                        </span>
                      )}
                    </div>

                    <div className={styles.acciones}>
                      <button
                        className={styles.btnAccion}
                        onClick={() =>
                          navigate(
                            `/propietario/propiedades/${propiedad.idPropiedad}`
                          )
                        }
                      >
                        <Eye size={16} />
                        Ver
                      </button>
                      <button
                        className={styles.btnAccion}
                        onClick={() => abrirModalEditar(propiedad)}
                      >
                        <Edit3 size={16} />
                        Editar
                      </button>
                      <button
                        className={styles.btnEliminar}
                        onClick={() =>
                          handleEliminar(propiedad.idPropiedad || 0)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <select
                      defaultValue=""
                      onChange={(e) => {
                        manejarTransicion(
                          propiedad.idPropiedad || 0,
                          e.target.value
                        );
                        e.target.value = "";
                      }}
                      className={styles.selectTransicion}
                    >
                      <option value="">Transición de Estado...</option>
                      <option value="CREAR_CONTRATO_PROPIEDAD">
                        Arrendar (Crear Contrato)
                      </option>
                      <option value="TERMINAR_CONTRATO_PROPIEDAD">
                        Terminar Contrato
                      </option>
                      <option value="RESERVAR_PROPIEDAD">
                        Reservar Propiedad
                      </option>
                      <option value="CANCELAR_RESERVA_PROPIEDAD">
                        Cancelar Reserva
                      </option>
                      <option value="REPORTAR_MANTENIMIENTO_PROPIEDAD">
                        Enviar a Mantenimiento
                      </option>
                      <option value="FINALIZAR_MANTENIMIENTO_PROPIEDAD">
                        Finalizar Mantenimiento
                      </option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <ModalComponente
        openModal={mostrarModal}
        setOpenModal={setMostrarModal}
        nombreModal={esEdicion ? "Editar Propiedad" : "Nueva Propiedad"}
        guardar={handleGuardar}
      >
        <div className={styles.formModal}>
          <div className={styles.formGrid}>
            <InputCustom
              title="Dirección *"
              value={direccion}
              setValue={setDireccion}
              placeholder="Ej: Calle 123 #45-67"
            />

            <InputCustom
              title="Ciudad *"
              value={ciudad}
              setValue={setCiudad}
              placeholder="Ej: Bogotá"
            />

            <InputCustom
              title="Área (m²) *"
              type="number"
              value={area}
              setValue={setArea}
              placeholder="Ej: 120"
            />

            <InputCustom
              title="Habitaciones *"
              type="number"
              value={habitaciones}
              setValue={setHabitaciones}
              placeholder="Ej: 3"
            />

            <InputCustom
              title="Baños *"
              type="number"
              value={banos}
              setValue={setBanos}
              placeholder="Ej: 2"
            />

            <InputCustom
              title="Parqueaderos"
              type="number"
              value={parqueaderos}
              setValue={setParqueaderos}
              placeholder="Ej: 1"
            />

            <InputCustom
              title="Pisos"
              type="number"
              value={pisos}
              setValue={setPisos}
              placeholder="Ej: 2"
            />

            <InputCustom
              title="Año Construcción"
              type="number"
              value={anoConstruccion}
              setValue={setAnoConstruccion}
              placeholder={`Ej: ${new Date().getFullYear()}`}
            />

            <div className={styles.formGrupo}>
              <label htmlFor="tipo">Tipo de Propiedad *</label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoPropiedad)}
                className={styles.select}
              >
                <option value="">Seleccione...</option>
                <option value={TipoPropiedad.APARTAMENTO}>Apartamento</option>
                <option value={TipoPropiedad.CASA}>Casa</option>
                <option value={TipoPropiedad.DUPLEX}>Dúplex</option>
                <option value={TipoPropiedad.PENTHOUSE}>Penthouse</option>
                <option value={TipoPropiedad.APARTAMENTO_ESTUDIO}>
                  Apartamento Estudio
                </option>
                <option value={TipoPropiedad.CASA_PLAYA}>Casa de Playa</option>
                <option value={TipoPropiedad.OFICINA}>Oficina</option>
                <option value={TipoPropiedad.LOCAL_COMERCIAL}>
                  Local Comercial
                </option>
                <option value={TipoPropiedad.BODEGA}>Bodega</option>
                <option value={TipoPropiedad.GALPON}>Galpón</option>
                <option value={TipoPropiedad.CONSULTORIO}>Consultorio</option>
                <option value={TipoPropiedad.TERRENO}>Terreno</option>
                <option value={TipoPropiedad.FINCA}>Finca</option>
                <option value={TipoPropiedad.GARAJE}>Garaje</option>
              </select>
            </div>

            <div className={styles.formGrupo}>
              <label htmlFor="estado">Estado *</label>
              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoPropiedad)}
                className={styles.select}
              >
                <option value={EstadoPropiedad.DISPONIBLE}>Disponible</option>
                <option value={EstadoPropiedad.ARRENDADA}>Arrendada</option>
                <option value={EstadoPropiedad.EN_MANTENIMIENTO}>
                  En Mantenimiento
                </option>
                <option value={EstadoPropiedad.RESERVADA}>Reservada</option>
                <option value={EstadoPropiedad.EN_VERIFICACION}>
                  En Verificación
                </option>
              </select>
            </div>

            <div className={styles.formGrupo}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={amoblado}
                  onChange={(e) => setAmoblado(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Amoblado</span>
              </label>
            </div>
          </div>

          <div className={styles.formGrupo}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={styles.textarea}
              rows={4}
              placeholder="Descripción detallada de la propiedad..."
            ></textarea>
          </div>
        </div>
      </ModalComponente>

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
                <h4 className={styles.subtituloSeccion}>
                  Motivo del Rechazo:
                </h4>
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
                      Transiciones Alternativas Disponibles:
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
                <h4 className={styles.subtituloSeccion}>
                  Estado Actual de la Propiedad:
                </h4>
                <div className={styles.badgeEstadoActual}>
                  <span className={styles.estadoActualTexto}>
                    {resultadoEjecucion.estadoActual}
                  </span>
                </div>
              </div>

              {resultadoEjecucion.exito && (
                <div className={styles.seccionInformacion}>
                  <p className={styles.textoInformacion}>
                    La propiedad ha cambiado de estado exitosamente. Los cambios
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
              <p className={styles.textoCargando}>
                Analizando transición de estado...
              </p>
              <p className={styles.textoEspera}>Por favor espera un momento</p>
            </>
          )}
        </div>
      </ModalComponente>
    </div>
  );
};

export default PropietarioPropiedades;

