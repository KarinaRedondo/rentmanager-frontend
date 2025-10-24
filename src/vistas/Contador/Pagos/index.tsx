import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { obtenerPagos, actualizarPago } from "../../../servicios/pagos";
import type { DTOPagoRespuesta } from "../../../modelos/types/Pago";
import { EstadoPago } from "../../../modelos/enumeraciones/estadoPago";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import styles from "./ContadorGestionPagos.module.css";
import {
  DollarSign,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Edit3,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  CreditCard,
} from "react-feather";

interface ModalEditarProps {
  pago: DTOPagoRespuesta | null;
  onClose: () => void;
  onGuardar: (pagoId: number, datos: any) => Promise<void>;
}

const ModalEditar: React.FC<ModalEditarProps> = ({ pago, onClose, onGuardar }) => {
  const [estado, setEstado] = useState<EstadoPago>(EstadoPago.PENDIENTE);
  const [guardando, setGuardando] = useState<boolean>(false);

  useEffect(() => {
    if (pago) {
      setEstado((pago.estado as EstadoPago) || EstadoPago.PENDIENTE);
    }
  }, [pago]);

  if (!pago) return null;

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await onGuardar(pago.idPago || 0, { estado });
    } catch (error: any) {
      alert(error.message || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const factura = pago.factura;
  const contrato = factura?.contrato;
  const inquilino = contrato?.inquilino;
  const propiedad = contrato?.propiedad;
  const direccion = propiedad?.direccion || "N/A";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            <FileText size={20} />
            Detalles del Pago
          </h2>
          <button className={styles.btnCerrar} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* CAMPOS REALES DEL MODELO PAGO */}
          <div className={styles.infoPago}>
            <div className={styles.campo}>
              <label>
                <CreditCard size={14} />
                ID Pago:
              </label>
              <p className={styles.valor}><strong>#{pago.idPago}</strong></p>
            </div>

            <div className={styles.campo}>
              <label>Factura ID:</label>
              <p className={styles.valor}>#{factura?.idFactura || "N/A"}</p>
            </div>

            <div className={styles.campo}>
              <label>Fecha:</label>
              <p className={styles.valor}>
                {pago.fecha ? new Date(pago.fecha).toLocaleString("es-CO", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : "N/A"}
              </p>
            </div>

            <div className={styles.campo}>
              <label>Monto:</label>
              <p className={styles.monto}>${(pago.monto || 0).toLocaleString("es-CO")}</p>
            </div>

            <div className={styles.campo}>
              <label>Método de Pago:</label>
              <p className={styles.valor}>{pago.metodoPago || "N/A"}</p>
            </div>

            <div className={styles.campo}>
              <label>Referencia Transacción:</label>
              <p className={styles.referencia}>{pago.referenciaTransaccion || "N/A"}</p>
            </div>

            {pago.bancoOrigen && (
              <div className={styles.campo}>
                <label>Banco Origen:</label>
                <p className={styles.valor}>{pago.bancoOrigen}</p>
              </div>
            )}

            {pago.bancoDestino && (
              <div className={styles.campo}>
                <label>Banco Destino:</label>
                <p className={styles.valor}>{pago.bancoDestino}</p>
              </div>
            )}

            {pago.comprobanteUrl && (
              <div className={styles.campo}>
                <label>Comprobante:</label>
                <a 
                  href={pago.comprobanteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.linkComprobante}
                >
                  Ver Comprobante
                </a>
              </div>
            )}

            <div className={styles.campo}>
              <label>Estado Actual:</label>
              <p className={styles.estadoActual}>{pago.estado}</p>
            </div>

            <div className={styles.separadorInfo}></div>

            {/* Información relacionada (factura/inquilino) */}
            <div className={styles.campo}>
              <label>Inquilino:</label>
              <p className={styles.valor}>
                {inquilino?.nombre || "N/A"} {inquilino?.apellido || ""}
              </p>
            </div>

            <div className={styles.campo}>
              <label>Propiedad:</label>
              <p className={styles.valor}>{direccion}</p>
            </div>
          </div>

          <div className={styles.separador}></div>

          {/* Formulario de edición */}
          <div className={styles.formulario}>
            <h3>Cambiar Estado</h3>
            <div className={styles.formGrupo}>
              <label>Nuevo Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoPago)}
                disabled={guardando}
                className={styles.select}
              >
                <option value={EstadoPago.PENDIENTE}>Pendiente</option>
                <option value={EstadoPago.PROCESANDO}>Procesando</option>
                <option value={EstadoPago.COMPLETADO}>Completado</option>
                <option value={EstadoPago.FALLIDO}>Fallido</option>
                <option value={EstadoPago.REVERSADO}>Reversado</option>
                <option value={EstadoPago.CANCELADO}>Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ContadorGestionPagos: React.FC = () => {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState<DTOPagoRespuesta[]>([]);
  const [pagosFiltrados, setPagosFiltrados] = useState<DTOPagoRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [pagoSeleccionado, setPagoSeleccionado] = useState<DTOPagoRespuesta | null>(null);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [pagos, busqueda, filtroEstado]);

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

      if (
        rolUsuario !== "CONTADOR" &&
        rolUsuario !== TipoUsuario.CONTADOR &&
        rolUsuario !== "ADMINISTRADOR" &&
        rolUsuario !== TipoUsuario.ADMINISTRADOR
      ) {
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarPagos();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarPagos = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerPagos();
      console.log("Pagos recibidos:", data);
      setPagos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error:", err);
      setError("Error al cargar los pagos");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...pagos];

    if (busqueda) {
      resultado = resultado.filter((pago) => {
        const inquilino = pago.factura?.contrato?.inquilino;
        const nombreCompleto = `${inquilino?.nombre || ""} ${inquilino?.apellido || ""}`.toLowerCase();
        const referencia = (pago.referenciaTransaccion || "").toLowerCase();
        const idPago = String(pago.idPago || "");
        return (
          nombreCompleto.includes(busqueda.toLowerCase()) ||
          referencia.includes(busqueda.toLowerCase()) ||
          idPago.includes(busqueda)
        );
      });
    }

    if (filtroEstado !== "TODOS") {
      resultado = resultado.filter((pago) => 
        String(pago.estado).toUpperCase() === filtroEstado
      );
    }

    resultado.sort((a, b) => {
      const fechaA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fechaB = b.fecha ? new Date(b.fecha).getTime() : 0;
      return fechaB - fechaA;
    });

    setPagosFiltrados(resultado);
  };

  const calcularEstadisticas = () => {
    const totalCompletado = pagos
      .filter((p) => String(p.estado).toUpperCase() === EstadoPago.COMPLETADO)
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    const totalPendiente = pagos
      .filter((p) => String(p.estado).toUpperCase() === EstadoPago.PENDIENTE)
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    const pagosPendientes = pagos.filter(
      (p) => String(p.estado).toUpperCase() === EstadoPago.PENDIENTE
    ).length;

    return { totalCompletado, totalPendiente, pagosPendientes };
  };

  const handleGuardarCambios = async (pagoId: number, datos: any) => {
    try {
      console.log("Actualizando pago:", pagoId, datos);
      await actualizarPago(pagoId, datos);
      alert("Pago actualizado correctamente");
      await cargarPagos();
      setMostrarModal(false);
      setPagoSeleccionado(null);
    } catch (err: any) {
      console.error("Error:", err);
      throw new Error(err.response?.data?.message || "Error al actualizar");
    }
  };

  const obtenerIconoEstado = (estado: any) => {
    const estadoStr = String(estado).toUpperCase();
    if (estadoStr === EstadoPago.COMPLETADO) return <CheckCircle size={16} />;
    if (estadoStr === EstadoPago.PROCESANDO) return <RefreshCw size={16} />;
    if (estadoStr === EstadoPago.FALLIDO) return <XCircle size={16} />;
    if (estadoStr === EstadoPago.REVERSADO) return <AlertTriangle size={16} />;
    return <Clock size={16} />;
  };

  const obtenerClaseEstado = (estado: any) => {
    const estadoStr = String(estado).toUpperCase();
    if (estadoStr === EstadoPago.COMPLETADO) return styles.estadoCompletado;
    if (estadoStr === EstadoPago.PROCESANDO) return styles.estadoProcesando;
    if (estadoStr === EstadoPago.FALLIDO) return styles.estadoFallido;
    if (estadoStr === EstadoPago.REVERSADO) return styles.estadoReversado;
    if (estadoStr === EstadoPago.CANCELADO) return styles.estadoCancelado;
    return styles.estadoPendiente;
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando pagos...</p>
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
          <div className={styles.errorContenedor}>
            <AlertCircle size={48} />
            <h2>Error</h2>
            <p>{error}</p>
            <BotonComponente label="Reintentar" onClick={cargarPagos} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = calcularEstadisticas();

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <div>
              <button className={styles.btnVolver} onClick={() => navigate(-1)}>
                ← Volver
              </button>
              <h1>Gestión de Pagos</h1>
              <p className={styles.subtitulo}>
                Administra y verifica todos los pagos del sistema
              </p>
            </div>
          </div>

          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={`${styles.iconoEstadistica} ${styles.iconoVerde}`}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Completado</p>
                <h2 className={styles.valorEstadistica}>
                  ${estadisticas.totalCompletado.toLocaleString("es-CO")}
                </h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={`${styles.iconoEstadistica} ${styles.iconoNaranja}`}>
                <Clock size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Pendiente</p>
                <h2 className={styles.valorEstadistica}>
                  ${estadisticas.totalPendiente.toLocaleString("es-CO")}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  {estadisticas.pagosPendientes} pagos
                </p>
              </div>
            </div>
          </div>

          {estadisticas.pagosPendientes > 0 && (
            <div className={styles.alerta}>
              <AlertCircle size={20} />
              <span>
                Tienes <strong>{estadisticas.pagosPendientes} pagos pendientes</strong> por verificar
              </span>
            </div>
          )}

          <div className={styles.seccionFiltros}>
            <div className={styles.barraBusqueda}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por ID, inquilino o referencia..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={styles.selectFiltro}
            >
              <option value="TODOS">Todos los estados</option>
              <option value={EstadoPago.PENDIENTE}>Pendiente</option>
              <option value={EstadoPago.PROCESANDO}>Procesando</option>
              <option value={EstadoPago.COMPLETADO}>Completado</option>
              <option value={EstadoPago.FALLIDO}>Fallido</option>
              <option value={EstadoPago.REVERSADO}>Reversado</option>
              <option value={EstadoPago.CANCELADO}>Cancelado</option>
            </select>
          </div>

          <div className={styles.tarjetaTabla}>
            <div className={styles.headerTabla}>
              <h3>
                <DollarSign size={20} />
                Lista de Pagos
              </h3>
              <p>{pagosFiltrados.length} registros</p>
            </div>

            {pagosFiltrados.length === 0 ? (
              <div className={styles.sinDatos}>
                <DollarSign size={48} />
                <p>No se encontraron pagos</p>
              </div>
            ) : (
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Inquilino</th>
                      <th>Referencia</th>
                      <th>Método</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFiltrados.map((pago) => {
                      const inquilino = pago.factura?.contrato?.inquilino;
                      return (
                        <tr key={pago.idPago}>
                          <td className={styles.celdaId}>#{pago.idPago}</td>
                          <td>
                            <Calendar size={14} />
                            {pago.fecha ? new Date(pago.fecha).toLocaleDateString("es-CO") : "N/A"}
                          </td>
                          <td>
                            {inquilino?.nombre || "N/A"} {inquilino?.apellido || ""}
                          </td>
                          <td className={styles.referencia}>{pago.referenciaTransaccion || "N/A"}</td>
                          <td>{pago.metodoPago || "N/A"}</td>
                          <td className={styles.monto}>
                            ${(pago.monto || 0).toLocaleString("es-CO")}
                          </td>
                          <td>
                            <span className={`${styles.badge} ${obtenerClaseEstado(pago.estado)}`}>
                              {obtenerIconoEstado(pago.estado)}
                              {pago.estado}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.btnEditar}
                              onClick={() => {
                                setPagoSeleccionado(pago);
                                setMostrarModal(true);
                              }}
                              title="Ver detalles"
                            >
                              <Edit3 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {mostrarModal && (
        <ModalEditar
          pago={pagoSeleccionado}
          onClose={() => {
            setMostrarModal(false);
            setPagoSeleccionado(null);
          }}
          onGuardar={handleGuardarCambios}
        />
      )}
    </div>
  );
};

export default ContadorGestionPagos;

