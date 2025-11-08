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
  CheckCircle,
  Clock,
  XCircle,
} from "react-feather";

// ========================================
// DETALLE DE FACTURA - ROL PROPIETARIO
// ========================================
//
// Vista completa de factura para rol Propietario con tabs de información relacionada.
// Permite visualizar factura, contrato asociado y pago (si existe).
//
// FUNCIONALIDADES:
// - Visualización completa de datos de la factura.
// - Sistema de tabs: Información de Factura, Contrato Asociado, Pago.
// - Carga automática de pago asociado a la factura.
// - Navegación a detalle de contrato.
// - Vista de solo lectura (sin opciones de edición en esta vista).
//
// ESTADO:
// - factura: Objeto DTOFacturaRespuesta con datos completos.
// - pago: Objeto DTOPagoRespuesta con pago asociado (si existe).
// - cargando: Indica si está cargando datos.
// - error: Mensaje de error si falla la carga.
// - tabActiva: Tab seleccionado (informacion, contrato, pago).
//
// FLUJO DE CARGA:
// 1. Obtiene ID de factura desde URL params.
// 2. Valida que ID exista.
// 3. Carga factura con obtenerFacturaPorId().
// 4. Carga todos los pagos y filtra por idFactura coincidente.
// 5. Muestra datos según tab seleccionado.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearMoneda(): Formatea números a moneda COP.
// - obtenerIconoEstado(): Retorna icono coloreado según estado de factura.
//
// FUNCIÓN obtenerIconoEstado():
// - PAGADA: CheckCircle verde
// - PENDIENTE: Clock amarillo
// - VENCIDA: XCircle rojo
// - Default: Clock azul
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a lista de facturas.
// - Título con ID de factura.
// - Badge de estado con icono coloreado.
//
// Tab Información de Factura:
// - Grid 2 columnas con datos:
//   * Número de factura
//   * Estado (badge)
//   * Fecha de emisión
//   * Fecha de vencimiento
//   * Subtotal (igual que total)
//   * Total (destacado)
//
// Tab Contrato Asociado:
// - Grid 2 columnas con datos de contrato:
//   * ID Contrato
//   * Estado (badge)
//   * Fecha inicio/fin
//   * Valor mensual (destacado)
//   * Tipo de contrato
// - Botón "Ver Detalles Completos del Contrato" con navegación.
// - Estado vacío si no hay contrato.
//
// Tab Pago:
// - Grid 2 columnas con datos de pago:
//   * ID Pago
//   * Estado (badge)
//   * Monto (destacado)
//   * Método de pago
//   * Fecha de pago
//   * Referencia de transacción (condicional, solo si existe)
// - Estado vacío si no hay pago.
// - Indicador en tab "(Sin pago)" si no existe.
//
// NAVEGACIÓN:
// - Volver: /propietario/facturas
// - Ver contrato: /propietario/contratos/{id}
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando factura...".
// - Error/No encontrada: Icono FileText, mensaje y botón volver.
// - Sin datos: Iconos grandes con mensajes informativos en tabs vacíos.
// - Tabs con indicador visual de activo.
// - Badge con icono integrado en header.
//
// CARACTERÍSTICAS:
// - Vista de solo lectura para propietario.
// - Acceso a información financiera de sus propiedades.
// - Navegación a entidad relacionada (contrato).
// - Diseño limpio y profesional.
// - Íconos visuales para estados.
//
// LIMITACIONES:
// - No hay verificación de acceso (falta validación de rol PROPIETARIO).
// - Subtotal y total muestran el mismo valor (no hay cálculo de subtotal).
// - No muestra detalles del inquilino.
// - No muestra propiedad asociada.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Tabs con estado activo coloreado.
// - Badges para estados.
// - Botones de navegación.
// - Valores destacados para montos.

