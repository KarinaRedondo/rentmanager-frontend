import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
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
  Calendar,
  DollarSign,
  CreditCard,
  Eye,
} from "react-feather";

// ========================================
// DETALLE DE CONTRATO - ROL INQUILINO
// ========================================
//
// Vista de solo lectura de contrato para rol Inquilino con tabs de información relacionada.
// Permite visualizar contrato, propiedad, facturas y pagos asociados.
//
// FUNCIONALIDADES:
// - Visualización completa de datos del contrato.
// - Sistema de tabs para organizar información.
// - Navegación a detalle de propiedad y facturas.
// - Carga automática de facturas y pagos del contrato.
// - Sin opciones de edición (solo lectura).
//
// ESTADO:
// - contrato: Objeto DTOContratoRespuesta con datos completos.
// - facturas: Lista de facturas del contrato.
// - pagos: Lista de pagos de facturas del contrato.
// - cargando: Indica si está cargando datos.
// - tabActiva: Tab seleccionado (informacion, propiedad, facturas, pagos).
//
// FLUJO DE CARGA:
// 1. Obtiene ID de contrato desde URL params.
// 2. Carga contrato con obtenerContratoPorId().
// 3. Carga todas las facturas y filtra por idContrato.
// 4. Carga todos los pagos y filtra por IDs de facturas del contrato.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearMoneda(): Formatea números a moneda COP.
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a lista de contratos.
// - Título con ID de contrato.
// - Badge de estado.
//
// Tab Información:
// - Grid con datos del contrato: Tipo, forma de pago, fechas, valor mensual, estado.
// - Campo observaciones si existe.
//
// Tab Propiedad:
// - Grid con datos de propiedad: Dirección, ciudad, tipo, área, habitaciones, baños.
// - Botón "Ver Detalles Completos de la Propiedad" con navegación.
// - Estado vacío si no hay propiedad.
//
// Tab Facturas:
// - Lista de cards con información resumida de cada factura.
// - Card muestra: ID, estado, fecha emisión, total.
// - Botón "Ver Detalles" navega a detalle de factura.
// - Estado vacío si no hay facturas.
// - Contador de facturas en título del tab.
//
// Tab Pagos:
// - Lista de cards con información resumida de cada pago.
// - Card muestra: ID, estado, monto, método de pago.
// - Sin botón de detalle (solo visualización).
// - Estado vacío si no hay pagos.
// - Contador de pagos en título del tab.
//
// NAVEGACIÓN:
// - A lista de contratos: /inquilino/contratos
// - A detalle de propiedad: /inquilino/propiedades/{id}
// - A detalle de factura: /inquilino/facturas/{id}
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje.
// - Error/No encontrado: Icono FileText y mensaje.
// - Sin datos: Iconos grandes con mensaje por cada tab vacío.
// - Tabs con indicador de cantidad de items.
//
// CARACTERÍSTICAS:
// - Vista de solo lectura apropiada para inquilino.
// - Acceso a información financiera propia.
// - Navegación intuitiva entre entidades relacionadas.
// - Diseño limpio sin opciones de modificación.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Tabs con estado activo coloreado.
// - Cards para lista de facturas y pagos.
// - Badges para estados.

