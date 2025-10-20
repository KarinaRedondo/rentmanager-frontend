import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { PropiedadService } from "../../../servicios/propiedades"; 
import type { DTOPropiedadRespuesta } from "../../../modelos/types/Propiedad";
import styles from "./DetallePropiedad.module.css";
import { ArrowLeft, Home} from "react-feather";

const DetallePropiedadInquilino: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [propiedad, setPropiedad] = useState<DTOPropiedadRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    cargarPropiedad();
  }, [id]);

  const cargarPropiedad = async () => {
    try {
      if (!id) return;
      const data = await PropiedadService.obtenerPropiedadPorId(parseInt(id));
      setPropiedad(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (valor: number | undefined): string => {
    if (!valor) return "$0";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <Home size={64} />
            <h3>Propiedad no encontrada</h3>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <Header />
      <main className={styles.main}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <button className={styles.btnVolver} onClick={() => navigate("/inquilino/dashboard")}>
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className={styles.tituloSeccion}>
              <h1>{propiedad.direccion}</h1>
              <span className={styles.badge}>{propiedad.estado}</span>
            </div>
          </div>

          <div className={styles.contenidoTab}>
            <div className={styles.seccion}>
              <h2><Home size={24} />Información de la Propiedad</h2>
              <div className={styles.grid2}>
                <div className={styles.campo}>
                  <span className={styles.label}>Dirección</span>
                  <span className={styles.valor}>{propiedad.direccion}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Ciudad</span>
                  <span className={styles.valor}>{propiedad.ciudad}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Tipo</span>
                  <span className={styles.valor}>{propiedad.tipo}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Área</span>
                  <span className={styles.valor}>{propiedad.area} m²</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Habitaciones</span>
                  <span className={styles.valor}>{propiedad.habitaciones}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Baños</span>
                  <span className={styles.valor}>{propiedad.banos}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Valor Arriendo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetallePropiedadInquilino;
