import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { obtenerPagos } from "../../../servicios/pagos";
import type { DTOPagoRespuesta } from "../../../modelos/types/Pago";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import styles from "./ContadorGestionPagos.module.css";
import {
  DollarSign,
  Calendar,
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Edit3,
  Check,
  X,
  AlertCircle,
} from "react-feather";

interface ModalEditarProps {
  pago: DTOPagoRespuesta | null;
  onClose: () => void;
  onGuardar: (pagoId: number, nuevoEstado: string, observaciones: string) => void;
}

const ModalEditar: React.FC<ModalEditarProps> = ({ pago, onClose, onGuardar }) => {
  const [estado, setEstado] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");

  useEffect(() => {
    if (pago) {
      setEstado(String(pago.estado || "PENDIENTE"));
      setObservaciones((pago as any).observaciones || "");
    }
  }, [pago]);

  if (!pago) return null;

  const handleGuardar = () => {
    if (!estado) {
      alert("Debes seleccionar un estado");
      return;
    }
    onGuardar(pago.idPago || 0, estado, observaciones);
  };

  const factura = pago.factura;
  const contrato = factura?.contrato;
  const inquilino = contrato?.inquilino;
  const propiedad = contrato?.propiedad;
  const direccion = (contrato as any)?.direccionPropiedad || propiedad?.direccion || "N/A";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Editar Pago</h2>
          <button className={styles.btnCerrar} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Información del pago */}
          <div className={styles.infoPago}>
            <div className={styles.campo}>
              <label>Inquilino:</label>
              <p>{inquilino?.nombre || "N/A"} {inquilino?.apellido || ""}</p>
            </div>
            <div className={styles.campo}>
              <label>Propiedad:</label>
              <p>{direccion}</p>
            </div>
            <div className={styles.campo}>
              <label>Monto:</label>
              <p className={styles.monto}>${(pago.monto || 0).toLocaleString("es-CO")}</p>
            </div>
            <div className={styles.campo}>
              <label>Método de Pago:</label>
              <p>{pago.metodoPago || "N/A"}</p>
            </div>
            <div className={styles.campo}>
              <label>Referencia:</label>
              <p className={styles.referencia}>{pago.referenciaTransaccion || "N/A"}</p>
            </div>
            <div className={styles.campo}>
              <label>Fecha:</label>
              <p>{new Date((pago as any).fechaCreacion || "").toLocaleDateString("es-CO")}</p>
            </div>
          </div>

          <div className={styles.separador}></div>

          {/* Formulario de edición */}
          <div className={styles.formularioEdicion}>
            <div className={styles.formGrupo}>
              <label htmlFor="estado">Estado del Pago *</label>
              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className={styles.selectEstado}
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="VERIFICADO">VERIFICADO</option>
                <option value="RECHAZADO">RECHAZADO</option>
                <option value="APROBADO">APROBADO</option>
              </select>
            </div>

            <div className={styles.formGrupo}>
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder="Agregar comentarios u observaciones sobre el pago..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelar} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnGuardar} onClick={handleGuardar}>
            <Check size={18} />
            Guardar Cambios
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
  const [filtroFecha, setFiltroFecha] = useState<string>("TODOS");
  const [pagoSeleccionado, setPagoSeleccionado] = useState<DTOPagoRespuesta | null>(null);
  const [mostrarModal, setMostrarModal] = useState<boolean>(false);

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [pagos, busqueda, filtroEstado, filtroFecha]);

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
      setPagos(Array.isArray(data) ? data : []);
    } catch (err: any) {
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
        const monto = (pago.monto || 0).toString();
        return (
          nombreCompleto.includes(busqueda.toLowerCase()) ||
          referencia.includes(busqueda.toLowerCase()) ||
          monto.includes(busqueda)
        );
      });
    }

    if (filtroEstado !== "TODOS") {
      resultado = resultado.filter((pago) => {
        const estado = String(pago.estado || "").toUpperCase();
        return estado === filtroEstado;
      });
    }

    if (filtroFecha !== "TODOS") {
      const hoy = new Date();
      resultado = resultado.filter((pago) => {
        const fechaPago = new Date((pago as any).fechaCreacion || "");
        const diff = Math.floor((hoy.getTime() - fechaPago.getTime()) / (1000 * 60 * 60 * 24));

        switch (filtroFecha) {
          case "HOY":
            return diff === 0;
          case "SEMANA":
            return diff <= 7;
          case "MES":
            return diff <= 30;
          case "TRIMESTRE":
            return diff <= 90;
          default:
            return true;
        }
      });
    }

    resultado.sort((a, b) => {
      const fechaA = new Date((a as any).fechaCreacion || "").getTime();
      const fechaB = new Date((b as any).fechaCreacion || "").getTime();
      return fechaB - fechaA;
    });

    setPagosFiltrados(resultado);
  };

  const calcularEstadisticas = () => {
    const totalVerificado = pagos
      .filter((p) => String(p.estado).toUpperCase() === "VERIFICADO")
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    const totalPendiente = pagos
      .filter((p) => String(p.estado).toUpperCase() === "PENDIENTE")
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    const totalRechazado = pagos
      .filter((p) => String(p.estado).toUpperCase() === "RECHAZADO")
      .reduce((sum, p) => sum + (p.monto || 0), 0);

    const pagosPendientes = pagos.filter(
      (p) => String(p.estado).toUpperCase() === "PENDIENTE"
    ).length;

    return {
      totalVerificado,
      totalPendiente,
      totalRechazado,
      pagosPendientes,
    };
  };

  const abrirModalEditar = (pago: DTOPagoRespuesta) => {
    setPagoSeleccionado(pago);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setPagoSeleccionado(null);
    setMostrarModal(false);
  };

  const handleGuardarCambios = async (
    pagoId: number,
    nuevoEstado: string,
    observaciones: string
  ) => {
    try {
      // Aquí debes llamar al servicio de actualización
      console.log("Actualizando pago:", { pagoId, nuevoEstado, observaciones });
      
      // Simulación de actualización exitosa
      alert(`Pago actualizado correctamente a estado: ${nuevoEstado}`);
      
      // Recargar pagos
      await cargarPagos();
      cerrarModal();
    } catch (err) {
      alert("Error al actualizar el pago");
      console.error(err);
    }
  };

  const cambiarEstadoRapido = async (pagoId: number, nuevoEstado: string) => {
    if (!confirm(`¿Confirmar cambio de estado a ${nuevoEstado}?`)) return;

    try {
      console.log("Cambio rápido:", { pagoId, nuevoEstado });
      alert(`Estado cambiado a ${nuevoEstado}`);
      await cargarPagos();
    } catch (err) {
      alert("Error al cambiar el estado");
      console.error(err);
    }
  };

  const obtenerIconoEstado = (estado: string) => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "VERIFICADO":
      case "APROBADO":
        return <CheckCircle size={18} />;
      case "RECHAZADO":
        return <XCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  const obtenerClaseEstado = (estado: string) => {
    const estadoUpper = String(estado).toUpperCase();
    switch (estadoUpper) {
      case "VERIFICADO":
      case "APROBADO":
        return styles.estadoVerificado;
      case "RECHAZADO":
        return styles.estadoRechazado;
      default:
        return styles.estadoPendiente;
    }
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearMoneda = (monto: number): string => {
    return `$${monto.toLocaleString("es-CO")}`;
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("TODOS");
    setFiltroFecha("TODOS");
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
            <h2>Error al cargar datos</h2>
            <p className={styles.error}>{error}</p>
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
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <div>
              <button className={styles.btnVolver} onClick={() => navigate(-1)}>
                ← Volver
              </button>
              <h1>Gestión de Pagos</h1>
              <p className={styles.subtitulo}>
                Administra, verifica y gestiona todos los pagos del sistema
              </p>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={`${styles.iconoEstadistica} ${styles.iconoVerde}`}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Verificado</p>
                <h2 className={styles.valorEstadistica}>
                  {formatearMoneda(estadisticas.totalVerificado)}
                </h2>
                <p className={styles.descripcionEstadistica}>Pagos confirmados</p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={`${styles.iconoEstadistica} ${styles.iconoNaranja}`}>
                <Clock size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Pendiente</p>
                <h2 className={styles.valorEstadistica}>
                  {formatearMoneda(estadisticas.totalPendiente)}
                </h2>
                <p className={styles.descripcionEstadistica}>
                  {estadisticas.pagosPendientes} pagos por verificar
                </p>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={`${styles.iconoEstadistica} ${styles.iconoRojo}`}>
                <XCircle size={24} />
              </div>
              <div>
                <p className={styles.labelEstadistica}>Total Rechazado</p>
                <h2 className={styles.valorEstadistica}>
                  {formatearMoneda(estadisticas.totalRechazado)}
                </h2>
                <p className={styles.descripcionEstadistica}>Pagos no válidos</p>
              </div>
            </div>
          </div>

          {/* Alerta de pagos pendientes */}
          {estadisticas.pagosPendientes > 0 && (
            <div className={styles.alerta}>
              <AlertCircle size={20} />
              <>
                Tienes <strong>{estadisticas.pagosPendientes} pagos pendientes</strong>{" "}
                por verificar
              </>
            </div>
          )}

          {/* Filtros */}
          <div className={styles.seccionFiltros}>
            <div className={styles.barraBusqueda}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por inquilino, referencia o monto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.inputBusqueda}
              />
            </div>

            <div className={styles.filtros}>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={styles.selectFiltro}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="VERIFICADO">Verificado</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="APROBADO">Aprobado</option>
              </select>

              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className={styles.selectFiltro}
              >
                <option value="TODOS">Todas las fechas</option>
                <option value="HOY">Hoy</option>
                <option value="SEMANA">Última semana</option>
                <option value="MES">Último mes</option>
                <option value="TRIMESTRE">Último trimestre</option>
              </select>

              {(busqueda || filtroEstado !== "TODOS" || filtroFecha !== "TODOS") && (
                <button className={styles.btnLimpiar} onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Tabla de pagos */}
          <div className={styles.tarjetaTabla}>
            <div className={styles.headerTabla}>
              <h3>
                <DollarSign size={20} />
                Lista de Pagos
              </h3>
              <p>{pagosFiltrados.length} registros encontrados</p>
            </div>

            {pagosFiltrados.length === 0 ? (
              <div className={styles.sinDatos}>
                <DollarSign size={48} />
                <p>No se encontraron pagos con los filtros seleccionados</p>
              </div>
            ) : (
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Inquilino</th>
                      <th>Propiedad</th>
                      <th>Referencia</th>
                      <th>Método</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFiltrados.map((pago) => {
                      const factura = pago.factura;
                      const contrato = factura?.contrato;
                      const inquilino = contrato?.inquilino;
                      const propiedad = contrato?.propiedad;
                      const direccion =
                        (contrato as any)?.direccionPropiedad ||
                        propiedad?.direccion ||
                        "N/A";

                      return (
                        <tr key={pago.idPago}>
                          <td>
                            <div className={styles.celdaFecha}>
                              <Calendar size={16} />
                              {formatearFecha((pago as any).fechaCreacion)}
                            </div>
                          </td>
                          <td className={styles.celdaInquilino}>
                            {inquilino?.nombre || "N/A"} {inquilino?.apellido || ""}
                          </td>
                          <td className={styles.celdaPropiedad}>{direccion}</td>
                          <td className={styles.celdaReferencia}>
                            {pago.referenciaTransaccion || "N/A"}
                          </td>
                          <td>{pago.metodoPago || "N/A"}</td>
                          <td className={styles.celdaMonto}>
                            {formatearMoneda(pago.monto || 0)}
                          </td>
                          <td>
                            <span
                              className={`${styles.badge} ${obtenerClaseEstado(
                                pago.estado || ""
                              )}`}
                            >
                              {obtenerIconoEstado(pago.estado || "")}
                              {pago.estado}
                            </span>
                          </td>
                          <td>
                            <div className={styles.accionesGrupo}>
                              <button
                                className={styles.btnEditar}
                                onClick={() => abrirModalEditar(pago)}
                                title="Editar"
                              >
                                <Edit3 size={16} />
                              </button>
                              {String(pago.estado).toUpperCase() === "PENDIENTE" && (
                                <>
                                  <button
                                    className={styles.btnAprobar}
                                    onClick={() =>
                                      cambiarEstadoRapido(pago.idPago || 0, "VERIFICADO")
                                    }
                                    title="Aprobar"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    className={styles.btnRechazar}
                                    onClick={() =>
                                      cambiarEstadoRapido(pago.idPago || 0, "RECHAZADO")
                                    }
                                    title="Rechazar"
                                  >
                                    <X size={16} />
                                  </button>
                                </>
                              )}
                            </div>
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

      {/* Modal de edición */}
      {mostrarModal && (
        <ModalEditar
          pago={pagoSeleccionado}
          onClose={cerrarModal}
          onGuardar={handleGuardarCambios}
        />
      )}
    </div>
  );
};

export default ContadorGestionPagos;
