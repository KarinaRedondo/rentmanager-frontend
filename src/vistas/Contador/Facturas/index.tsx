import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { obtenerFacturas, actualizarFactura, crearFactura } from "../../../servicios/facturas";
import { obtenerContratos } from "../../../servicios/contratos"; // Necesario para el select
import type { DTOFacturaRespuesta } from "../../../modelos/types/Factura"; 
import type { DTOContratoRespuesta } from "../../../modelos/types/Contrato"; 
import { EstadoFactura } from "../../../modelos/enumeraciones/estadoFactura";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario"; 
import styles from "./ContadorFacturas.module.css";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  Save,
  Plus,
  FileText,
} from "react-feather";

const ITEMS_POR_PAGINA = 10;

// Modal de Edición
interface ModalEditarProps {
  factura: DTOFacturaRespuesta | null;
  onClose: () => void;
  onGuardar: (facturaId: number, estado: EstadoFactura) => Promise<void>;
}

const ModalEditar: React.FC<ModalEditarProps> = ({ factura, onClose, onGuardar }) => {
  const [estado, setEstado] = useState<EstadoFactura>(EstadoFactura.GENERADA);
  const [guardando, setGuardando] = useState<boolean>(false);

  useEffect(() => {
    if (factura) {
      setEstado(factura.estado ? (factura.estado as EstadoFactura) : EstadoFactura.GENERADA);
    }
  }, [factura]);

  if (!factura) return null;

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await onGuardar(factura.idFactura || 0, estado);
    } catch (error: any) {
      alert(error.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const contrato = factura.contrato;
  const inquilino = contrato?.inquilino;
  const propiedad = contrato?.propiedad;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <Edit3 size={20} />
            Editar Factura #{factura.idFactura}
          </h2>
          <button className={styles.btnCerrar} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.infoFactura}>
            <div className={styles.campo}>
              <label>ID Factura:</label>
              <p><strong>#{factura.idFactura}</strong></p>
            </div>
            <div className={styles.campo}>
              <label>Inquilino:</label>
              <p>{inquilino?.nombre || "N/A"} {inquilino?.apellido || ""}</p>
            </div>
            <div className={styles.campo}>
              <label>Propiedad:</label>
              <p>{propiedad?.direccion || "N/A"}</p>
            </div>
            <div className={styles.campo}>
              <label>Fecha Emisión:</label>
              <p>{factura.fechaEmision ? new Date(factura.fechaEmision).toLocaleDateString("es-CO") : "N/A"}</p>
            </div>
            <div className={styles.campo}>
              <label>Fecha Vencimiento:</label>
              <p>{factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toLocaleDateString("es-CO") : "N/A"}</p>
            </div>
            <div className={styles.campo}>
              <label>Total:</label>
              <p className={styles.total}>${(factura.total || 0).toLocaleString("es-CO")}</p>
            </div>
            <div className={styles.campo}>
              <label>Estado Actual:</label>
              <p className={styles.estadoActual}>{factura.estado || "GENERADA"}</p>
            </div>
          </div>

          <div className={styles.separador}></div>

          <div className={styles.formulario}>
            <h3>Cambiar Estado</h3>
            <div className={styles.formGrupo}>
              <label>Nuevo Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoFactura)}
                disabled={guardando}
                className={styles.select}
              >
                <option value={EstadoFactura.GENERADA}>Generada</option>
                <option value={EstadoFactura.PENDIENTE}>Pendiente</option>
                <option value={EstadoFactura.PAGADA}>Pagada</option>
                <option value={EstadoFactura.VENCIDA}>Vencida</option>
                <option value={EstadoFactura.EN_DISPUTA}>En Disputa</option>
                <option value={EstadoFactura.AJUSTADA}>Ajustada</option>
                <option value={EstadoFactura.RECHAZADA}>Rechazada</option>
                <option value={EstadoFactura.EN_COBRANZA}>En Cobranza</option>
                <option value={EstadoFactura.INCOBRABLE}>Incobrable</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
            <Save size={18} />
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Crear Factura
interface ModalCrearProps {
  onClose: () => void;
  onGuardar: (datos: any) => Promise<void>;
}

