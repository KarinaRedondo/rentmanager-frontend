import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { BotonComponente } from "../../../../componentes/ui/Boton";
import { obtenerContratoPorId } from "../../../../servicios/contratos";
import type { DTOContratoRespuesta } from "../../../../modelos/types/Contrato";
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
  Download,
} from "react-feather";

const DetalleContrato: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [contrato, setContrato] = useState<DTOContratoRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<"informacion" | "facturas" | "pagos">("informacion");

  useEffect(() => {
    cargarContrato();
  }, [id]);

  const cargarContrato = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID del contrato no válido");
        return;
      }

      const data = await obtenerContratoPorId(parseInt(id));
      setContrato(data);
    } catch (err: any) {
      console.error("Error al cargar contrato:", err);
      setError("Error al cargar el contrato");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const [anio, mes, dia] = fecha.split("-");
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatearMoneda = (valor: number): string => {
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

  const nombreInquilino = contrato.inquilino
    ? `${contrato.inquilino.nombre} ${contrato.inquilino.apellido}`
    : "N/A";

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
                onClick={() => navigate(`/propietario/contratos/${id}/editar`)}
              />
              <button className={styles.btnDescargar}>
                <Download size={16} />
                Descargar PDF
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={tabActiva === "informacion" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("informacion")}
            >
              <FileText size={20} />
              Información General
            </button>
            <button
              className={tabActiva === "facturas" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("facturas")}
            >
              <FileText size={20} />
              Facturas
            </button>
            <button
              className={tabActiva === "pagos" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("pagos")}
            >
              <CreditCard size={20} />
              Pagos
            </button>
          </div>

          {/* Contenido según tab activa */}
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
                    <span className={styles.valor}>{contrato.tipoContrato}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Forma de Pago</span>
                    <span className={styles.valor}>{contrato.formaPago}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Inicio</span>
                    <span className={styles.valor}>{formatearFecha(contrato.fechaInicio)}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Fin</span>
                    <span className={styles.valor}>{formatearFecha(contrato.fechaFin)}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Valor Mensual</span>
                    <span className={styles.valorDestacado}>
                      {formatearMoneda(contrato.valorMensual || 0)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Estado</span>
                    <span className={styles.estadoBadge}>{contrato.estado}</span>
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
                    <span className={styles.valor}>{contrato.propiedad?.direccion || "N/A"}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Ciudad</span>
                    <span className={styles.valor}>{contrato.propiedad?.ciudad || "N/A"}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Tipo</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Área</span>
                    <span className={styles.valor}>{contrato.propiedad?.area || "N/A"} m²</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Habitaciones</span>
                    <span className={styles.valor}>{contrato.propiedad?.habitaciones || 0}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Baños</span>
                    <span className={styles.valor}>{contrato.propiedad?.banos || 0}</span>
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
                    <span className={styles.valor}>{contrato.inquilino?.correo || "N/A"}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Teléfono</span>
                    <span className={styles.valor}>{contrato.inquilino?.telefono || "N/A"}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Documento</span>
                    <span className={styles.valor}>
                      {contrato.inquilino?.tipoDocumento} {contrato.inquilino?.numeroDocumento}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab de Facturas */}
          {tabActiva === "facturas" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <div className={styles.headerSeccion}>
                  <h2>
                    <FileText size={20} />
                    Historial de Facturas
                  </h2>
                  <BotonComponente
                    label="+ Nueva Factura"
                    onClick={() => alert("Crear nueva factura")}
                  />
                </div>

                {/* Lista de Facturas (Mock) */}
                <div className={styles.listaFacturas}>
                  {[
                    {
                      id: 1,
                      numero: "FAC-001",
                      fecha: "2025-10-01",
                      monto: 1200000,
                      estado: "PAGADA",
                      concepto: "Arriendo mes de Octubre",
                    },
                    {
                      id: 2,
                      numero: "FAC-002",
                      fecha: "2025-09-01",
                      monto: 1200000,
                      estado: "PAGADA",
                      concepto: "Arriendo mes de Septiembre",
                    },
                    {
                      id: 3,
                      numero: "FAC-003",
                      fecha: "2025-08-01",
                      monto: 1200000,
                      estado: "VENCIDA",
                      concepto: "Arriendo mes de Agosto",
                    },
                  ].map((factura) => (
                    <div key={factura.id} className={styles.itemFactura}>
                      <div className={styles.iconoFactura}>
                       <FileText size={20} />
                      </div>
                      <div className={styles.infoFactura}>
                        <div className={styles.headerFactura}>
                          <h3>{factura.numero}</h3>
                          <span className={`${styles.estadoFactura} ${styles[factura.estado.toLowerCase()]}`}>
                            {factura.estado}
                          </span>
                        </div>
                        <p className={styles.conceptoFactura}>{factura.concepto}</p>
                        <div className={styles.detallesFactura}>
                          <span>
                            <Calendar size={14} />
                            {formatearFecha(factura.fecha)}
                          </span>
                          <span className={styles.montoFactura}>
                            <DollarSign size={14} />
                            {formatearMoneda(factura.monto)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.accionesFactura}>
                        <button className={styles.btnIcono}>
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab de Pagos */}
          {tabActiva === "pagos" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <div className={styles.headerSeccion}>
                  <h2>
                    <CreditCard size={24} />
                    Historial de Pagos
                  </h2>
                  <BotonComponente
                    label="+ Registrar Pago"
                    onClick={() => alert("Registrar nuevo pago")}
                  />
                </div>

                {/* Resumen de Pagos */}
                <div className={styles.resumenPagos}>
                  <div className={styles.cardResumen}>
                    <CheckCircle size={32} className={styles.iconoVerde} />
                    <div>
                      <span className={styles.labelResumen}>Pagos Realizados</span>
                      <span className={styles.valorResumen}>2</span>
                    </div>
                  </div>
                  <div className={styles.cardResumen}>
                    <Clock size={32} className={styles.iconoAmarillo} />
                    <div>
                      <span className={styles.labelResumen}>Pagos Pendientes</span>
                      <span className={styles.valorResumen}>1</span>
                    </div>
                  </div>
                  <div className={styles.cardResumen}>
                    <DollarSign size={32} className={styles.iconoAzul} />
                    <div>
                      <span className={styles.labelResumen}>Total Recibido</span>
                      <span className={styles.valorResumen}>{formatearMoneda(2400000)}</span>
                    </div>
                  </div>
                </div>

                {/* Lista de Pagos (Mock) */}
                <div className={styles.listaPagos}>
                  {[
                    {
                      id: 1,
                      fecha: "2025-10-05",
                      monto: 1200000,
                      metodo: "Transferencia",
                      referencia: "REF123456",
                      estado: "COMPLETADO",
                    },
                    {
                      id: 2,
                      fecha: "2025-09-03",
                      monto: 1200000,
                      metodo: "Efectivo",
                      referencia: "N/A",
                      estado: "COMPLETADO",
                    },
                    {
                      id: 3,
                      fecha: "2025-08-15",
                      monto: 1200000,
                      metodo: "Transferencia",
                      referencia: "REF789012",
                      estado: "PENDIENTE",
                    },
                  ].map((pago) => (
                    <div key={pago.id} className={styles.itemPago}>
                      <div className={styles.iconoPago}>
                        <CreditCard size={24} />
                      </div>
                      <div className={styles.infoPago}>
                        <div className={styles.headerPago}>
                          <span className={styles.montoPago}>{formatearMoneda(pago.monto)}</span>
                          <span className={`${styles.estadoPago} ${styles[pago.estado.toLowerCase()]}`}>
                            {pago.estado}
                          </span>
                        </div>
                        <div className={styles.detallesPago}>
                          <span>
                            <Calendar size={14} />
                            {formatearFecha(pago.fecha)}
                          </span>
                          <span>
                            <CreditCard size={14} />
                            {pago.metodo}
                          </span>
                          {pago.referencia !== "N/A" && (
                            <span className={styles.referencia}>Ref: {pago.referencia}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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

export default DetalleContrato;
