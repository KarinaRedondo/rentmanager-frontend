import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { BotonComponente } from "../../../../componentes/ui/Boton";
import { obtenerContratoPorId } from "../../../../servicios/contratos";
import { obtenerFacturas } from "../../../../servicios/facturas";
import { obtenerPagos } from "../../../../servicios/pagos";
import type { DTOContratoRespuesta } from "../../../../modelos/types/Contrato";
import type { DTOFacturaRespuesta } from "../../../../modelos/types/Factura";
import type { DTOPagoRespuesta } from "../../../../modelos/types/Pago";
import styles from "./DetalleContrato.module.css";
import {
  ArrowLeft,
  FileText,
  Home,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
} from "react-feather";

// ========================================
// DETALLE DE CONTRATO - ROL PROPIETARIO
// ========================================
//
// Vista completa de contrato para rol Propietario con tabs de información, facturas y pagos.
// Permite visualizar toda la información del contrato, incluyendo inquilino, propiedad, facturas y pagos.
//
// FUNCIONALIDADES:
// - Visualización completa de datos del contrato.
// - Sistema de tabs: Información General, Facturas, Pagos.
// - Carga automática de facturas y pagos del contrato.
// - Resumen de pagos con estadísticas.
// - Navegación a detalle de facturas.
// - Botón de edición de contrato.
//
// ESTADO:
// - contrato: Objeto DTOContratoRespuesta con datos completos.
// - facturas: Lista de facturas del contrato.
// - pagos: Lista de pagos de facturas del contrato.
// - cargando: Indica si está cargando datos.
// - error: Mensaje de error si falla la carga.
// - tabActiva: Tab seleccionado (informacion, facturas, pagos).
//
// FLUJO DE CARGA:
// 1. Obtiene ID de contrato desde URL params.
// 2. Valida que ID exista.
// 3. Carga contrato con obtenerContratoPorId().
// 4. Carga todas las facturas y filtra por contrato.idContrato.
// 5. Carga todos los pagos y filtra por IDs de facturas del contrato.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearMoneda(): Formatea números a moneda COP.
// - calcularResumenPagos(): Calcula estadísticas de pagos del contrato.
//
// CÁLCULO DE RESUMEN DE PAGOS:
// - **Completados**: Cantidad de pagos con estado VERIFICADO.
// - **Pendientes**: Cantidad de pagos con estado PENDIENTE.
// - **Total recibido**: Suma de montos de pagos VERIFICADO.
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a lista de contratos.
// - Título con ID de contrato.
// - Badge de estado.
// - Botón "Editar" (navega a edición).
//
// Tab Información General:
// - **Información del Contrato**:
//   * Tipo de contrato
//   * Forma de pago
//   * Fecha inicio/fin
//   * Valor mensual (destacado)
//   * Estado (badge)
//   * Observaciones (condicional, solo si existe)
//
// - **Propiedad**:
//   * Dirección (intenta direccionPropiedad plano o propiedad.direccion)
//   * Ciudad (intenta ciudadPropiedad plano o propiedad.ciudad)
//   * Tipo, área, habitaciones, baños
//
// - **Inquilino**:
//   * Nombre completo (campos planos nombreInquilino + apellidoInquilino)
//   * Correo (correoInquilino)
//   * Teléfono (telefonoInquilino)
//   * Documento (numeroDocumentoInquilino)
//   * Maneja casos de datos no disponibles con "N/A"
//
// Tab Facturas:
// - Header con título y contador.
// - Lista de facturas:
//   * Icono FileText
//   * ID y badge de estado
//   * Fecha emisión con icono Calendar
//   * Total con icono DollarSign
//   * Botón ver detalles (Eye icon)
// - Estado vacío si no hay facturas.
//
// Tab Pagos:
// - **Resumen de Pagos** (3 cards):
//   1. Pagos completados (icono CheckCircle verde)
//   2. Pagos pendientes (icono Clock amarillo)
//   3. Total recibido (icono DollarSign azul)
//
// - **Lista de Pagos**:
//   * Icono CreditCard
//   * Monto (destacado)
//   * Badge de estado
//   * Fecha con icono Calendar
//   * Método de pago con icono CreditCard
//   * Referencia de transacción (condicional)
// - Estado vacío si no hay pagos.
//
// NAVEGACIÓN:
// - Volver a contratos: /propietario/contratos
// - Editar contrato: /propietario/contratos/editar/{id}
// - Ver factura: /propietario/facturas/{id}
//
// MANEJO DE DATOS:
// - **Campos planos del DTO**: nombreInquilino, apellidoInquilino, correoInquilino, etc.
// - **Fallback a objetos anidados**: Si campos planos no existen, intenta contrato.inquilino o contrato.propiedad.
// - **Trim y validación**: Concatena nombre + apellido y verifica que no esté vacío.
// - **Type casting**: Usa (pago as any).fecha para acceder a campo fecha.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando contrato...".
// - Error/No encontrado: Icono FileText, mensaje y botón volver.
// - Sin datos: Iconos grandes con mensajes informativos en cada tab vacío.
// - Tabs con indicador visual de activo y contador de items.
//
// ESTILOS DINÁMICOS:
// - Estados de factura: Clases CSS basadas en estado (styles[estado.toLowerCase()]).
// - Estados de pago: Similar a facturas.
// - Iconos coloreados: Verde (completados), amarillo (pendientes), azul (total).
//
// CARACTERÍSTICAS:
// - Vista completa para propietario con acceso a toda la información.
// - Resumen financiero de pagos.
// - Navegación a entidades relacionadas.
// - Botón de edición para modificar contrato.
// - Manejo robusto de campos planos y anidados del DTO.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Tabs con estado activo coloreado.
// - Cards de resumen con iconos coloreados.
// - Listas con items separados visualmente.
// - Badges y estados dinámicos.

