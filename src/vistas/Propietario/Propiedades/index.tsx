import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // Estados para transiciones de estado
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
        alert("No tienes permisos para acceder a esta sección");
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
        alert("Dirección y ciudad son obligatorios");
        return;
      }

      const areaNum = Number(area);
      const habitacionesNum = Number(habitaciones);
      const banosNum = Number(banos);

      if (areaNum <= 0) {
        alert("El área debe ser mayor a 0");
        return;
      }

      const usuarioString = localStorage.getItem("usuario");
      if (!usuarioString) {
        alert("No se pudo obtener la información del usuario");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const propietarioId = usuario.idUsuario || usuario.id;

      if (!propietarioId) {
        alert("No se pudo obtener el ID del propietario");
        return;
      }

      if (propiedadSeleccionada === null) {
        // Crear
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
        alert("Propiedad creada correctamente");
      } else {
        // Actualizar
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
        alert("Propiedad actualizada correctamente");
      }

      await cargarPropiedades();
      setMostrarModal(false);
      limpiarFormulario();
    } catch (err: any) {
      console.error("ERROR COMPLETO:", err);
      const mensajeError =
        err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Error: ${mensajeError}`);
    }
  };

  const handleEliminar = async (propiedadId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;

    try {
      await PropiedadService.eliminarPropiedad(propiedadId);
      alert("Propiedad eliminada correctamente");
      await cargarPropiedades();
    } catch (err: any) {
      console.error("Error al eliminar:", err);
      const mensajeError = err.response?.data?.message || err.message;
      alert(`Error al eliminar: ${mensajeError}`);
    }
  };

  // Manejador para transiciones de estado con validación y ejecución
  const manejarTransicion = async (
    propiedadId: number,
    evento: Evento | string
  ) => {
    if (!evento) return;
    try {
      setResultadoTransicion(null);
      setResultadoEjecucion(null);

      // Validar transición
      const validacion = await PropiedadService.analizarTransicionPropiedad(
        propiedadId,
        evento as Evento
      );
      setResultadoTransicion(validacion);

      if (!validacion.valido) {
        setMostrarModalTransicion(true);
        return;
      }

      // Ejecutar transición
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

                    {/* ✅ SELECTOR DE TRANSICIONES ACTUALIZADO */}
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
                        🏠 Arrendar (Crear Contrato)
                      </option>
                      <option value="TERMINAR_CONTRATO_PROPIEDAD">
                        🔓 Terminar Contrato
                      </option>
                      <option value="RESERVAR_PROPIEDAD">
                        📅 Reservar Propiedad
                      </option>
                      <option value="CANCELAR_RESERVA_PROPIEDAD">
                        ❌ Cancelar Reserva
                      </option>
                      <option value="REPORTAR_MANTENIMIENTO_PROPIEDAD">
                        🔧 Enviar a Mantenimiento
                      </option>
                      <option value="FINALIZAR_MANTENIMIENTO_PROPIEDAD">
                        ✅ Finalizar Mantenimiento
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

      {/* Modal para crear/editar propiedad */}
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

      {/* Modal para mostrar resultados/errores de transiciones */}
      <ModalComponente
        openModal={mostrarModalTransicion}
        setOpenModal={setMostrarModalTransicion}
        nombreModal="Resultado de Transición de Estado"
        guardar={() => setMostrarModalTransicion(false)}
      >
        <div className={styles.modalResultado}>
          {!resultadoTransicion?.valido ? (
            <>
              {/* TRANSICIÓN NO VÁLIDA */}
              <div className={styles.iconoError}>❌</div>
              <h3 className={styles.tituloError}>Transición No Permitida</h3>

              {/* Motivo del rechazo */}
              <div className={styles.seccionMotivo}>
                <h4 className={styles.subtituloSeccion}>
                  📋 Motivo del Rechazo:
                </h4>
                <p className={styles.textoMotivo}>
                  {resultadoTransicion?.motivo || "No se especificó un motivo"}
                </p>
              </div>

              {/* Recomendaciones */}
              {resultadoTransicion?.recomendaciones &&
                resultadoTransicion.recomendaciones.length > 0 && (
                  <div className={styles.seccionRecomendaciones}>
                    <h4 className={styles.subtituloSeccion}>
                      💡 Recomendaciones:
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

              {/* Alternativas disponibles */}
              {resultadoTransicion?.alternativas &&
                resultadoTransicion.alternativas.length > 0 && (
                  <div className={styles.seccionAlternativas}>
                    <h4 className={styles.subtituloSeccion}>
                      🔀 Transiciones Alternativas Disponibles:
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

              {/* Botón de cerrar */}
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
              {/* TRANSICIÓN EXITOSA */}
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

              {/* Mensaje de resultado */}
              <div className={styles.seccionMensaje}>
                <h4 className={styles.subtituloSeccion}>
                  {resultadoEjecucion.exito ? "✨ Resultado:" : "⚠️ Error:"}
                </h4>
                <p className={styles.mensajeResultado}>
                  {resultadoEjecucion.mensaje}
                </p>
              </div>

              {/* Estado actual */}
              <div className={styles.seccionEstadoActual}>
                <h4 className={styles.subtituloSeccion}>
                  🏷️ Estado Actual de la Propiedad:
                </h4>
                <div className={styles.badgeEstadoActual}>
                  <span className={styles.estadoActualTexto}>
                    {resultadoEjecucion.estadoActual}
                  </span>
                </div>
              </div>

              {/* Información adicional si es exitoso */}
              {resultadoEjecucion.exito && (
                <div className={styles.seccionInformacion}>
                  <p className={styles.textoInformacion}>
                    La propiedad ha cambiado de estado exitosamente. Los cambios
                    se han registrado en el historial.
                  </p>
                </div>
              )}

              {/* Botones de acción */}
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
              {/* ESTADO DE CARGA */}
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
