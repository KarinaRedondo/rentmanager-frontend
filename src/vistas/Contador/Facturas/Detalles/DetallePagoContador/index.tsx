import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../../componentes/Header";
import Footer from "../../../../../componentes/Footer";
import { BotonComponente } from "../../../../../componentes/ui/Boton";
import { obtenerPagoPorId } from "../../../../../servicios/pagos";
import type { DTOPagoRespuesta } from "../../../../../modelos/types/Pago";
import styles from "./DetallePagoContador.module.css";
import { ArrowLeft, CreditCard } from "react-feather";

// ========================================
// DETALLE DE PAGO - ROL CONTADOR
// ========================================
//
// Vista de solo lectura de pago para rol Contador.
// Muestra información básica del pago sin opciones de modificación.
//
// FUNCIONALIDADES:
// - Visualización de datos básicos de pago.
// - Navegación de retorno a lista de facturas.
// - Sistema de tabs (preparado pero no implementado).
//
// ESTADO:
// - pago: Objeto DTOPagoRespuesta con datos del pago.
// - cargando: Indica si está cargando datos.
// - error: Mensaje de error si falla la carga.
// - tabActiva: Tab seleccionado (informacion, factura, contrato).
//
// FLUJO:
// 1. Obtiene ID de pago desde URL params.
// 2. Carga pago con obtenerPagoPorId().
// 3. Muestra datos en grid de campos.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearMoneda(): Formatea números a moneda COP.
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a lista de facturas (hardcoded /contador/facturas/1).
// - Título con ID de pago.
// - Badge de estado.
//
// Tabs:
// - Contenedor vacío preparado para tabs (no renderiza botones).
// - Estado tabActiva preparado pero sin interfaz.
//
// Tab Información:
// - Grid 2 columnas con campos: Monto, Estado, Método de pago, Fecha, Referencia (si existe).
// - Manejo de campos opcionales con fallback.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje.
// - Error/No encontrado: Icono CreditCard, mensaje y botón volver.
//
// MANEJO DE FECHA:
// - Intenta leer primero fechaCreacion, luego fecha.
// - Compatibilidad con diferentes estructuras de DTO.
//
// LIMITACIONES:
// - Navegación hardcoded en lugar de navigate(-1).
// - Tabs declarados pero no implementados visualmente.
// - No muestra datos de factura o contrato asociados.
// - Falta información bancaria completa si existe.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Badges coloreados para estado.
// - Campo condicional para referencia de transacción.

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
          <div className={styles.tabs}></div>

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
