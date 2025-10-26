import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../../componentes/Header";
import Footer from "../../../../../componentes/Footer";
import { BotonComponente } from "../../../../../componentes/ui/Boton";
import { obtenerFacturaPorId } from "../../../../../servicios/facturas";
import type { DTOFacturaRespuesta } from "../../../../../modelos/types/Factura";
import styles from "./DetalleFacturaAdministrador.module.css";
import { ArrowLeft, FileText } from "react-feather";

const DetalleFacturaAdministrador: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [factura, setFactura] = useState<DTOFacturaRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<
    "informacion" | "contrato"
  >("informacion");

  useEffect(() => {
    cargarFactura();
  }, [id]);

  const cargarFactura = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID de factura no válido");
        return;
      }

      const data = await obtenerFacturaPorId(parseInt(id));
      setFactura(data);
    } catch (err: any) {
      console.error("Error al cargar factura:", err);
      setError("Error al cargar la factura");
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
            <p>Cargando factura...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !factura) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <FileText size={64} />
            <h3>{error || "Factura no encontrada"}</h3>
            <BotonComponente
              label="Volver a Facturas"
              onClick={() => navigate("/administrador/propiedades/1")}
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
              onClick={() => navigate("/administrador/propiedades/1")}
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Factura #{factura.idFactura}</h1>
              <span className={styles.badge}>{factura.estado}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {/* Puedes agregar aquí botones o pestañas si lo necesitas */}
          </div>

          {/* Tab Información */}
          {tabActiva === "informacion" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Detalles de la Factura
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Total</span>
                    <span className={styles.valorDestacado}>
                      {formatearMoneda(factura.total)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Estado</span>
                    <span className={styles.estadoBadge}>{factura.estado}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Emisión</span>
                    <span className={styles.valor}>
                      {formatearFecha(factura.fechaEmision)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Vencimiento</span>
                    <span className={styles.valor}>
                      {formatearFecha(factura.fechaVencimiento)}
                    </span>
                  </div>
                  {factura.contrato && (
                    <div className={styles.campo}>
                      <span className={styles.label}>Contrato asociado</span>
                      <span className={styles.valor}>
                        #{factura.contrato.idContrato}
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

export default DetalleFacturaAdministrador;

