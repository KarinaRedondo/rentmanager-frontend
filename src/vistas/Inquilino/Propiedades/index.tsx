import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { PropiedadService } from "../../../servicios/propiedades"; 
import type { DTOPropiedadRespuesta } from "../../../modelos/types/Propiedad";
import styles from "./DetallePropiedad.module.css";
import { ArrowLeft, Home} from "react-feather";

// ========================================
// DETALLE DE PROPIEDAD - ROL INQUILINO
// ========================================
// 
// Vista simplificada de solo lectura de propiedad para rol Inquilino.
// Muestra información básica de la propiedad arrendada.
// 
// FUNCIONALIDADES:
// - Visualización de datos básicos de la propiedad.
// - Sin opciones de edición (solo lectura).
// - Navegación de retorno al dashboard.
// 
// ESTADO:
// - propiedad: Objeto DTOPropiedadRespuesta con datos completos.
// - cargando: Indica si está cargando datos.
// 
// FLUJO DE CARGA:
// 1. Obtiene ID de propiedad desde URL params.
// 2. Valida que ID exista.
// 3. Carga propiedad con PropiedadService.obtenerPropiedadPorId().
// 4. Muestra datos en grid.
// 
// SECCIONES:
// 
// Encabezado:
// - Botón volver al dashboard.
// - Título con dirección de la propiedad.
// - Badge de estado.
// 
// Información de la Propiedad:
// - Grid 2 columnas con campos básicos:
//   * Dirección
//   * Ciudad
//   * Tipo
//   * Área (m²)
//   * Habitaciones
//   * Baños
//   * Valor Arriendo (campo incompleto sin valor mostrado)
// 
// ESTADOS VISUALES:
// - Cargando: Spinner con mensaje "Cargando...".
// - Error/No encontrada: Icono Home y mensaje "Propiedad no encontrada".
// 
// NAVEGACIÓN:
// - Volver: /inquilino/dashboard
// 
// LIMITACIONES Y PROBLEMAS:
// - **Campo "Valor Arriendo" incompleto**: Solo muestra label sin valor.
// - **No hay verificación de acceso**: Falta validación de rol INQUILINO.
// - **No valida relación inquilino-propiedad**: Cualquier inquilino puede ver cualquier propiedad.
// - **Falta manejo de errores**: No hay estado de error ni try-catch completo.
// - **Información limitada**: No muestra descripción, servicios, parqueaderos, etc.
// - **Sin tabs**: A diferencia de otras vistas de detalle, no organiza información.
// 
// CARACTERÍSTICAS:
// - Vista minimalista de solo lectura.
// - Diseño limpio sin opciones de modificación.
// - Apropiada para consulta rápida de inquilino.
// 
// MEJORAS SUGERIDAS:
// 1. Agregar verificarAcceso() para validar rol INQUILINO.
// 2. Completar campo "Valor Arriendo" con propiedad.valorArriendo?.
// 3. Agregar más campos: Descripción, servicios, amoblado, parqueaderos, piso.
// 4. Implementar estado de error con mensaje y botón reintentar.
// 5. Validar que inquilino solo vea propiedades de sus contratos.
// 6. Considerar tabs si hay más información (fotos, servicios, etc).
// 
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive 2 columnas.
// - Badge para estado.
// - Diseño consistente con otras vistas.

const DetallePropiedadInquilino: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [propiedad, setPropiedad] = useState<DTOPropiedadRespuesta | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    cargarPropiedad();
  }, [id]);

  const cargarPropiedad = async () => {
    try {
      if (!id) return;
      const data = await PropiedadService.obtenerPropiedadPorId(parseInt(id));
      setPropiedad(data);
    } catch (err) {
      console.error(err);
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
            <p>Cargando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.error}>
            <Home size={64} />
            <h3>Propiedad no encontrada</h3>
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
            <button className={styles.btnVolver} onClick={() => navigate("/inquilino/dashboard")}>
              <ArrowLeft size={20} />
              Volver
            </button>
            <div className={styles.tituloSeccion}>
              <h1>{propiedad.direccion}</h1>
              <span className={styles.badge}>{propiedad.estado}</span>
            </div>
          </div>

          <div className={styles.contenidoTab}>
            <div className={styles.seccion}>
              <h2><Home size={24} />Información de la Propiedad</h2>
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
                  <span className={styles.label}>Área</span>
                  <span className={styles.valor}>{propiedad.area} m²</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Habitaciones</span>
                  <span className={styles.valor}>{propiedad.habitaciones}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Baños</span>
                  <span className={styles.valor}>{propiedad.banos}</span>
                </div>
                <div className={styles.campo}>
                  <span className={styles.label}>Valor Arriendo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetallePropiedadInquilino;
