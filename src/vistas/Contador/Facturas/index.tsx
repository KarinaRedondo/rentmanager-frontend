import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { obtenerFacturas } from "../../../servicios/facturas";
import type { DTOFacturaRespuesta } from "../../../modelos/types/Factura"; 
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario"; 
import styles from "./ContadorFacturas.module.css";
import {
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "react-feather";

const ITEMS_POR_PAGINA = 10;

const ContadorFacturas: React.FC = () => {
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [facturasMostradas, setFacturasMostradas] = useState<DTOFacturaRespuesta[]>([]);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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
      setFacturas(Array.isArray(data) ? data : []);
    } catch (error) {
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

  const handleDescargarPDF = (idFactura: number) => {
    window.open(`/api/v1/facturas/${idFactura}/pdf`, "_blank");
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
          <h1>Facturas</h1>
          
          {facturas.length === 0 ? (
            <p className={styles.sinDatos}>No se encontraron facturas</p>
          ) : (
            <>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Número</th>
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
                        <td>{factura.estado}</td>
                        <td>
                          <div className={styles.acciones}>
                            <button
                              className={styles.botonVer}
                              onClick={() => navigate(`/contador/facturas/${factura.idFactura}`)}
                            >
                              <Eye size={18} /> Ver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className={styles.paginacion}>
                <button
                  onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                  disabled={paginaActual === 1}
                >
                  <ChevronLeft size={18} /> Anterior
                </button>
                <span>
                  Página {paginaActual} de {totalPaginas}
                </span>
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
    </div>
  );
};

export default ContadorFacturas;
