import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../../componentes/Header";
import Footer from "../../../../../componentes/Footer";
import { obtenerContratos } from "../../../../../servicios/contratos";
import { PropiedadService } from "../../../../../servicios/propiedades";
import type { DTOPropiedadRespuesta } from "../../../../../modelos/types/Propiedad";
import styles from "./DetallePropiedadAdministrador.module.css";
import { ArrowLeft, Home } from "react-feather";

// ========================================
// DETALLE DE PROPIEDAD - ROL ADMINISTRADOR
// ========================================
//
// Vista simplificada de solo lectura de propiedad para rol Administrador.
// Muestra información básica de la propiedad sin opciones de edición.
//
// FUNCIONALIDADES:
// - Visualización de datos básicos de la propiedad.
// - Carga de contratos relacionados (pero no los muestra).
// - Sin opciones de edición (solo lectura).
// - Navegación de retorno hardcodeada.
// - Sistema de tabs preparado pero no implementado completamente.
//
// ESTADO:
// - propiedad: Objeto DTOPropiedadRespuesta con datos completos.
// - cargando: Indica si está cargando datos.
// - error: Mensaje de error si falla la carga.
// - tabActiva: Tab seleccionado (informacion, contratos, facturas, pagos) - solo informacion implementado.
//
// FLUJO DE CARGA:
// 1. Obtiene ID de propiedad desde URL params.
// 2. Valida que ID exista.
// 3. Carga propiedad con PropiedadService.obtenerPropiedadPorId().
// 4. Carga todos los contratos y filtra por propiedad (pero no guarda en estado).
// 5. Muestra datos en grid simple.
//
// SECCIONES:
//
// Encabezado:
// - Botón volver a /administrador/propiedades/1 (ruta hardcodeada).
// - Título con dirección de la propiedad.
// - Badge de estado.
//
// Tab Información (único implementado):
// - Grid 2 columnas con campos básicos:
//   * Dirección
//   * Ciudad
//   * Tipo
//   * Área
//   * Habitaciones
//   * Baños
//
// NAVEGACIÓN:
// - Volver: /administrador/propiedades/1 (hardcodeado)
//
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando propiedad...".
// - Error/No encontrada: Icono Home y mensaje (sin botón de acción).
//
// LIMITACIONES Y PROBLEMAS:
// - **No hay verificación de acceso**: Falta validación de rol ADMINISTRADOR.
// - **Ruta de retorno hardcodeada**: /administrador/propiedades/1 no es dinámica.
// - **Información muy limitada**: Solo muestra 6 campos básicos.
// - **Contratos cargados pero no mostrados**: Filtra contratos pero no los guarda en estado ni renderiza.
// - **Tabs no implementados**: Estado tabActiva existe pero solo un tab funciona.
// - **No muestra**: Propietario, descripción, servicios, amoblado, parqueaderos, piso, año construcción.
// - **Sin botón en error**: El estado de error no tiene botón para volver.
//
// MEJORAS SUGERIDAS:
// 1. Agregar verificarAcceso() para validar rol ADMINISTRADOR.
// 2. Hacer navegación dinámica (guardar origen o usar navigate(-1)).
// 3. Guardar contratos en estado y mostrarlos en tab "contratos".
// 4. Implementar tabs completos: Información, Contratos, Facturas, Pagos.
// 5. Agregar más campos de propiedad: Propietario, descripción, servicios, etc.
// 6. Agregar botón de acción en estado de error.
// 7. Mostrar información del propietario.
// 8. Agregar navegación a contratos, facturas y pagos relacionados.
//
// CARACTERÍSTICAS:
// - Vista minimalista de solo lectura.
// - Apropiada para consulta rápida desde administrador.
// - Sin funcionalidades de gestión o edición.
// - Estructura preparada para expansión (tabs y contratos).
// - Código parcialmente implementado.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Badge para estado.
// - Diseño consistente con otras vistas.

const DetallePropiedadAdministrador: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [propiedad, setPropiedad] = useState<DTOPropiedadRespuesta | null>(
    null
  );
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [tabActiva, setTabActiva] = useState<
    "informacion" | "contratos" | "facturas" | "pagos"
  >("informacion");

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

      const propiedadData = await PropiedadService.obtenerPropiedadPorId(
        parseInt(id)
      );
      setPropiedad(propiedadData);

      const todosContratos = await obtenerContratos();
      const contratosPropiedad = todosContratos.filter(
        (c) => c.propiedad?.idPropiedad === parseInt(id)
      );
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar la información de la propiedad");
    } finally {
      setCargando(false);
    }
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
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/administrador/propiedades/1")}
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className={styles.tituloSeccion}>
              <h1>{propiedad.direccion}</h1>
              <span className={styles.badge}>{propiedad.estado}</span>
            </div>
          </div>

          {/* Contenido reutilizado */}
          <div className={styles.contenidoTab}>
            {tabActiva === "informacion" && (
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
                    <span className={styles.label}>Area</span>
                    <span className={styles.valor}>{propiedad.area}</span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Habitaciones</span>
                    <span className={styles.valor}>
                      {propiedad.habitaciones}
                    </span>
                  </div>
                  <div className={styles.campo}>
                    <span className={styles.label}>Baños</span>
                    <span className={styles.valor}>{propiedad.banos}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetallePropiedadAdministrador;
