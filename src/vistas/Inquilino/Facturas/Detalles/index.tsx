import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { BotonComponente } from "../../../../componentes/ui/Boton";
import { obtenerFacturaPorId } from "../../../../servicios/facturas";
import { obtenerPagos } from "../../../../servicios/pagos";
import type { DTOFacturaRespuesta } from "../../../../modelos/types/Factura";
import type { DTOPagoRespuesta } from "../../../../modelos/types/Pago";
import styles from "./DetalleFactura.module.css";
import {
  ArrowLeft,
  FileText,
  CreditCard,
  Eye,
} from "react-feather";

const DetalleFacturaInquilino: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [factura, setFactura] = useState<DTOFacturaRespuesta | null>(null);
  const [pago, setPago] = useState<DTOPagoRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<"informacion" | "contrato" | "pago">("informacion");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");
      if (!id) return;

      const facturaData = await obtenerFacturaPorId(parseInt(id));
      setFactura(facturaData);

      const todosPagos = await obtenerPagos();
      const pagoAsociado = todosPagos.find((p) => p.factura?.idFactura === parseInt(id));
      setPago(pagoAsociado || null);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la factura");
    } finally {
      setCargando(false);
    }
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
              onClick={() => navigate("/inquilino/facturas")}
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
            <button className={styles.btnVolver} onClick={() => navigate("/inquilino/facturas")}>
              <ArrowLeft size={20} />
              Volver a Facturas
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Factura #{factura.idFactura}</h1>
              <span className={styles.badge}>{factura.estado}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={tabActiva === "informacion" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("informacion")}
            >
              <FileText size={20} />
              Información
            </button>
            <button
              className={tabActiva === "contrato" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("contrato")}
            >
              <FileText size={20} />
              Contrato
            </button>
            <button
              className={tabActiva === "pago" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("pago")}
            >
              <CreditCard size={20} />
              Pago {pago ? "" : "(Sin pago)"}
            </button>
          </div>

          {/* Tab Información */}
          {tabActiva === "informacion" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2><FileText size={24} />Detalles de la Factura</h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Número</span>
                    <span className={styles.valor}>#{factura.idFactura}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Estado</span>
                    <span className={styles.estadoBadge}>{factura.estado}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha Emisión</span>
                    <span className={styles.valor}>{formatearFecha(factura.fechaEmision)}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha Vencimiento</span>
                    <span className={styles.valor}>{formatearFecha(factura.fechaVencimiento)}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Total</span>
                    <span className={styles.valorDestacado}>{formatearMoneda(factura.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Contrato */}
          {tabActiva === "contrato" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2><FileText size={24} />Contrato Asociado</h2>
                {factura.contrato ? (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.campo}>
                        <span className={styles.label}>ID Contrato</span>
                        <span className={styles.valor}>#{factura.contrato.idContrato}</span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Estado</span>
                        <span className={styles.estadoBadge}>{factura.contrato.estado}</span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha Inicio</span>
                        <span className={styles.valor}>{formatearFecha(factura.contrato.fechaInicio)}</span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha Fin</span>
                        <span className={styles.valor}>{formatearFecha(factura.contrato.fechaFin)}</span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Valor Mensual</span>
                        <span className={styles.valorDestacado}>{formatearMoneda(factura.contrato.valorMensual)}</span>
                      </div>
                    </div>

                    <div className={styles.accionesSeccion}>
                      <button
                        className={styles.btnVer}
                        onClick={() => navigate(`/inquilino/contratos/${factura.contrato?.idContrato}`)}
                      >
                        <Eye size={16} />
                        Ver Detalles Completos del Contrato
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.sinDatos}>
                    <FileText size={48} />
                    <p>No hay contrato asociado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Pago */}
          {tabActiva === "pago" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2><CreditCard size={24} />Pago Asociado</h2>
                {pago ? (
                  <div className={styles.grid2}>
                    <div className={styles.campo}>
                      <span className={styles.label}>ID Pago</span>
                      <span className={styles.valor}>#{pago.idPago}</span>
                    </div>
                    <div className={styles.campo}>
                      <span className={styles.label}>Estado</span>
                      <span className={styles.estadoBadge}>{pago.estado}</span>
                    </div>
                    <div className={styles.campo}>
                      <span className={styles.label}>Monto</span>
                      <span className={styles.valorDestacado}>{formatearMoneda(pago.monto)}</span>
                    </div>
                    <div className={styles.campo}>
                      <span className={styles.label}>Método</span>
                      <span className={styles.valor}>{pago.metodoPago || "N/A"}</span>
                    </div>
                    {pago.referenciaTransaccion && (
                      <div className={styles.campo}>
                        <span className={styles.label}>Referencia</span>
                        <span className={styles.valor}>{pago.referenciaTransaccion}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.sinDatos}>
                    <CreditCard size={48} />
                    <p>No hay pago registrado</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetalleFacturaInquilino;
