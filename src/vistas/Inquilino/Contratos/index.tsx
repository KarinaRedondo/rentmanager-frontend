import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { obtenerContratos } from "../../../servicios/contratos";
import type { DTOContratoRespuesta } from "../../../modelos/types/Contrato";
import styles from "./Contratos.module.css";
import {
  FileText,
  Calendar,
  DollarSign,
  Home,
  Eye,
  Search,
  Filter,
} from "react-feather";

const ContratosInquilino: React.FC = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [contratosFiltrados, setContratosFiltrados] = useState<
    DTOContratoRespuesta[]
  >([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

  useEffect(() => {
    cargarContratos();
  }, []);

  useEffect(() => {
    filtrarContratos();
  }, [busqueda, filtroEstado, contratos]);

 const cargarContratos = async () => {
  try {
    setCargando(true);
    setError("");

    console.log("Iniciando carga de contratos...");

    const todosContratos = await obtenerContratos();
    console.log("Contratos obtenidos del servicio:", todosContratos);

    // Verificar usuario logueado
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
      console.warn("No se encontró usuario en localStorage");
      setError("No hay usuario logueado");
      return;
    }

    const usuario = JSON.parse(usuarioStr);
    console.log("Usuario logueado:", usuario);

    // Mostrar información de los IDs para verificar coincidencias
    console.log("ID del usuario logueado:", usuario.id || usuario.idUsuario || usuario.idInquilino);

    // Filtrar contratos del inquilino
    const contratosInquilino = todosContratos.filter((c: any) => {
      console.log(`Comparando contrato ${c.idContrato}: idInquilino=${c.idInquilino} con usuario.id=${usuario.id}`);
      return Number(c.idInquilino) === Number(usuario.id || usuario.idUsuario || usuario.idInquilino);
    });

    console.log("Contratos filtrados para el inquilino:", contratosInquilino);

    if (contratosInquilino.length === 0) {
      console.warn("No se encontraron contratos para este inquilino.");
    }

    setContratos(contratosInquilino);
  } catch (err: any) {
    console.error("Error al cargar contratos:", err);
    setError("Error al cargar los contratos");
  } finally {
    setCargando(false);
    console.log("Proceso de carga de contratos finalizado.");
  }
};

  const filtrarContratos = () => {
    let resultado = [...contratos];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      resultado = resultado.filter(
        (c) =>
          c.idContrato.toString().includes(busqueda) ||
          c.direccionPropiedad
            ?.toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          c.ciudadPropiedad?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== "TODOS") {
      resultado = resultado.filter((c) => c.estado === filtroEstado);
    }

    setContratosFiltrados(resultado);
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

  const obtenerColorEstado = (estado: string): string => {
    switch (estado.toUpperCase()) {
      case "ACTIVO":
        return styles.estadoActivo;
      case "SUSPENDIDO":
        return styles.estadoSuspendido;
      case "TERMINADO":
        return styles.estadoTerminado;
      case "CREADO":
        return styles.estadoCreado;
      default:
        return "";
    }
  };

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando contratos...</p>
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
            <div className={styles.tituloSeccion}>
              <FileText size={32} />
              <div>
                <h1>Mis Contratos</h1>
                <p>Gestiona tus contratos de arrendamiento</p>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className={styles.filtros}>
            <div className={styles.busqueda}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por ID, dirección o ciudad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className={styles.filtroEstado}>
              <Filter size={20} />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="TERMINADO">Terminado</option>
                <option value="CREADO">Creado</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className={styles.estadisticas}>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div className={styles.infoEstadistica}>
                <p>Total Contratos</p>
                <h3>{contratos.length}</h3>
              </div>
            </div>
            <div className={styles.tarjetaEstadistica}>
              <div className={styles.iconoEstadistica}>
                <FileText size={24} />
              </div>
              <div className={styles.infoEstadistica}>
                <p>Contratos Activos</p>
                <h3>{contratos.filter((c) => c.estado === "ACTIVO").length}</h3>
              </div>
            </div>
          </div>

          {/* Lista de contratos */}
          {error && <div className={styles.error}>{error}</div>}

          {contratosFiltrados.length === 0 ? (
            <div className={styles.sinDatos}>
              <FileText size={64} />
              <h3>No tienes contratos</h3>
              <p>Aún no se han registrado contratos para tu cuenta</p>
            </div>
          ) : (
            <div className={styles.listaContratos}>
              {contratosFiltrados.map((contrato) => (
                <div
                  key={contrato.idContrato}
                  className={styles.tarjetaContrato}
                >
                  <div className={styles.headerTarjeta}>
                    <div className={styles.infoBasica}>
                      <h3>
                        <FileText size={20} />
                        Contrato #{contrato.idContrato}
                      </h3>
                      <span
                        className={`${styles.estadoBadge} ${obtenerColorEstado(
                          contrato.estado ?? "DESCONOCIDO"
                        )}`}
                      >
                        {contrato.estado ?? "Estado no disponible"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cuerpoTarjeta}>
                    <div className={styles.infoItem}>
                      <Home size={16} />
                      <div>
                        <span className={styles.label}>Propiedad</span>
                        <span className={styles.valor}>
                          {contrato.direccionPropiedad || "N/A"},{" "}
                          {contrato.ciudadPropiedad || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <Calendar size={16} />
                      <div>
                        <span className={styles.label}>Vigencia</span>
                        <span className={styles.valor}>
                          {formatearFecha(contrato.fechaInicio)} -{" "}
                          {formatearFecha(contrato.fechaFin)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <DollarSign size={16} />
                      <div>
                        <span className={styles.label}>Valor Mensual</span>
                        <span className={styles.valorDestacado}>
                          {formatearMoneda(contrato.valorMensual)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <FileText size={16} />
                      <div>
                        <span className={styles.label}>Tipo</span>
                        <span className={styles.valor}>
                          {contrato.tipoContrato || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.footerTarjeta}>
                    <button
                      className={styles.btnVerDetalles}
                      onClick={() =>
                        navigate(`/inquilino/contratos/${contrato.idContrato}`)
                      }
                    >
                      <Eye size={16} />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContratosInquilino;