const DetalleContratoInquilino: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [contrato, setContrato] = useState<DTOContratoRespuesta | null>(null);
  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [pagos, setPagos] = useState<DTOPagoRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [tabActiva, setTabActiva] = useState<
    "informacion" | "propiedad" | "facturas" | "pagos"
  >("informacion");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      if (!id) return;

      const contratoData = await obtenerContratoPorId(parseInt(id));
      setContrato(contratoData);

      const todasFacturas = await obtenerFacturas();
      const facturasDelContrato = todasFacturas.filter(
        (f) => f.contrato?.idContrato === parseInt(id)
      );
      setFacturas(facturasDelContrato);

      const todosPagos = await obtenerPagos();
      const idsFacturas = facturasDelContrato.map((f) => f.idFactura);
      const pagosDelContrato = todosPagos.filter(
        (p) => p.factura && idsFacturas.includes(p.factura.idFactura)
      );
      setPagos(pagosDelContrato);
    } catch (err) {
      console.error(err);
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
              onClick={() => navigate("/inquilino/contratos")}
            >
              <ArrowLeft size={20} />
              Volver a Contratos
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Contrato #{contrato.idContrato}</h1>
              <span className={styles.badge}>{contrato.estado}</span>
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
              Información
            </button>
            <button
              className={
                tabActiva === "propiedad" ? styles.tabActiva : styles.tab
              }
              onClick={() => setTabActiva("propiedad")}
            >
              <Home size={20} />
              Propiedad
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
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Detalles del Contrato
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
            </div>
          )}

          {/* Tab Propiedad */}
          {tabActiva === "propiedad" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <Home size={24} />
                  Propiedad Arrendada
                </h2>
                {contrato.propiedad ? (
                  <>
                    <div className={styles.grid2}>
                      <div className={styles.campo}>
                        <span className={styles.label}>Dirección</span>
                        <span className={styles.valor}>
                          {contrato.propiedad.direccion}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Ciudad</span>
                        <span className={styles.valor}>
                          {contrato.propiedad.ciudad}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Tipo</span>
                        <span className={styles.valor}>
                          {contrato.propiedad.tipo}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Área</span>
                        <span className={styles.valor}>
                          {contrato.propiedad.area} m²
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Habitaciones</span>
                        <span className={styles.valor}>
                          {contrato.propiedad.habitaciones}
                        </span>
                      </div>
                      <div className={styles.campo}>
                        <span className={styles.label}>Baños</span>
                        <span className={styles.valor}>
                          {contrato.propiedad.banos}
                        </span>
                      </div>
                    </div>

                    <div className={styles.accionesSeccion}>
                      <button
                        className={styles.btnVer}
                        onClick={() =>
                          navigate(
                            `/inquilino/propiedades/${contrato.propiedad?.idPropiedad}`
                          )
                        }
                      >
                        <Eye size={16} />
                        Ver Detalles Completos de la Propiedad
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.sinDatos}>
                    <Home size={48} />
                    <p>No hay información de propiedad</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Facturas */}
          {tabActiva === "facturas" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Facturas del Contrato
                </h2>
                {facturas.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <FileText size={48} />
                    <p>No hay facturas</p>
                  </div>
                ) : (
                  <div className={styles.listaItems}>
                    {facturas.map((factura) => (
                      <div key={factura.idFactura} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                          <h3>Factura #{factura.idFactura}</h3>
                          <span className={styles.estadoBadge}>
                            {factura.estado}
                          </span>
                        </div>
                        <div className={styles.itemBody}>
                          <p>
                            <Calendar size={16} />
                            Emitida: {formatearFecha(factura.fechaEmision)}
                          </p>
                          <p>
                            <DollarSign size={16} />
                            Total: {formatearMoneda(factura.total)}
                          </p>
                        </div>
                        <button
                          className={styles.btnVer}
                          onClick={() =>
                            navigate(`/inquilino/facturas/${factura.idFactura}`)
                          }
                        >
                          <Eye size={16} />
                          Ver Detalles
                        </button>
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
                <h2>
                  <CreditCard size={24} />
                  Pagos del Contrato
                </h2>
                {pagos.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <CreditCard size={48} />
                    <p>No hay pagos</p>
                  </div>
                ) : (
                  <div className={styles.listaItems}>
                    {pagos.map((pago) => (
                      <div key={pago.idPago} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                          <h3>Pago #{pago.idPago}</h3>
                          <span className={styles.estadoBadge}>
                            {pago.estado}
                          </span>
                        </div>
                        <div className={styles.itemBody}>
                          <p>
                            <DollarSign size={16} />
                            Monto: {formatearMoneda(pago.monto)}
                          </p>
                          <p>
                            <CreditCard size={16} />
                            Método: {pago.metodoPago || "N/A"}
                          </p>
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

export default DetalleContratoInquilino;
