import { useEffect, useState } from "react";
import styles from "./Propiedades.module.css";
import { PropiedadService } from "../../../servicios/propiedades";
import { EstadoPropiedad } from "../../../modelos/enumeraciones/estadoPropiedad";
import { TipoPropiedad } from "../../../modelos/enumeraciones/tipoPropiedad";
import { ServiciosPublicos } from "../../../modelos/enumeraciones/serviciosPublicos";
import Header from "../../../componentes/Header";
import { TarjetaBase } from "../../../componentes/ui/TarjetaBase";
import { BotonComponente } from "../../../componentes/ui/Boton";
import Footer from "../../../componentes/Footer";
import { ModalComponente } from "../../../componentes/Modal/index,";  
import InputCustom from "../../../componentes/ui/Input"; 

const Propiedades = () => {
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [propiedadEditando, setPropiedadEditando] = useState<any | null>(null);

  // Campos de propiedad
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState<EstadoPropiedad>(EstadoPropiedad.DISPONIBLE);
  const [tipo, setTipo] = useState<TipoPropiedad>(TipoPropiedad.APARTAMENTO);
  const [area, setArea] = useState("");
  const [habitaciones, setHabitaciones] = useState("");
  const [banos, setBanos] = useState("");
  const [parqueaderos, setParqueaderos] = useState("");
  const [amoblado, setAmoblado] = useState(false);
  const [piso, setPiso] = useState("");
  const [anoConstruccion, setAnoConstruccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [servicios, setServicios] = useState<ServiciosPublicos[]>([]);

  // ────────────────────────────────
  // 🔹 Cargar propiedades al iniciar
  useEffect(() => {
    cargarPropiedades();
  }, []);

  const cargarPropiedades = async () => {
    try {
      const data = await PropiedadService.obtenerPropiedades();
      setPropiedades(data);
    } catch (error) {
      console.error("Error al cargar propiedades:", error);
    }
  };

  // ────────────────────────────────
  // 🔹 Abrir modal para editar
  const abrirModalEditar = (propiedad: any) => {
    setPropiedadEditando(propiedad);
    setDireccion(propiedad.direccion);
    setCiudad(propiedad.ciudad);
    setEstado(propiedad.estado);
    setTipo(propiedad.tipo);
    setArea(propiedad.area?.toString() || "");
    setHabitaciones(propiedad.habitaciones?.toString() || "");
    setBanos(propiedad.banos?.toString() || "");
    setParqueaderos(propiedad.parqueaderos?.toString() || "");
    setAmoblado(propiedad.amoblado);
    setPiso(propiedad.piso?.toString() || "");
    setAnoConstruccion(propiedad.anoConstruccion?.toString() || "");
    setDescripcion(propiedad.descripcion || "");
    setServicios(propiedad.serviciosPublicos || []);
    setOpenModal(true);
  };

  // ────────────────────────────────
  // 🔹 Guardar cambios de propiedad
  const guardarPropiedad = async () => {
    if (!propiedadEditando) return;

    try {
      const datos = {
        direccion,
        ciudad,
        estado,
        tipo,
        area: Number(area) || 0,
        habitaciones: Number(habitaciones) || 0,
        banos: Number(banos) || 0,
        parqueaderos: Number(parqueaderos) || 0,
        amoblado,
        piso: Number(piso) || 0,
        anoConstruccion: Number(anoConstruccion) || new Date().getFullYear(),
        descripcion,
        serviciosPublicos: servicios,
      };

      await PropiedadService.actualizarPropiedad(propiedadEditando.idPropiedad, datos);
      setOpenModal(false);
      await cargarPropiedades();
    } catch (error) {
      console.error("Error al guardar propiedad:", error);
    }
  };

  // ────────────────────────────────
  return (
    <div className={styles.container}>
      <Header />

      <h1 className={styles.titulo}>Gestión de Propiedades</h1>

      <div className={styles.listaPropiedades}>
        {propiedades.map((p) => (
          <TarjetaBase
            key={p.idPropiedad}
            titulo={p.direccion}
            subtitulo={p.ciudad}
            descripcion={`${p.tipo} - ${p.area} m²`} // ✅ TEMPLATE STRING CORREGIDO
            icono="propiedad"
            estado={p.estado}
            acciones={<BotonComponente label="Editar" onClick={() => abrirModalEditar(p)} />}
          >
            <ul>
              <li><strong>Habitaciones:</strong> {p.habitaciones}</li>
              <li><strong>Baños:</strong> {p.banos}</li>
              <li><strong>Parqueaderos:</strong> {p.parqueaderos}</li>
              <li><strong>Amoblado:</strong> {p.amoblado ? "Sí" : "No"}</li>
              <li><strong>Piso:</strong> {p.piso}</li>
              <li><strong>Año Construcción:</strong> {p.anoConstruccion}</li>
            </ul>
          </TarjetaBase>
        ))}
      </div>

      {/* ──────────────── MODAL EDITAR ──────────────── */}
      <ModalComponente
        openModal={openModal}
        setOpenModal={setOpenModal}
        nombreModal="Editar Propiedad"
        guardar={guardarPropiedad}
      >
        <div className={styles.formulario}>
          <InputCustom value={direccion} setValue={setDireccion} title="Dirección" />
          <InputCustom value={ciudad} setValue={setCiudad} title="Ciudad" />

          {/* Estado */}
          <div className={styles.campo}>
            <label>Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoPropiedad)}
              className={styles.select}
            >
              {Object.values(EstadoPropiedad).map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className={styles.campo}>
            <label>Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoPropiedad)}
              className={styles.select}
            >
              {Object.values(TipoPropiedad).map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>

          {/* Campos numéricos */}
          <InputCustom value={area} setValue={setArea} title="Área (m²)" type="number" />
          <InputCustom value={habitaciones} setValue={setHabitaciones} title="Habitaciones" type="number" />
          <InputCustom value={banos} setValue={setBanos} title="Baños" type="number" />
          <InputCustom value={parqueaderos} setValue={setParqueaderos} title="Parqueaderos" type="number" />

          {/* Amoblado */}
          <div className={styles.campoCheckbox}>
            <label>
              <input
                type="checkbox"
                checked={amoblado}
                onChange={(e) => setAmoblado(e.target.checked)}
              />
              Amoblado
            </label>
          </div>

          {/* Piso y año */}
          <InputCustom value={piso} setValue={setPiso} title="Piso" type="number" />
          <InputCustom value={anoConstruccion} setValue={setAnoConstruccion} title="Año de Construcción" type="number" />

          {/* Descripción */}
          <InputCustom value={descripcion} setValue={setDescripcion} title="Descripción" />

          {/* Servicios públicos */}
          <div className={styles.campo}>
            <label>Servicios Públicos</label>
            <select
              multiple
              value={servicios}
              onChange={(e) =>
                setServicios(
                  Array.from(e.target.selectedOptions, (opt) => opt.value as ServiciosPublicos)
                )
              }
              className={styles.selectMultiple}
            >
              {Object.values(ServiciosPublicos).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </ModalComponente>

      <Footer />
    </div>
  );
};

export default Propiedades;
