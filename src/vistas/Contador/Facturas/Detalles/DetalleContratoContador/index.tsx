import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerContratoPorId } from "../../../../../servicios/contratos";
import type { DTOContratoRespuesta } from "../../../../../modelos/types/Contrato";
import styles from "./DetalleContratoContador.module.css";
import { ArrowLeft, FileText } from "react-feather";
import Header from "../../../../../componentes/Header";
import Footer from "../../../../../componentes/Footer";

// ========================================
// DETALLE DE CONTRATO - ROL CONTADOR
// ========================================
//
// Vista de solo lectura de contrato para rol Contador.
// Muestra información básica sin opciones de edición.
//
// FUNCIONALIDADES:
// - Visualización de datos básicos de contrato.
// - Navegación de retorno a lista de facturas.
// - Sin opciones de modificación (solo lectura).
//
// ESTADO:
// - contrato: Objeto DTOContratoRespuesta con datos del contrato.
// - cargando: Indica si está cargando datos.
//
// FLUJO:
// 1. Obtiene ID de contrato desde URL params.
// 2. Carga contrato con obtenerContratoPorId().
// 3. Muestra datos en grid de campos.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearMoneda(): Formatea números a moneda COP.
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a lista de facturas (hardcoded /contador/facturas/1).
// - Título con ID de contrato.
// - Badge de estado.
//
// Contenido:
// - Grid 2 columnas con campos: Número, Estado, Fecha emisión (inicio), Fecha vencimiento (fin), Subtotal, Total.
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje.
// - Error/No encontrado: Icono FileText y mensaje.
//
// LIMITACIONES:
// - Navegación de retorno hardcoded (debería usar navigate(-1)).
// - Campos mapeados incorrectamente (fechaInicio/fechaFin como emisión/vencimiento).
// - valorMensual repetido como subtotal y total.
// - Faltan datos completos del contrato (propiedad, inquilino, propietario).
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Badge coloreado para estado.

const DetalleContratoContador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState<DTOContratoRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        if (!id) return;
        const data = await obtenerContratoPorId(parseInt(id));
        setContrato(data);
      } catch (err) {
        console.error("Error cargando contrato:", err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

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
              onClick={() => navigate("/contador/facturas/1")}
            >
              <ArrowLeft size={20} />
              Volver
            </button>

            <div className={styles.tituloSeccion}>
              <h1>Contrato #{contrato.idContrato}</h1>
              <span className={styles.badge}>{contrato.estado}</span>
            </div>
          </div>

          <div className={styles.contenidoTab}>
            <div className={styles.grid2}>
              <div className={styles.campo}>
                <span className={styles.label}>Número</span>
                <span className={styles.valor}>#{contrato.idContrato}</span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Estado</span>
                <span className={styles.estadoBadge}>{contrato.estado}</span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Fecha Emisión</span>
                <span className={styles.valor}>
                  {formatearFecha(contrato.fechaInicio)}
                </span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Fecha Vencimiento</span>
                <span className={styles.valor}>
                  {formatearFecha(contrato.fechaFin)}
                </span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Subtotal</span>
                <span className={styles.valor}>
                  {formatearMoneda(contrato.valorMensual)}
                </span>
              </div>

              <div className={styles.campo}>
                <span className={styles.label}>Total</span>
                <span className={styles.valorDestacado}>
                  {formatearMoneda(contrato.valorMensual)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetalleContratoContador;
