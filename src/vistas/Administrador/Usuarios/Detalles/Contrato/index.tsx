import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerContratoPorId } from "../../../../../servicios/contratos"; 
import type { DTOContratoRespuesta } from "../../../../../modelos/types/Contrato";
import styles from "./DetalleContratoAdministrador.module.css";
import { ArrowLeft, FileText } from "react-feather";
import Header from "../../../../../componentes/Header";
import Footer from "../../../../../componentes/Footer";

const DetalleContratoAdministrador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState<DTOContratoRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        if (!id) return;
        const data = await obtenerContratoPorId(parseInt(id));
        setContrato(data);
      } catch (err) {
        console.error("Error cargando contrato:", err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
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

  if (!contrato) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <FileText size={64} />
            <h3>Contrato no encontrado</h3>
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
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/administrador/propiedades/1")}
            >
              <ArrowLeft size={20} />
              Volver
            </button>

            <div className={styles.tituloSeccion}>
              <h1>Contrato #{contrato.idContrato}</h1>
              <span className={styles.badge}>{contrato.estado}</span>
            </div>
          </div>

          <div className={styles.contenidoTab}>
            <div className={styles.grid2}>
              <div className={styles.campo}>
                <span className={styles.label}>Número</span>
                <span className={styles.valor}>#{contrato.idContrato}</span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Estado</span>
                <span className={styles.estadoBadge}>{contrato.estado}</span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Fecha Emisión</span>
                <span className={styles.valor}>
                  {formatearFecha(contrato.fechaInicio)}
                </span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Fecha Vencimiento</span>
                <span className={styles.valor}>
                  {formatearFecha(contrato.fechaFin)}
                </span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Subtotal</span>
                <span className={styles.valor}>
                  {formatearMoneda(contrato.valorMensual)}
                </span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Total</span>
                <span className={styles.valorDestacado}>
                  {formatearMoneda(contrato.valorMensual)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetalleContratoAdministrador;

