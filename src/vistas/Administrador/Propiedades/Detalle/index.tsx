import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { BotonComponente } from "../../../../componentes/ui/Boton";
import { PropiedadService } from "../../../../servicios/propiedades";
import { obtenerContratos } from "../../../../servicios/contratos";
import { obtenerFacturas } from "../../../../servicios/facturas";
import { obtenerPagos } from "../../../../servicios/pagos";
import type { DTOPropiedadRespuesta } from "../../../../modelos/types/Propiedad";
import type { DTOContratoRespuesta } from "../../../../modelos/types/Contrato";
import type { DTOFacturaRespuesta } from "../../../../modelos/types/Factura";
import type { DTOPagoRespuesta } from "../../../../modelos/types/Pago";
import styles from "./DetallePropiedad.module.css";
import {
  ArrowLeft,
  Home,
  FileText,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Eye,
} from "react-feather";

const DetallePropiedad: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [propiedad, setPropiedad] = useState<DTOPropiedadRespuesta | null>(null);
  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [pagos, setPagos] = useState<DTOPagoRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<"informacion" | "contratos" | "facturas" | "pagos">("informacion");

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID de propiedad no válido");
        return;
      }

      // Cargar propiedad
      const propiedadData = await PropiedadService.obtenerPropiedadPorId(parseInt(id));
      setPropiedad(propiedadData);

      // Cargar todos los contratos y filtrar por propiedad
      const todosContratos = await obtenerContratos();
      const contratosPropiedad = todosContratos.filter(
        (c) => c.propiedad?.idPropiedad === parseInt(id)
      );
      setContratos(contratosPropiedad);

      // Cargar todas las facturas y filtrar por contratos de esta propiedad
      const todasFacturas = await obtenerFacturas();
      const idsContratos = contratosPropiedad.map((c) => c.idContrato);
      const facturasPropiedad = todasFacturas.filter(
        (f) => f.contrato && idsContratos.includes(f.contrato.idContrato)
      );
      setFacturas(facturasPropiedad);

      // Cargar todos los pagos y filtrar por facturas de esta propiedad
      const todosPagos = await obtenerPagos();
      const idsFacturas = facturasPropiedad.map((f) => f.idFactura);
      const pagosPropiedad = todosPagos.filter(
        (p) => p.factura && idsFacturas.includes(p.factura.idFactura)
      );
      setPagos(pagosPropiedad);

    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar la información de la propiedad");
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

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando propiedad...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !propiedad) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <Home size={64} />
            <h3>{error || "Propiedad no encontrada"}</h3>
            <BotonComponente
              label="Volver a Propiedades"
              onClick={() => navigate("/administrador/propiedades")}
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
              onClick={() => navigate("/administrador/propiedades")}
            >
              <ArrowLeft size={20} />
              Volver a Propiedades
            </button>
            <div className={styles.tituloSeccion}>
              <h1>{propiedad.direccion}</h1>
              <span className={styles.badge}>{propiedad.estado}</span>
            </div>
            <div className={styles.acciones}>
              <BotonComponente
                label="Editar"
                onClick={() => navigate(`/administrador/propiedades/editar/${id}`)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={tabActiva === "informacion" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("informacion")}
            >
              <Home size={20} />
              Información
            </button>
            <button
              className={tabActiva === "contratos" ? styles.tabActiva : styles.tab}
              onClick={() => setTabActiva("contratos")}
            >
              <FileText size={20} />
              Contratos ({contratos.length})
            </button>
            <button
              className={tabActiva === "facturas" ? styles.tabActiva : styles.tab}
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
                  <Home size={24} />
                  Detalles de la Propiedad
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Dirección</span>
                    <span className={styles.valor}>{propiedad.direccion}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Ciudad</span>
                    <span className={styles.valor}>{propiedad.ciudad}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Tipo</span>
                    <span className={styles.valor}>{propiedad.tipo}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Estado</span>
                    <span className={styles.estadoBadge}>{propiedad.estado}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Área</span>
                    <span className={styles.valor}>{propiedad.area} m²</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Habitaciones</span>
                    <span className={styles.valor}>{propiedad.habitaciones}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Baños</span>
                    <span className={styles.valor}>{propiedad.banos}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Parqueadero</span>
                    <span className={styles.valor}>{propiedad.parqueaderos ? "Sí" : "No"}</span>
                  </div>
                </div>

                {propiedad.descripcion && (
                  <div className={styles.observaciones}>
                    <span className={styles.label}>Descripción:</span>
                    <p>{propiedad.descripcion}</p>
                  </div>
                )}
              </div>

              {/* Propietario */}
              <div className={styles.seccion}>
                <h2>
                  <User size={24} />
                  Propietario
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Nombre</span>
                    <span className={styles.valor}>{propiedad.nombrePropietario || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Contratos */}
          {tabActiva === "contratos" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Contratos de la Propiedad
                </h2>
                {contratos.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <FileText size={48} />
                    <p>No hay contratos asociados a esta propiedad</p>
                  </div>
                ) : (
                  <div className={styles.listaItems}>
                    {contratos.map((contrato) => (
                      <div key={contrato.idContrato} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                          <h3>Contrato #{contrato.idContrato}</h3>
                          <span className={styles.estadoBadge}>{contrato.estado}</span>
                        </div>
                        <div className={styles.itemBody}>
                          <p>
                            <User size={16} />
                            Inquilino: {contrato.nombreInquilino} {contrato.apellidoInquilino}
                          </p>
                          <p>
                            <Calendar size={16} />
                            {formatearFecha(contrato.fechaInicio)} - {formatearFecha(contrato.fechaFin)}
                          </p>
                          <p>
                            <DollarSign size={16} />
                            {formatearMoneda(contrato.valorMensual)}
                          </p>
                        </div>
                        <button
                          className={styles.btnVer}
                          onClick={() => navigate(`/administrador/contratos/${contrato.idContrato}`)}
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

          {/* Tab Facturas */}
          {tabActiva === "facturas" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Facturas de la Propiedad
                </h2>
                {facturas.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <FileText size={48} />
                    <p>No hay facturas asociadas a esta propiedad</p>
                  </div>
                ) : (
                  <div className={styles.listaItems}>
                    {facturas.map((factura) => (
                      <div key={factura.idFactura} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                          <h3>Factura #{factura.idFactura}</h3>
                          <span className={styles.estadoBadge}>{factura.estado}</span>
                        </div>
                        <div className={styles.itemBody}>
                          <p>
                            <Calendar size={16} />
                            Emitida: {formatearFecha(factura.fechaEmision)}
                          </p>
                          <p>
                            <Calendar size={16} />
                            Vencimiento: {formatearFecha(factura.fechaVencimiento)}
                          </p>
                          <p>
                            <DollarSign size={16} />
                            Total: {formatearMoneda(factura.total)}
                          </p>
                        </div>
                        <button
                          className={styles.btnVer}
                          onClick={() => navigate(`/administrador/facturas/${factura.idFactura}`)}
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
                  Pagos de la Propiedad
                </h2>
                {pagos.length === 0 ? (
                  <div className={styles.sinDatos}>
                    <CreditCard size={48} />
                    <p>No hay pagos asociados a esta propiedad</p>
                  </div>
                ) : (
                  <div className={styles.listaItems}>
                    {pagos.map((pago) => (
                      <div key={pago.idPago} className={styles.itemCard}>
                        <div className={styles.itemHeader}>
                          <h3>Pago #{pago.idPago}</h3>
                          <span className={styles.estadoBadge}>{pago.estado}</span>
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
                          <p>
                            <Calendar size={16} />
                            Fecha: {formatearFecha((pago as any).fecha)}
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

export default DetallePropiedad;
