import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { ModalComponente } from "../../../componentes/Modal";
import InputCustom from "../../../componentes/ui/Input";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import { obtenerFacturas, crearFactura, actualizarFactura } from "../../../servicios/facturas";
import type { DTOFacturaRespuesta } from "../../../modelos/types/Factura";
import { obtenerContratos } from "../../../servicios/contratos";
import type { DTOContratoRespuesta } from "../../../modelos/types/Contrato";
import styles from "./PropietarioFacturas.module.css";
import {
  ArrowLeft,
  FileText,
  Filter,
  Download,
  Eye,
  Edit,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Search,
  Home,
  User,
} from "react-feather";

const PropietarioFacturas: React.FC = () => {
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [facturasFiltradas, setFacturasFiltradas] = useState<DTOFacturaRespuesta[]>([]);
  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");
  
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [facturaEditando, setFacturaEditando] = useState<DTOFacturaRespuesta | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const [idContrato, setIdContrato] = useState<string>("0");
  const [fechaEmision, setFechaEmision] = useState<string>("");
  const [fechaVencimiento, setFechaVencimiento] = useState<string>("");
  const [total, setTotal] = useState<string>("0");

  useEffect(() => {
    verificarAcceso();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, busqueda, facturas]);

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

      if (rolUsuario !== "PROPIETARIO" && rolUsuario !== TipoUsuario.PROPIETARIO) {
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarDatos();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [facturasData, contratosData] = await Promise.all([
        obtenerFacturas(),
        obtenerContratos(),
      ]);

      setFacturas(Array.isArray(facturasData) ? facturasData : []);
      setContratos(Array.isArray(contratosData) ? contratosData : []);
    } catch (err: any) {
      console.error("❌ Error al cargar datos:", err);
      setError("Error al cargar las facturas");
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let facturasFiltradas = [...facturas];

    if (filtroEstado !== "TODOS") {
      facturasFiltradas = facturasFiltradas.filter((f) => f.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      facturasFiltradas = facturasFiltradas.filter(
        (f) =>
          f.idFactura?.toString().includes(busquedaLower) ||
          `${f.contrato?.inquilino?.nombre} ${f.contrato?.inquilino?.apellido}`
            .toLowerCase()
            .includes(busquedaLower)
      );
    }

    setFacturasFiltradas(facturasFiltradas);
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFacturaEditando(null);
    setIdContrato("0");
    setFechaEmision("");
    setFechaVencimiento("");
    setTotal("0");
    setModalAbierto(true);
  };

  const abrirModalEditar = (factura: DTOFacturaRespuesta) => {
    setModoEdicion(true);
    setFacturaEditando(factura);
    setIdContrato(String(factura.contrato?.idContrato || 0));
    setFechaEmision(factura.fechaEmision || "");
    setFechaVencimiento(factura.fechaVencimiento || "");
    setTotal(String(factura.total || 0));
    setModalAbierto(true);
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);

      if (!idContrato || parseInt(idContrato) === 0) {
        alert("⚠️ Debe seleccionar un contrato");
        return;
      }

      if (!fechaEmision) {
        alert("⚠️ Debe ingresar la fecha de emisión");
        return;
      }

      if (!total || parseFloat(total) <= 0) {
        alert("⚠️ El monto debe ser mayor a 0");
        return;
      }

      if (modoEdicion && facturaEditando) {
        const facturaActualizar: any = {
          fechaEmision,
          total: parseFloat(total),
        };
        
        if (fechaVencimiento) {
          facturaActualizar.fechaVencimiento = fechaVencimiento;
        }

        await actualizarFactura(facturaEditando.idFactura!, facturaActualizar);
        alert("✅ Factura actualizada exitosamente");
      } else {
        const facturaRegistro: any = {
          contrato: { idContrato: parseInt(idContrato) },
          fechaEmision,
          total: parseFloat(total),
          estado: "GENERADA",
        };

        if (fechaVencimiento) {
          facturaRegistro.fechaVencimiento = fechaVencimiento;
        }

        await crearFactura(facturaRegistro);
        alert("✅ Factura creada exitosamente");
      }

      setModalAbierto(false);
      await cargarDatos();
    } catch (err: any) {
      console.error("❌ Error:", err);
      alert(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const [anio, mes, dia] = fecha.split("-");
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case "PAGADA":
        return <CheckCircle size={20} className={styles.iconoVerde} />;
      case "PENDIENTE":
      case "GENERADA":
        return <Clock size={20} className={styles.iconoAzul} />;
      case "VENCIDA":
      case "ENCOBRANZA":
        return <AlertCircle size={20} className={styles.iconoRojo} />;
      case "RECHAZADA":
      case "INCOBRABLE":
        return <XCircle size={20} className={styles.iconoGris} />;
      default:
        return <Clock size={20} />;
    }
  };

  const obtenerClaseEstado = (estado: string): string => {
    switch (estado) {
      case "PAGADA":
        return styles.estadoPagada;
      case "PENDIENTE":
      case "GENERADA":
        return styles.estadoPendiente;
      case "VENCIDA":
      case "ENCOBRANZA":
        return styles.estadoVencida;
      case "RECHAZADA":
      case "INCOBRABLE":
        return styles.estadoAnulada;
      default:
        return styles.estadoPendiente;
    }
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando facturas...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = {
    total: facturas.length,
    pagadas: facturas.filter((f) => f.estado === "PAGADA").length,
    pendientes: facturas.filter((f) => f.estado === "PENDIENTE" || f.estado === "GENERADA").length,
    vencidas: facturas.filter((f) => f.estado === "VENCIDA").length,
    totalMonto: facturas.reduce((acc, f) => acc + (f.total || 0), 0),
    montoPendiente: facturas
      .filter((f) => f.estado === "PENDIENTE" || f.estado === "VENCIDA" || f.estado === "GENERADA")
      .reduce((acc, f) => acc + (f.total || 0), 0),
  };

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <button className={styles.btnVolver} onClick={() => navigate("/propietario/dashboard")}>
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Mis Facturas</h1>
              <p className={styles.subtitulo}>Administra las facturas de tus propiedades</p>
            </div>
            <BotonComponente label="+ Nueva Factura" onClick={abrirModalNuevo} />
          </div>

          <div className={styles.gridEstadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Total Facturas</p>
                <h2 className={styles.valorEstadistica}>{estadisticas.total}</h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Pagadas</p>
                <h2 className={styles.valorEstadistica}>{estadisticas.pagadas}</h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <Clock size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Pendientes</p>
                <h2 className={styles.valorEstadistica}>{estadisticas.pendientes}</h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <AlertCircle size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Vencidas</p>
                <h2 className={styles.valorEstadistica}>{estadisticas.vencidas}</h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <DollarSign size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Total Facturado</p>
                <h2 className={styles.valorEstadistica}>{formatearMoneda(estadisticas.totalMonto)}</h2>
              </div>
            </div>

            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <AlertCircle size={24} />
              </div>
              <div className={styles.contenidoEstadistica}>
                <p className={styles.labelEstadistica}>Monto Pendiente</p>
                <h2 className={styles.valorEstadistica}>{formatearMoneda(estadisticas.montoPendiente)}</h2>
              </div>
            </div>
          </div>

          <div className={styles.seccionFiltros}>
            <div className={styles.barraBusqueda}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por ID de factura o inquilino..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.inputBusqueda}
              />
            </div>

            <div className={styles.filtros}>
              <Filter size={20} />
              <span>Filtrar por estado:</span>
              <div className={styles.grupoFiltros}>
                <button
                  className={filtroEstado === "TODOS" ? styles.filtroActivo : styles.filtroBton}
                  onClick={() => setFiltroEstado("TODOS")}
                >
                  Todos
                </button>
                <button
                  className={filtroEstado === "PAGADA" ? styles.filtroActivo : styles.filtroBton}
                  onClick={() => setFiltroEstado("PAGADA")}
                >
                  Pagadas
                </button>
                <button
                  className={filtroEstado === "PENDIENTE" ? styles.filtroActivo : styles.filtroBton}
                  onClick={() => setFiltroEstado("PENDIENTE")}
                >
                  Pendientes
                </button>
                <button
                  className={filtroEstado === "VENCIDA" ? styles.filtroActivo : styles.filtroBton}
                  onClick={() => setFiltroEstado("VENCIDA")}
                >
                  Vencidas
                </button>
              </div>
            </div>
          </div>

          <div className={styles.listaFacturas}>
            {facturasFiltradas.length === 0 ? (
              <div className={styles.sinFacturas}>
                <FileText size={64} />
                <h3>No hay facturas para mostrar</h3>
                <p>No se encontraron facturas con los filtros seleccionados</p>
              </div>
            ) : (
              <div className={styles.gridFacturas}>
                {facturasFiltradas.map((factura) => (
                  <div key={factura.idFactura} className={styles.tarjetaFactura}>
                    <div className={styles.headerFactura}>
                      <div className={styles.infoHeaderFactura}>
                        <h3>Factura #{factura.idFactura}</h3>
                        <p 
                          className={styles.propiedadFactura}
                          onClick={() => navigate(`/propietario/contratos/${factura.contrato?.idContrato}`)}
                        >
                          <Home size={14} />
                          {factura.contrato?.propiedad?.direccion || "N/A"}
                        </p>
                      </div>
                      <div className={styles.iconoEstadoFactura}>
                        {obtenerIconoEstado(factura.estado!)}
                      </div>
                    </div>

                    <div className={styles.cuerpoFactura}>
                      <div className={styles.detalleFactura}>
                        <span className={styles.labelDetalle}>
                          <User size={16} />
                          Inquilino:
                        </span>
                        <span className={styles.valorDetalle}>
                          {factura.contrato?.inquilino?.nombre} {factura.contrato?.inquilino?.apellido}
                        </span>
                      </div>

                      <div className={styles.detalleFactura}>
                        <span className={styles.labelDetalle}>
                          <Calendar size={16} />
                          Emisión:
                        </span>
                        <span className={styles.valorDetalle}>{formatearFecha(factura.fechaEmision)}</span>
                      </div>

                      {factura.fechaVencimiento && (
                        <div className={styles.detalleFactura}>
                          <span className={styles.labelDetalle}>
                            <Calendar size={16} />
                            Vencimiento:
                          </span>
                          <span className={styles.valorDetalle}>{formatearFecha(factura.fechaVencimiento)}</span>
                        </div>
                      )}

                      <div className={styles.separadorFactura}></div>

                      <div className={styles.valorMensualFactura}>
                        <span className={styles.labelValor}>
                          <DollarSign size={16} />
                          Total:
                        </span>
                        <span className={styles.valorMensual}>{formatearMoneda(factura.total!)}</span>
                      </div>

                      <span className={obtenerClaseEstado(factura.estado!)}>{factura.estado}</span>
                    </div>

                    <div className={styles.accionesFactura}>
                      <button 
                        className={styles.btnAccion}
                        onClick={() => navigate(`/propietario/contratos/${factura.contrato?.idContrato}`)}
                      >
                        <Eye size={16} />
                        Ver Contrato
                      </button>
                      <button className={styles.btnAccion} onClick={() => abrirModalEditar(factura)}>
                        <Edit size={16} />
                        Editar
                      </button>
                      <button className={styles.btnAccion}>
                        <Download size={16} />
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ModalComponente
        openModal={modalAbierto}
        setOpenModal={setModalAbierto}
        nombreModal={modoEdicion ? "Editar Factura" : "Nueva Factura"}
        guardar={handleGuardar}
        recomendaciones={[
          "Verifica que las fechas sean correctas",
          "El total debe ser mayor a 0",
          "Asegúrate de asociar la factura al contrato correcto"
        ]}
      >
        <div className={styles.formModal}>
          <div className={styles.formGroup}>
            <label>Contrato *</label>
            <select
              className={styles.selectModal}
              value={idContrato}
              onChange={(e) => setIdContrato(e.target.value)}
              disabled={guardando}
            >
              <option value="0">Seleccione un contrato</option>
              {contratos.map((c) => (
                <option key={c.idContrato} value={c.idContrato}>
                  Contrato #{c.idContrato} - {c.propiedad?.direccion}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <InputCustom title="Fecha de Emisión *" type="date" value={fechaEmision} setValue={setFechaEmision} />
            <InputCustom title="Fecha de Vencimiento" type="date" value={fechaVencimiento} setValue={setFechaVencimiento} />
          </div>

          <InputCustom title="Total *" type="number" value={total} setValue={setTotal} placeholder="Ingrese el total" />
        </div>
      </ModalComponente>

      <Footer />
    </div>
  );
};

export default PropietarioFacturas;
