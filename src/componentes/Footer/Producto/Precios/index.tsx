import Header from "../../../Header";
import Footer from "../..";
import styles from "./Precios.module.css";

const Precios = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Planes y Precios</h1>
            <p className={styles.descripcion}>
              Soluciones flexibles que se adaptan a tus necesidades
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              Ofrecemos planes escalables diseñados para propietarios
              individuales, empresas inmobiliarias y administradoras de
              propiedades. Todos nuestros planes incluyen soporte técnico y
              actualizaciones constantes.
            </p>
          </div>

          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>Plan Básico</h4>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "900",
                  color: "#667eea",
                  margin: "1rem 0",
                }}
              >
                $29.990 COP/mes
              </p>
              <ul>
                <li>Hasta 5 propiedades</li>
                <li>Gestión de contratos</li>
                <li>Facturación básica</li>
                <li>Reportes estándar</li>
                <li>Soporte por email</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Plan Profesional</h4>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "900",
                  color: "#667eea",
                  margin: "1rem 0",
                }}
              >
                $79.990 COP/mes
              </p>
              <ul>
                <li>Hasta 20 propiedades</li>
                <li>Todas las funciones del básico</li>
                <li>Reportes avanzados</li>
                <li>Pagos en línea</li>
                <li>Soporte prioritario</li>
                <li>Integraciones API</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Plan Empresarial</h4>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "900",
                  color: "#667eea",
                  margin: "1rem 0",
                }}
              >
                Personalizado
              </p>
              <ul>
                <li>Propiedades ilimitadas</li>
                <li>Todas las funciones PRO</li>
                <li>Módulo contable completo</li>
                <li>Usuarios ilimitados</li>
                <li>Soporte 24/7</li>
                <li>Implementación personalizada</li>
              </ul>
            </div>
          </div>

          <div className={styles.tarjeta}>
            <h3>Todos los planes incluyen:</h3>
            <p>
              • Actualizaciones automáticas y gratuitas • Almacenamiento en la
              nube seguro • Copias de seguridad diarias • Acceso desde cualquier
              dispositivo • Cumplimiento GDPR y normativas locales
            </p>
          </div>

          <div className={styles.contacto}>
            <h3>¿Necesitas un plan personalizado?</h3>
            <p>Contáctanos para una cotización a medida</p>
            <p>
              <strong>ventas@rentmanager.com</strong>
            </p>
            <p>+57 (1) 234 5678</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Precios;