const ModalCrear: React.FC<ModalCrearProps> = ({ onClose, onGuardar }) => {
  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [contratoId, setContratoId] = useState<string>("");
  const [fechaEmision, setFechaEmision] = useState<string>("");
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [cargandoContratos, setCargandoContratos] = useState<boolean>(true);

  useEffect(() => {
    cargarContratos();
  }, []);

  const cargarContratos = async () => {
    try {
      setCargandoContratos(true);
      const data = await obtenerContratos();
      setContratos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar contratos:", error);
    } finally {
      setCargandoContratos(false);
    }
  };

  const handleGuardar = async () => {
    if (!contratoId || !fechaEmision || !fechaVencimiento || !total) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({
        contrato: { idContrato: Number(contratoId) },
        fechaEmision,
        fechaVencimiento,
        total: Number(total),
        estado: EstadoFactura.GENERADA,
      });
    } catch (error: any) {
      alert(error.message || "Error al crear");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <FileText size={20} />
            Crear Nueva Factura
          </h2>
          <button className={styles.btnCerrar} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formulario}>
            <div className={styles.formGrupo}>
              <label>Contrato *</label>
              {cargandoContratos ? (
                <p>Cargando contratos...</p>
              ) : (
                <select
                  value={contratoId}
                  onChange={(e) => setContratoId(e.target.value)}
                  disabled={guardando}
                  className={styles.select}
                >
                  <option value="">Seleccionar contrato</option>
                  {contratos.map((contrato) => (
                    <option key={contrato.idContrato} value={contrato.idContrato}>
                      Contrato #{contrato.idContrato} - {contrato.inquilino?.nombre} {contrato.inquilino?.apellido}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles.formGrupo}>
              <label>Fecha de Emisión *</label>
              <input
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
                disabled={guardando}
                className={styles.input}
              />
            </div>

            <div className={styles.formGrupo}>
              <label>Fecha de Vencimiento *</label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={guardando}
                className={styles.input}
              />
            </div>

            <div className={styles.formGrupo}>
              <label>Total *</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="0"
                disabled={guardando}
                className={styles.input}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
            <Save size={18} />
            {guardando ? "Creando..." : "Crear Factura"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
const ContadorFacturas: React.FC = () => {
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [facturasMostradas, setFacturasMostradas] = useState<DTOFacturaRespuesta[]>([]);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<DTOFacturaRespuesta | null>(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState<boolean>(false);
  const [mostrarModalCrear, setMostrarModalCrear] = useState<boolean>(false);

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    actualizarFacturasMostradas();
  }, [facturas, paginaActual]);

  const verificarAcceso = async () => {
    try {
      const usuarioString = localStorage.getItem("usuario");
      const token = localStorage.getItem("token");

      if (!usuarioString || !token) {
        navigate("/login");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const rolUsuario = usuario.rol || usuario.tipoUsuario;

      if (rolUsuario !== "CONTADOR" && rolUsuario !== TipoUsuario.CONTADOR) {
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarFacturas();
    } catch (error) {
      navigate("/login");
    }
  };

  const cargarFacturas = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerFacturas();
      console.log("Facturas recibidas:", data);
      setFacturas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando facturas:", error);
      setError("Error cargando facturas");
    } finally {
      setCargando(false);
    }
  };

  const actualizarFacturasMostradas = () => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    const fin = inicio + ITEMS_POR_PAGINA;
    setFacturasMostradas(facturas.slice(inicio, fin));
  };

  const handleGuardarEdicion = async (facturaId: number, estado: EstadoFactura) => {
    try {
      console.log("Actualizando factura:", facturaId, estado);
      await actualizarFactura(facturaId, { estado });
      alert("Factura actualizada correctamente");
      await cargarFacturas();
      setMostrarModalEditar(false);
      setFacturaSeleccionada(null);
    } catch (err: any) {
      console.error("Error:", err);
      throw new Error(err.response?.data?.message || "Error al actualizar");
    }
  };

  const handleCrearFactura = async (datos: any) => {
    try {
      console.log("Creando factura:", datos);
      await crearFactura(datos);
      alert("Factura creada correctamente");
      await cargarFacturas();
      setMostrarModalCrear(false);
    } catch (err: any) {
      console.error("Error:", err);
      throw new Error(err.response?.data?.message || "Error al crear");
    }
  };

  const obtenerClaseEstado = (estado: string | undefined) => {
    if (!estado) return styles.estadoGenerada;
    const estadoUpper = estado.toUpperCase();
    if (estadoUpper === EstadoFactura.PAGADA) return styles.estadoPagada;
    if (estadoUpper === EstadoFactura.PENDIENTE) return styles.estadoPendiente;
    if (estadoUpper === EstadoFactura.VENCIDA) return styles.estadoVencida;
    if (estadoUpper === EstadoFactura.EN_DISPUTA) return styles.estadoDisputa;
    if (estadoUpper === EstadoFactura.RECHAZADA) return styles.estadoRechazada;
    if (estadoUpper === EstadoFactura.EN_COBRANZA) return styles.estadoCobranza;
    if (estadoUpper === EstadoFactura.INCOBRABLE) return styles.estadoIncobrable;
    if (estadoUpper === EstadoFactura.AJUSTADA) return styles.estadoAjustada;
    return styles.estadoGenerada;
  };

  const totalPaginas = Math.ceil(facturas.length / ITEMS_POR_PAGINA);

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("es-CO", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const formatearMoneda = (monto?: number) => {
    if (!monto) return "$0";
    return monto.toLocaleString("es-CO", { 
      style: "currency", 
      currency: "COP" 
    });
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.contenedor}>
            <p className={styles.cargando}>Cargando facturas...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.contenedor}>
            <p className={styles.error}>{error}</p>
            <BotonComponente label="Reintentar" onClick={cargarFacturas} />
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
            <h1>Facturas</h1>
            <button className={styles.btnNuevo} onClick={() => setMostrarModalCrear(true)}>
              <Plus size={20} />
              Nueva Factura
            </button>
          </div>
          
          {facturas.length === 0 ? (
            <p className={styles.sinDatos}>No se encontraron facturas</p>
          ) : (
            <>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha Emisión</th>
                      <th>Fecha Vencimiento</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturasMostradas.map((factura) => (
                      <tr key={factura.idFactura}>
                        <td>{factura.idFactura}</td>
                        <td>{formatearFecha(factura.fechaEmision)}</td>
                        <td>{formatearFecha(factura.fechaVencimiento)}</td>
                        <td>{formatearMoneda(factura.total)}</td>
                        <td>
                          <span className={`${styles.badge} ${obtenerClaseEstado(factura.estado)}`}>
                            {factura.estado || "GENERADA"}
                          </span>
                        </td>
                        <td>
                          <div className={styles.acciones}>
                            <button
                              className={styles.botonVer}
                              onClick={() => navigate(`/contador/facturas/${factura.idFactura}`)}
                              title="Ver detalles"
                            >
                              <Eye size={18} /> Ver
                            </button>
                            <button
                              className={styles.botonEditar}
                              onClick={() => {
                                setFacturaSeleccionada(factura);
                                setMostrarModalEditar(true);
                              }}
                              title="Editar factura"
                            >
                              <Edit3 size={18} /> Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.paginacion}>
                <button
                  onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                  disabled={paginaActual === 1}
                >
                  <ChevronLeft size={18} /> Anterior
                </button>
                <span>Página {paginaActual} de {totalPaginas}</span>
                <button
                  onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      {mostrarModalEditar && (
        <ModalEditar
          factura={facturaSeleccionada}
          onClose={() => {
            setMostrarModalEditar(false);
            setFacturaSeleccionada(null);
          }}
          onGuardar={handleGuardarEdicion}
        />
      )}

      {mostrarModalCrear && (
        <ModalCrear
          onClose={() => setMostrarModalCrear(false)}
          onGuardar={handleCrearFactura}
        />
      )}
    </div>
  );
};

export default ContadorFacturas;
