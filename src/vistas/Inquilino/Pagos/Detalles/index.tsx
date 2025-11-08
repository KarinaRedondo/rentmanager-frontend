import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { BotonComponente } from "../../../../componentes/ui/Boton";
import { obtenerPagoPorId } from "../../../../servicios/pagos";
import type { DTOPagoRespuesta } from "../../../../modelos/types/Pago";
import styles from "./DetallePago.module.css";
import { ArrowLeft, CreditCard, FileText, Eye } from "react-feather";

// ========================================
// DETALLE DE PAGO - ROL INQUILINO
// ========================================
//
// Vista de solo lectura de pago para rol Inquilino con tabs de información relacionada.
// Permite visualizar pago, factura asociada y contrato relacionado.
//
// FUNCIONALIDADES:
// - Visualización completa de datos del pago.
// - Sistema de tabs para organizar información (Información, Factura, Contrato).
// - Navegación a detalle de factura y contrato.
// - Sin opciones de edición (solo lectura).
//
// ESTADO:
// - pago: Objeto DTOPagoRespuesta con datos completos.
// - cargando: Indica si está cargando datos.
// - error: Mensaje de error si falla la carga.
// - tabActiva: Tab seleccionado (informacion, factura, contrato).
//
// FLUJO DE CARGA:
// 1. Obtiene ID de pago desde URL params.
// 2. Valida que ID no sea undefined.
// 3. Carga pago con obtenerPagoPorId().
// 4. Muestra datos según tab seleccionado.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearMoneda(): Formatea números a moneda COP.
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a lista de pagos.
// - Título con ID de pago.
// - Badge de estado.
//
// Tab Información:
// - Grid con datos del pago:
//   * Monto (destacado)
//   * Estado (badge)
//   * Método de pago
//   * Fecha (intenta fechaCreacion o fecha con type casting)
//   * Referencia de transacción (condicional, solo si existe)
//
// Tab Factura:
// - Grid con datos de factura asociada:
//   * ID Factura
//   * Estado (badge)
//   * Total (destacado)
//   * Fecha de emisión
// - Botón "Ver Detalles Completos de la Factura" con:
//   * Validación robusta de ID
//   * Navegación a /inquilino/facturas/{id}
//   * Logging de advertencia si ID inválido
// - Estado vacío si no hay factura.
//
// Tab Contrato:
// - Grid con datos de contrato (extraído de factura.contrato):
//   * ID Contrato
//   * Estado (badge)
//   * Valor mensual (destacado)
//   * Fecha inicio
//   * Fecha fin
// - Botón "Ver Detalles Completos del Contrato" con:
//   * Validación robusta de ID
//   * Navegación a /inquilino/contratos/{id}
//   * Logging de advertencia si ID inválido
// - Estado vacío si no hay contrato.
//
// NAVEGACIÓN:
// - A lista de pagos: /inquilino/pagos
// - A detalle de factura: /inquilino/facturas/{id}
// - A detalle de contrato: /inquilino/contratos/{id}
//
// VALIDACIÓN DE IDS:
// - Verifica que ID exista (no undefined/null).
// - Convierte a Number y valida que no sea NaN.
// - Logging en consola si validación falla.
// - Previene navegación con IDs inválidos.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando pago...".
// - Error/No encontrado: Icono CreditCard, mensaje y botón volver.
// - Sin datos: Iconos FileText grandes con mensajes informativos en tabs vacíos.
// - Tabs con indicador visual de activo.
//
// MANEJO DE CAMPOS:
// - referenciaTransaccion: Campo condicional, solo se renderiza si existe.
// - fecha: Intenta primero (pago as any).fechaCreacion, luego (pago as any).fecha.
// - Acceso anidado seguro: pago.factura?.contrato con optional chaining.
//
// CARACTERÍSTICAS:
// - Vista de solo lectura para inquilino.
// - Acceso a información financiera propia.
// - Navegación entre entidades relacionadas (pago → factura → contrato).
// - Diseño limpio sin opciones de modificación.
// - Validaciones robustas antes de navegar.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Tabs con estado activo coloreado.
// - Badges para estados.
// - Botones de navegación con iconos Eye.
// - Valores destacados para montos.

const DetallePagoInquilino: React.FC = () => {
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
              onClick={() => navigate("/inquilino/pagos")}
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
              onClick={() => navigate("/inquilino/pagos")}
            >
              <ArrowLeft size={20} />
              Volver a Pagos
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Pago #{pago.idPago}</h1>
              <span className={styles.badge}>{pago.estado}</span>
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
              <CreditCard size={20} />
              Información
            </button>
            <button
              className={
                tabActiva === "factura" ? styles.tabActiva : styles.tab
              }
              onClick={() => setTabActiva("factura")}
            >
              <FileText size={20} />
              Factura
            </button>
            <button
              className={
                tabActiva === "contrato" ? styles.tabActiva : styles.tab
              }
              onClick={() => setTabActiva("contrato")}
            >
              <FileText size={20} />
              Contrato
            </button>
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

          {/* Tab Factura */}
          {tabActiva === "factura" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Factura Asociada
                </h2>
                {pago.factura ? (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.campo}>
                        <span className={styles.label}>ID Factura</span>
                        <span className={styles.valor}>
                          #{pago.factura.idFactura}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Estado</span>
                        <span className={styles.estadoBadge}>
                          {pago.factura.estado}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Total</span>
                        <span className={styles.valorDestacado}>
                          {formatearMoneda(pago.factura.total)}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha Emisión</span>
                        <span className={styles.valor}>
                          {formatearFecha(pago.factura.fechaEmision)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.accionesSeccion}>
                      <button
                        className={styles.btnVer}
                        onClick={() => {
                          const idFactura = pago?.factura?.idFactura;
                          if (idFactura && !isNaN(Number(idFactura))) {
                            navigate(`/inquilino/facturas/${idFactura}`);
                          } else {
                            console.warn("ID de factura inválido:", pago);
                          }
                        }}
                      >
                        <Eye size={16} />
                        Ver Detalles Completos de la Factura
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.sinDatos}>
                    <FileText size={48} />
                    <p>No hay factura asociada</p>
                  </div>
                )}
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
                {pago.factura?.contrato ? (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.campo}>
                        <span className={styles.label}>ID Contrato</span>
                        <span className={styles.valor}>
                          #{pago.factura.contrato.idContrato}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Estado</span>
                        <span className={styles.estadoBadge}>
                          {pago.factura.contrato.estado}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Valor Mensual</span>
                        <span className={styles.valorDestacado}>
                          {formatearMoneda(pago.factura.contrato.valorMensual)}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha Inicio</span>
                        <span className={styles.valor}>
                          {formatearFecha(pago.factura.contrato.fechaInicio)}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Fecha Fin</span>
                        <span className={styles.valor}>
                          {formatearFecha(pago.factura.contrato.fechaFin)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.accionesSeccion}>
                      <button
                        className={styles.btnVer}
                        onClick={() => {
                          const idContrato =
                            pago?.factura?.contrato?.idContrato;
                          if (idContrato && !isNaN(Number(idContrato))) {
                            navigate(`/inquilino/contratos/${idContrato}`);
                          } else {
                            console.warn("ID de contrato inválido:", pago);
                          }
                        }}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetallePagoInquilino;
