import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../../componentes/Header";
import Footer from "../../../../../componentes/Footer";
import { BotonComponente } from "../../../../../componentes/ui/Boton";
import { obtenerFacturaPorId } from "../../../../../servicios/facturas";
import type { DTOFacturaRespuesta } from "../../../../../modelos/types/Factura";
import styles from "./DetalleFacturaAdministrador.module.css";
import { ArrowLeft, FileText } from "react-feather";

// ========================================
// DETALLE DE FACTURA - ROL ADMINISTRADOR
// ========================================
//
// Vista simplificada de solo lectura de factura para rol Administrador.
// Muestra información básica de la factura sin opciones de edición.
//
// FUNCIONALIDADES:
// - Visualización de datos básicos de la factura.
// - Sin opciones de edición (solo lectura).
// - Navegación de retorno a detalle de propiedad.
// - Sistema de tabs preparado pero no implementado completamente.
//
// ESTADO:
// - factura: Objeto DTOFacturaRespuesta con datos completos.
// - cargando: Indica si está cargando datos.
// - error: Mensaje de error si falla la carga.
// - tabActiva: Tab seleccionado (informacion, contrato) - parcialmente implementado.
//
// FLUJO DE CARGA:
// 1. Obtiene ID de factura desde URL params.
// 2. Valida que ID exista.
// 3. Carga factura con obtenerFacturaPorId().
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
// - Título con ID de la factura.
// - Badge de estado.
//
// Tabs:
// - Sección vacía preparada para tabs (comentario sugiere agregar botones).
// - Solo tab "informacion" está implementado.
//
// Tab Información:
// - Grid 2 columnas con campos básicos:
//   * Total (destacado)
//   * Estado (badge)
//   * Fecha de emisión
//   * Fecha de vencimiento
//   * Contrato asociado (condicional, solo si existe)
//
// NAVEGACIÓN:
// - Volver: /administrador/propiedades/1 (hardcodeado)
// - Error: /administrador/propiedades/1 (hardcodeado)
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando factura...".
// - Error/No encontrada: Icono FileText, mensaje y botón volver.
//
// LIMITACIONES Y PROBLEMAS:
// - **No hay verificación de acceso**: Falta validación de rol ADMINISTRADOR.
// - **Ruta de retorno hardcodeada**: /administrador/propiedades/1 no es dinámica.
// - **Información muy limitada**: Solo muestra 5 campos.
// - **Tabs incompletos**: Preparados pero no implementados (div vacío).
// - **No muestra**: Inquilino, propiedad, pagos asociados, concepto detallado.
// - **Tab contrato no implementado**: Estado existe pero sin renderizado.
//
// MEJORAS SUGERIDAS:
// 1. Agregar verificarAcceso() para validar rol ADMINISTRADOR.
// 2. Hacer navegación dinámica (guardar origen o usar navigate(-1)).
// 3. Implementar tabs completos: Información, Contrato, Pagos.
// 4. Agregar más campos: Concepto, descripción, subtotales.
// 5. Mostrar información de contrato relacionado en tab separado.
// 6. Agregar botón para ver contrato completo.
// 7. Mostrar inquilino asociado.
// 8. Agregar lista de pagos relacionados.
//
// CARACTERÍSTICAS:
// - Vista minimalista de solo lectura.
// - Apropiada para consulta rápida desde administrador.
// - Sin funcionalidades de gestión o edición.
// - Estructura preparada para expansión (tabs).
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Badge para estado.
// - Diseño consistente con otras vistas.
// - Sección de tabs preparada pero vacía.

const DetalleFacturaAdministrador: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [factura, setFactura] = useState<DTOFacturaRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<"informacion" | "contrato">(
    "informacion"
  );

  useEffect(() => {
    cargarFactura();
  }, [id]);

  const cargarFactura = async () => {
    try {
      setCargando(true);
      setError("");

      if (!id) {
        setError("ID de factura no válido");
        return;
      }

      const data = await obtenerFacturaPorId(parseInt(id));
      setFactura(data);
    } catch (err: any) {
      console.error("Error al cargar factura:", err);
      setError("Error al cargar la factura");
    } finally {
      setCargando(false);
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

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando factura...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !factura) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <FileText size={64} />
            <h3>{error || "Factura no encontrada"}</h3>
            <BotonComponente
              label="Volver a Facturas"
              onClick={() => navigate("/administrador/propiedades/1")}
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
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/administrador/propiedades/1")}
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className={styles.tituloSeccion}>
              <h1>Factura #{factura.idFactura}</h1>
              <span className={styles.badge}>{factura.estado}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {/* Puedes agregar aquí botones o pestañas si lo necesitas */}
          </div>

          {/* Tab Información */}
          {tabActiva === "informacion" && (
            <div className={styles.contenidoTab}>
              <div className={styles.seccion}>
                <h2>
                  <FileText size={24} />
                  Detalles de la Factura
                </h2>
                <div className={styles.grid2}>
                  <div className={styles.campo}>
                    <span className={styles.label}>Total</span>
                    <span className={styles.valorDestacado}>
                      {formatearMoneda(factura.total)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Estado</span>
                    <span className={styles.estadoBadge}>{factura.estado}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Emisión</span>
                    <span className={styles.valor}>
                      {formatearFecha(factura.fechaEmision)}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Fecha de Vencimiento</span>
                    <span className={styles.valor}>
                      {formatearFecha(factura.fechaVencimiento)}
                    </span>
                  </div>
                  {factura.contrato && (
                    <div className={styles.campo}>
                      <span className={styles.label}>Contrato asociado</span>
                      <span className={styles.valor}>
                        #{factura.contrato.idContrato}
                      </span>
                    </div>
                  )}
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

export default DetalleFacturaAdministrador;