const DetalleFactura: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [factura, setFactura] = useState<DTOFacturaRespuesta | null>(null);
  const [pago, setPago] = useState<DTOPagoRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<
    "informacion" | "contrato" | "pago"
  >("informacion");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID de factura no válido");
        return;
      }

      // Cargar factura
      const facturaData = await obtenerFacturaPorId(parseInt(id));
      setFactura(facturaData);

      // Cargar pago asociado a esta factura
      const todosPagos = await obtenerPagos();
      const pagoAsociado = todosPagos.find(
        (p) => p.factura?.idFactura === parseInt(id)
      );
      setPago(pagoAsociado || null);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar la información de la factura");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "";
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
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

  const obtenerIconoEstado = (estado: string | undefined) => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "PAGADA":
        return <CheckCircle size={20} className={styles.iconoVerde} />;
      case "PENDIENTE":
        return <Clock size={20} className={styles.iconoAmarillo} />;
      case "VENCIDA":
        return <XCircle size={20} className={styles.iconoRojo} />;
      default:
        return <Clock size={20} className={styles.iconoAzul} />;
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
              onClick={() => navigate("/propietario/facturas")}
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
          {/* Header */}
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/propietario/facturas")}
            >
              <ArrowLeft size={20} />
              Volver a Facturas
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Factura #{factura.idFactura}</h1>
              <span className={styles.badge}>
                {obtenerIconoEstado(factura.estado)}
                {factura.estado}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={
                tabActiva === "informacion" ? styles.tabActiva : styles.tab
              }
              onClick={() => setTabActiva("informacion")}
            >
              <FileText size={20} />
              Información de Factura
            </button>
            <button
              className={
                tabActiva === "contrato" ? styles.tabActiva : styles.tab
              }
              onClick={() => setTabActiva("contrato")}
            >
              <FileText size={20} />
              Contrato Asociado
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
                <h2>
                  <FileText size={24} />
                  Detalles de la Factura
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Número de Factura</span>
                    <span className={styles.valor}>#{factura.idFactura}</span>
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
                  <div className={styles.campo}>
                    <span className={styles.label}>Subtotal</span>
                    <span className={styles.valor}>
                      {formatearMoneda(factura.total)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Total</span>
                    <span className={styles.valorDestacado}>
                      {formatearMoneda(factura.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Contrato */}
          {tabActiva === "contrato" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Contrato Asociado
                </h2>
                {factura.contrato ? (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.campo}>
                        <span className={styles.label}>ID Contrato</span>
                        <span className={styles.valor}>
                          #{factura.contrato.idContrato}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Estado</span>
                        <span className={styles.estadoBadge}>
                          {factura.contrato.estado}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha de Inicio</span>
                        <span className={styles.valor}>
                          {formatearFecha(factura.contrato.fechaInicio)}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha de Fin</span>
                        <span className={styles.valor}>
                          {formatearFecha(factura.contrato.fechaFin)}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Valor Mensual</span>
                        <span className={styles.valorDestacado}>
                          {formatearMoneda(factura.contrato.valorMensual)}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Tipo de Contrato</span>
                        <span className={styles.valor}>
                          {factura.contrato.tipoContrato}
                        </span>
                      </div>
                    </div>

                    <div className={styles.accionesSeccion}>
                      <BotonComponente
                        label="Ver Detalles Completos del Contrato"
                        onClick={() =>
                          navigate(
                            `/propietario/contratos/${factura.contrato?.idContrato}`
                          )
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className={styles.sinDatos}>
                    <FileText size={48} />
                    <p>No hay contrato asociado a esta factura</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Pago */}
          {tabActiva === "pago" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <CreditCard size={24} />
                  Pago Asociado
                </h2>
                {pago ? (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.campo}>
                        <span className={styles.label}>ID Pago</span>
                        <span className={styles.valor}>#{pago.idPago}</span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Estado</span>
                        <span className={styles.estadoBadge}>
                          {pago.estado}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Monto</span>
                        <span className={styles.valorDestacado}>
                          {formatearMoneda(pago.monto)}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Método de Pago</span>
                        <span className={styles.valor}>
                          {pago.metodoPago || "N/A"}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha de Pago</span>
                        <span className={styles.valor}>
                          <span className={styles.valor}>
                            {formatearFecha(pago.fecha)}
                          </span>
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
                  </>
                ) : (
                  <div className={styles.sinDatos}>
                    <CreditCard size={48} />
                    <p>No hay pago registrado para esta factura</p>
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

export default DetalleFactura;
