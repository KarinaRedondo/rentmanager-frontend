import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import type { DTOPropiedadRespuesta } from "../../../modelos/types/Propiedad";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import { EstadoPropiedad } from "../../../modelos/enumeraciones/estadoPropiedad";
import { PropiedadService } from "../../../servicios/propiedades";
import styles from "./AdministradorPropiedades.module.css";
import { Home, MapPin, Edit3, Eye, Trash2, Plus, Search } from "react-feather";
import { ModalComponente } from "../../../componentes/Modal";
import InputCustom from "../../../componentes/ui/Input";

const AdministradorPropiedades: React.FC = () => {
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
  const [estado, setEstado] = useState<EstadoPropiedad>(
    EstadoPropiedad.DISPONIBLE
  );

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
        rolUsuario !== "ADMINISTRADOR" &&
        rolUsuario !== TipoUsuario.ADMINISTRADOR
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
      console.log("📥 Propiedades recibidas del backend:", data);
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

    return {
      totalPropiedades,
      disponibles,
      ocupadas,
      areaTotal,
    };
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
  };

  const cargarDatosEnFormulario = (propiedad: DTOPropiedadRespuesta) => {
    console.log("🔍 CARGAR DATOS - Propiedad completa:", propiedad);
    console.log("🔍 CARGAR DATOS - Buscar campo año:");
    // @ts-ignore
    console.log("  - anoConstruccion:", propiedad.anoConstruccion);
    // @ts-ignore
    console.log("  - anoConstruccion:", propiedad.anoConstruccion);
    // @ts-ignore
    console.log("  - ano_construccion:", propiedad.ano_construccion);

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

    // ✅ Buscar año en todos los posibles nombres
    // @ts-ignore
    const ano =
      propiedad.anoConstruccion ||
      propiedad.anoConstruccion ||
      propiedad.anoConstruccion ||
      "";
    console.log("🔍 CARGAR DATOS - Año encontrado:", ano);
    setAnoConstruccion(String(ano));

    setEstado(propiedad.estado || EstadoPropiedad.DISPONIBLE);
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
        alert("⚠️ Dirección y ciudad son obligatorios");
        return;
      }

      const areaNum = Number(area);
      const habitacionesNum = Number(habitaciones);
      const banosNum = Number(banos);

      if (areaNum <= 0) {
        alert("⚠️ El área debe ser mayor a 0");
        return;
      }

      const usuarioString = localStorage.getItem("usuario");
      if (!usuarioString) {
        alert("⚠️ No se pudo obtener la información del usuario");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const propietarioId = usuario.idUsuario || usuario.id;

      if (!propietarioId) {
        alert("⚠️ No se pudo obtener el ID del propietario");
        return;
      }

      console.log("🔍 Valor de anoConstruccion (estado):", anoConstruccion);
      console.log("🔍 Tipo:", typeof anoConstruccion);
      console.log("🔍 Número convertido:", Number(anoConstruccion));

      if (propiedadSeleccionada === null) {
        // ✅ CREAR
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
          propietario: propietarioId,
        };

        console.log("📤 CREAR - Objeto completo:");
        console.log(JSON.stringify(datos, null, 2));
        console.log("📤 CREAR - anoConstruccion:", datos.anoConstruccion);

        const resultado = await PropiedadService.crearPropiedad(datos);
        console.log("✅ CREAR - Respuesta completa:");
        console.log(JSON.stringify(resultado, null, 2));

        alert("✅ Propiedad creada correctamente");
      } else {
        // ✅ ACTUALIZAR
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
        };

        console.log("📤 ACTUALIZAR - ID:", propiedadSeleccionada.idPropiedad);
        console.log("📤 ACTUALIZAR - Objeto completo:");
        console.log(JSON.stringify(datosActualizar, null, 2));
        console.log(
          "📤 ACTUALIZAR - anoConstruccion:",
          datosActualizar.anoConstruccion
        );

        const resultado = await PropiedadService.actualizarPropiedad(
          propiedadSeleccionada.idPropiedad || 0,
          datosActualizar
        );
        console.log("✅ ACTUALIZAR - Respuesta completa:");
        console.log(JSON.stringify(resultado, null, 2));

        alert("✅ Propiedad actualizada correctamente");
      }

      await cargarPropiedades();
      setMostrarModal(false);
      limpiarFormulario();
    } catch (err: any) {
      console.error("❌ ERROR COMPLETO:", err);
      console.error("❌ Respuesta:", err.response?.data);

      const mensajeError =
        err.response?.data?.message || err.response?.data?.error || err.message;

      alert(`❌ Error: ${mensajeError}`);
    }
  };

  const handleEliminar = async (propiedadId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;

    try {
      await PropiedadService.eliminarPropiedad(propiedadId);
      alert("✅ Propiedad eliminada correctamente");
      await cargarPropiedades();
    } catch (err: any) {
      console.error("❌ Error al eliminar:", err);
      const mensajeError = err.response?.data?.message || err.message;
      alert(`❌ Error al eliminar: ${mensajeError}`);
    }
  };
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
              <h1>Propiedades</h1>
              <p className={styles.subtitulo}>
                Propiedades en arriendo y gestión administrativa
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
                            `/administrador/propiedades/${propiedad.idPropiedad}`
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
    </div>
  );
};

export default AdministradorPropiedades;