const DetalleContrato: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [contrato, setContrato] = useState<DTOContratoRespuesta | null>(null);
  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [pagos, setPagos] = useState<DTOPagoRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<
    "informacion" | "facturas" | "pagos"
  >("informacion");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID del contrato no válido");
        return;
      }

      // Cargar contrato
      const contratoData = await obtenerContratoPorId(parseInt(id));
      setContrato(contratoData);

      // Cargar facturas y filtrar solo las de este contrato
      const todasFacturas = await obtenerFacturas();
      const facturasDelContrato = todasFacturas.filter(
        (f) => f.contrato?.idContrato === parseInt(id)
      );
      setFacturas(facturasDelContrato);

      // Cargar pagos y filtrar solo los de las facturas de este contrato
      const todosPagos = await obtenerPagos();
      const idsFacturasDelContrato = facturasDelContrato.map(
        (f) => f.idFactura
      );
      const pagosDelContrato = todosPagos.filter(
        (p) => p.factura && idsFacturasDelContrato.includes(p.factura.idFactura)
      );
      setPagos(pagosDelContrato);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar la información del contrato");
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

  const calcularResumenPagos = () => {
    const completados = pagos.filter(
      (p) => String(p.estado).toUpperCase() === "VERIFICADO"
    ).length;

    const pendientes = pagos.filter(
      (p) => String(p.estado).toUpperCase() === "PENDIENTE"
    ).length;

    const totalRecibido = pagos
      .filter((p) => String(p.estado).toUpperCase() === "VERIFICADO")
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    return { completados, pendientes, totalRecibido };
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando contrato...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <FileText size={64} />
            <h3>{error || "Contrato no encontrado"}</h3>
            <BotonComponente
              label="Volver a Contratos"
              onClick={() => navigate("/propietario/contratos")}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Datos del inquilino desde los campos planos del DTO
  const nombreInquilino =
    `${contrato.nombreInquilino || ""} ${
      contrato.apellidoInquilino || ""
    }`.trim() || "N/A";

  const correoInquilino = contrato.correoInquilino || "N/A";
  const telefonoInquilino = contrato.telefonoInquilino || "N/A";
  const numeroDocumento = contrato.numeroDocumentoInquilino || "N/A";
  const resumenPagos = calcularResumenPagos();

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* Header */}
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/propietario/contratos")}
            >
              <ArrowLeft size={20} />
              Volver a Contratos
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Contrato #{contrato.idContrato}</h1>
              <span className={styles.badge}>{contrato.estado}</span>
            </div>
            <div className={styles.acciones}>
              <BotonComponente
                label="Editar"
                onClick={() => navigate(`/propietario/contratos/editar/${id}`)}
              />
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
              Información General
            </button>
            <button
              className={
                tabActiva === "facturas" ? styles.tabActiva : styles.tab
              }
              onClick={() => setTabActiva("facturas")}
            >
              <FileText size={20} />
              Facturas ({facturas.length})
            </button>
            <button
              className={tabActiva === "pagos" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("pagos")}
            >
              <CreditCard size={20} />
              Pagos ({pagos.length})
            </button>
          </div>

          {/* Tab Información */}
          {tabActiva === "informacion" && (
            <div className={styles.contenidoTab}>
              {/* Información del Contrato */}
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Información del Contrato
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Tipo de Contrato</span>
                    <span className={styles.valor}>
                      {contrato.tipoContrato || "N/A"}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Forma de Pago</span>
                    <span className={styles.valor}>
                      {contrato.formaPago || "N/A"}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Inicio</span>
                    <span className={styles.valor}>
                      {formatearFecha(contrato.fechaInicio)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Fin</span>
                    <span className={styles.valor}>
                      {formatearFecha(contrato.fechaFin)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Valor Mensual</span>
                    <span className={styles.valorDestacado}>
                      {formatearMoneda(contrato.valorMensual)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Estado</span>
                    <span className={styles.estadoBadge}>
                      {contrato.estado}
                    </span>
                  </div>
                </div>

                {contrato.observaciones && (
                  <div className={styles.observaciones}>
                    <span className={styles.label}>Observaciones:</span>
                    <p>{contrato.observaciones}</p>
                  </div>
                )}
              </div>

              {/* Información de la Propiedad */}
              <div className={styles.seccion}>
                <h2>
                  <Home size={24} />
                  Propiedad
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Dirección</span>
                    <span className={styles.valor}>
                      {contrato.direccionPropiedad ||
                        contrato.propiedad?.direccion ||
                        "N/A"}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Ciudad</span>
                    <span className={styles.valor}>
                      {contrato.ciudadPropiedad ||
                        contrato.propiedad?.ciudad ||
                        "N/A"}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Tipo</span>
                    <span className={styles.valor}>
                      {contrato.propiedad?.tipo || "N/A"}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Área</span>
                    <span className={styles.valor}>
                      {contrato.propiedad?.area || "N/A"} m²
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Habitaciones</span>
                    <span className={styles.valor}>
                      {contrato.propiedad?.habitaciones || 0}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Baños</span>
                    <span className={styles.valor}>
                      {contrato.propiedad?.banos || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del Inquilino */}
              <div className={styles.seccion}>
                <h2>
                  <User size={24} />
                  Inquilino
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Nombre Completo</span>
                    <span className={styles.valor}>{nombreInquilino}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Correo</span>
                    <span className={styles.valor}>{correoInquilino}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Teléfono</span>
                    <span className={styles.valor}>{telefonoInquilino}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Documento</span>
                    <span className={styles.valor}>{numeroDocumento}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Facturas */}
          {tabActiva === "facturas" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <div className={styles.headerSeccion}>
                  <h2>
                    <FileText size={20} />
                    Facturas del Contrato
                  </h2>
                </div>

                {facturas.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <FileText size={48} />
                    <p>No hay facturas asociadas a este contrato</p>
                  </div>
                ) : (
                  <div className={styles.listaFacturas}>
                    {facturas.map((factura) => (
                      <div
                        key={factura.idFactura}
                        className={styles.itemFactura}
                      >
                        <div className={styles.iconoFactura}>
                          <FileText size={20} />
                        </div>
                        <div className={styles.infoFactura}>
                          <div className={styles.headerFactura}>
                            <h3>Factura #{factura.idFactura}</h3>
                            <span
                              className={`${styles.estadoFactura} ${
                                styles[String(factura.estado).toLowerCase()]
                              }`}
                            >
                              {factura.estado}
                            </span>
                          </div>
                          <div className={styles.detallesFactura}>
                            <span>
                              <Calendar size={14} />
                              {formatearFecha(factura.fechaEmision)}
                            </span>
                            <span className={styles.montoFactura}>
                              <DollarSign size={14} />
                              {formatearMoneda(factura.total)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.accionesFactura}>
                          <button
                            className={styles.btnIcono}
                            onClick={() =>
                              navigate(
                                `/propietario/facturas/${factura.idFactura}`
                              )
                            }
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Pagos */}
          {tabActiva === "pagos" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <div className={styles.headerSeccion}>
                  <h2>
                    <CreditCard size={24} />
                    Pagos del Contrato
                  </h2>
                </div>

                {/* Resumen de Pagos */}
                <div className={styles.resumenPagos}>
                  <div className={styles.cardResumen}>
                    <CheckCircle size={32} className={styles.iconoVerde} />
                    <div>
                      <span className={styles.labelResumen}>
                        Pagos Completados
                      </span>
                      <span className={styles.valorResumen}>
                        {resumenPagos.completados}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardResumen}>
                    <Clock size={32} className={styles.iconoAmarillo} />
                    <div>
                      <span className={styles.labelResumen}>
                        Pagos Pendientes
                      </span>
                      <span className={styles.valorResumen}>
                        {resumenPagos.pendientes}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardResumen}>
                    <DollarSign size={32} className={styles.iconoAzul} />
                    <div>
                      <span className={styles.labelResumen}>
                        Total Recibido
                      </span>
                      <span className={styles.valorResumen}>
                        {formatearMoneda(resumenPagos.totalRecibido)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lista de Pagos */}
                {pagos.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <CreditCard size={48} />
                    <p>No hay pagos registrados para este contrato</p>
                  </div>
                ) : (
                  <div className={styles.listaPagos}>
                    {pagos.map((pago) => (
                      <div key={pago.idPago} className={styles.itemPago}>
                        <div className={styles.iconoPago}>
                          <CreditCard size={24} />
                        </div>
                        <div className={styles.infoPago}>
                          <div className={styles.headerPago}>
                            <span className={styles.montoPago}>
                              {formatearMoneda(pago.monto)}
                            </span>
                            <span
                              className={`${styles.estadoPago} ${
                                styles[String(pago.estado).toLowerCase()]
                              }`}
                            >
                              {pago.estado}
                            </span>
                          </div>
                          <div className={styles.detallesPago}>
                            <span>
                              <Calendar size={14} />
                              {formatearFecha((pago as any).fecha)}
                            </span>
                            <span>
                              <CreditCard size={14} />
                              {pago.metodoPago || "N/A"}
                            </span>
                            {pago.referenciaTransaccion && (
                              <span className={styles.referencia}>
                                Ref: {pago.referenciaTransaccion}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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

export default DetalleContrato;
