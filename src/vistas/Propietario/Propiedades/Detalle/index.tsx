import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { ModalComponente } from "../../../../componentes/Modal";
import styles from "./PropiedadDetalle.module.css";
import { urlApi } from "../../../../app/api";
import { TarjetaBase } from "../../../../componentes/ui/TarjetaBase";

interface Propiedad {
  idPropiedad: number;
  direccion: string;
  ciudad: string;
  estado: string;
  tipo: string;
  area: number;
  habitaciones: number;
  banos: number;
  parqueaderos: number;
  piso: number;
  amoblado: boolean;
  descripcion?: string;
  anoConstruccion: number;
  serviciosPublicos?: string[];
  imagenUrl?: string;
}

const PropiedadDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerPropiedad = async () => {
      try {
        const respuesta = await urlApi.get(`/api/v1/propiedades/obtener/${id}`);
        setPropiedad(respuesta.data);
      } catch (error) {
        console.error("Error al obtener la propiedad:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerPropiedad();
  }, [id]);

  if (cargando) {
    return (
      <>
        <Header />
        <div className={styles.mensaje}>
          Cargando información de la propiedad...
        </div>
        <Footer />
      </>
    );
  }

  if (!propiedad) {
    return (
      <>
        <Header />
        <div className={styles.mensaje}>
          No se encontró la propiedad solicitada.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.contenedor}>
        <TarjetaBase titulo={propiedad.direccion}>
          {/* Imagen principal */}
          <div className={styles.imagenContainer}>
            <img
              src={
                propiedad.imagenUrl ||
                "https://images.unsplash.com/photo-1600585152220-90363fe7e115"
              }
              alt="Imagen de la propiedad"
              className={styles.imagen}
            />
          </div>

          {/* Información general */}
          <div className={styles.infoGrid}>
            <p>
              <strong>Ciudad:</strong> {propiedad.ciudad}
            </p>
            <p>
              <strong>Tipo de propiedad:</strong> {propiedad.tipo}
            </p>
            <p>
              <strong>Área:</strong> {propiedad.area} m²
            </p>
            <p>
              <strong>Habitaciones:</strong> {propiedad.habitaciones}
            </p>
            <p>
              <strong>Baños:</strong> {propiedad.banos}
            </p>
            <p>
              <strong>Parqueaderos:</strong> {propiedad.parqueaderos}
            </p>
            <p>
              <strong>Piso:</strong> {propiedad.piso}
            </p>
            <p>
              <strong>Año de construcción:</strong> {propiedad.anoConstruccion}
            </p>
            <p>
              <strong>Estado:</strong> {propiedad.estado}
            </p>
            <p>
              <strong>Amoblado:</strong> {propiedad.amoblado ? "Sí" : "No"}
            </p>
          </div>

          {/* Servicios públicos */}
          {propiedad.serviciosPublicos &&
            propiedad.serviciosPublicos.length > 0 && (
              <div className={styles.servicios}>
                <strong>Servicios públicos:</strong>
                <ul>
                  {propiedad.serviciosPublicos.map((servicio, index) => (
                    <li key={index}>{servicio}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Descripción */}
          {propiedad.descripcion && (
            <p className={styles.descripcion}>
              <strong>Descripción:</strong> {propiedad.descripcion}
            </p>
          )}

          <div className={styles.btnContenedor}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/propietario/propiedades")}
            >
              ← Volver
            </button>
          </div>
        </TarjetaBase>
      </main>
      <Footer />
    </>
  );
};

export default PropiedadDetalle;
