import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { obtenerPagoPorId } from "../../../servicios/pagos";
import type { DTOPagoRespuesta } from "../../../modelos/types/Pago";
import styles from "./DetallePagoContador.module.css";
import { ArrowLeft, CreditCard, FileText, Eye } from "react-feather";

const DetallesPagoContador: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [pago, setPago] = useState<DTOPagoRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<
    "informacion" | "factura" | "contrato"
  >("informacion");

  useEffect(() => {
    cargarPago();
  }, [id]);

  const cargarPago = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID de pago no válido");
        return;
      }

      const data = await obtenerPagoPorId(parseInt(id));
      setPago(data);
    } catch (err: any) {
      console.error("Error al cargar pago:", err);
      setError("Error al cargar el pago");
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

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando pago...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <CreditCard size={64} />
            <h3>{error || "Pago no encontrado"}</h3>
            <BotonComponente
              label="Volver a Pagos"
              onClick={() => navigate("/contador/pagos")}
            />
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
              onClick={() => navigate("/contador/facturas/1")}
            >
              <ArrowLeft size={20} />
              Volver 
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Pago #{pago.idPago}</h1>
              <span className={styles.badge}>{pago.estado}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            
          </div>

          {/* Tab Información */}
          {tabActiva === "informacion" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <CreditCard size={24} />
                  Detalles del Pago
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Monto</span>
                    <span className={styles.valorDestacado}>
                      {formatearMoneda(pago.monto)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Estado</span>
                    <span className={styles.estadoBadge}>{pago.estado}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Método de Pago</span>
                    <span className={styles.valor}>
                      {pago.metodoPago || "N/A"}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha</span>
                    <span className={styles.valor}>
                      {formatearFecha(
                        (pago as any).fechaCreacion || (pago as any).fecha
                      )}
                    </span>
                  </div>
                  {pago.referenciaTransaccion && (
                    <div className={styles.campo}>
                      <span className={styles.label}>Referencia</span>
                      <span className={styles.valor}>
                        {pago.referenciaTransaccion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetallesPagoContador;
