import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerContratoPorId } from "../../../../../servicios/contratos";
import type { DTOContratoRespuesta } from "../../../../../modelos/types/Contrato";
import styles from "./DetalleContratoAdministrador.module.css";
import { ArrowLeft, FileText } from "react-feather";
import Header from "../../../../../componentes/Header";
import Footer from "../../../../../componentes/Footer";

// ========================================
// DETALLE DE CONTRATO - ROL ADMINISTRADOR
// ========================================
//
// Vista simplificada de solo lectura de contrato para rol Administrador.
// Muestra información básica del contrato sin opciones de edición.
//
// FUNCIONALIDADES:
// - Visualización de datos básicos del contrato.
// - Sin opciones de edición (solo lectura).
// - Navegación de retorno a detalle de propiedad.
//
// ESTADO:
// - contrato: Objeto DTOContratoRespuesta con datos completos.
// - cargando: Indica si está cargando datos.
//
// FLUJO DE CARGA:
// 1. Obtiene ID de contrato desde URL params.
// 2. Valida que ID exista.
// 3. Carga contrato con obtenerContratoPorId().
// 4. Muestra datos en grid simple.
//
// UTILIDADES:
// - formatearFecha(): Convierte ISO a formato largo español.
// - formatearMoneda(): Formatea números a moneda COP.
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a /administrador/propiedades/1 (ruta hardcodeada).
// - Título con ID del contrato.
// - Badge de estado.
//
// Contenido:
// - Grid 2 columnas con campos básicos:
//   * Número (ID)
//   * Estado (badge)
//   * Fecha Emisión (usa fechaInicio)
//   * Fecha Vencimiento (usa fechaFin)
//   * Subtotal (muestra valorMensual)
//   * Total (destaca valorMensual)
//
// NAVEGACIÓN:
// - Volver: /administrador/propiedades/1 (hardcodeado)
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando...".
// - Error/No encontrado: Icono FileText y mensaje "Contrato no encontrado".
//
// LIMITACIONES Y PROBLEMAS:
// - **No hay verificación de acceso**: Falta validación de rol ADMINISTRADOR.
// - **Ruta de retorno hardcodeada**: /administrador/propiedades/1 no es dinámica.
// - **Información muy limitada**: Solo muestra 6 campos.
// - **Sin tabs**: No organiza información relacionada.
// - **Nomenclatura incorrecta**: Usa "Fecha Emisión" y "Fecha Vencimiento" en lugar de "Fecha Inicio" y "Fecha Fin".
// - **Subtotal = Total**: Muestra el mismo valor (valorMensual) en ambos campos.
// - **No muestra**: Inquilino, propiedad, tipo de contrato, forma de pago, observaciones.
//
// MEJORAS SUGERIDAS:
// 1. Agregar verificarAcceso() para validar rol ADMINISTRADOR.
// 2. Hacer navegación dinámica (guardar origen en state o usar navigate(-1)).
// 3. Agregar más campos: Inquilino, propiedad, tipo, forma de pago, observaciones.
// 4. Corregir nomenclatura: "Fecha Inicio" y "Fecha Fin".
// 5. Eliminar campo "Subtotal" o calcular correctamente.
// 6. Considerar tabs para organizar información (similar a otras vistas de detalle).
// 7. Agregar botón para ver propiedad relacionada.
// 8. Agregar botón para ver inquilino relacionado.
//
// CARACTERÍSTICAS:
// - Vista minimalista de solo lectura.
// - Apropiada para consulta rápida desde administrador.
// - Sin funcionalidades de gestión o edición.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Badge para estado.
// - Diseño consistente con otras vistas.

const DetalleContratoAdministrador: React.FC = () => {
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
              onClick={() => navigate("/administrador/propiedades/1")}
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

export default DetalleContratoAdministrador;
