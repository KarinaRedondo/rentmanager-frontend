import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { obtenerContratos } from "../../../servicios/contratos";
import { PropiedadService } from "../../../servicios/propiedades";
import type { DTOPropiedadRespuesta } from "../../../modelos/types/Propiedad";
import styles from "./DetallePropiedadContador.module.css";
import { ArrowLeft, Home } from "react-feather";

const DetallePropiedadContador: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [propiedad, setPropiedad] = useState<DTOPropiedadRespuesta | null>(
    null
  );
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<
    "informacion" | "contratos" | "facturas" | "pagos"
  >("informacion");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID de propiedad no válido");
        return;
      }

      const propiedadData = await PropiedadService.obtenerPropiedadPorId(
        parseInt(id)
      );
      setPropiedad(propiedadData);

      const todosContratos = await obtenerContratos();
      const contratosPropiedad = todosContratos.filter(
        (c) => c.propiedad?.idPropiedad === parseInt(id)
      );
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar la información de la propiedad");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
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
            <p>Cargando propiedad...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !propiedad) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <Home size={64} />
            <h3>{error || "Propiedad no encontrada"}</h3>
           
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
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/contador/facturas/1")}
            >
              <ArrowLeft size={20} />
              Volver 
            </button>
            <div className={styles.tituloSeccion}>
              <h1>{propiedad.direccion}</h1>
              <span className={styles.badge}>{propiedad.estado}</span>
            </div>
          </div>

          {/* Contenido reutilizado */}
          <div className={styles.contenidoTab}>
            {tabActiva === "informacion" && (
              <div className={styles.seccion}>
                <h2>
                  <Home size={24} />
                  Detalles de la Propiedad
                </h2>
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
                    <span className={styles.label}>Area</span>
                    <span className={styles.valor}>{propiedad.area}</span>     
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Habitaciones</span>
                    <span className={styles.valor}>{propiedad.habitaciones}</span>     
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Baños</span>
                    <span className={styles.valor}>{propiedad.banos}</span>     
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetallePropiedadContador;
