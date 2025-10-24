import Header from "../../../Header";
import Footer from "../..";
import styles from "./Caracteristicas.module.css";

const Caracteristicas = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Características Principales</h1>
            <p className={styles.descripcion}>
              Soluciones completas para cada actor del ecosistema inmobiliario
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              RentManager integra todas las herramientas necesarias para gestionar propiedades de manera 
              eficiente, segura y transparente. Nuestra plataforma está diseñada para adaptarse a las 
              necesidades específicas de cada usuario.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Para Propietarios</h2>
          <div className={styles.tarjeta}>
            <h3>Gestión Integral de Propiedades</h3>
            <p>
              Control total sobre tu portafolio inmobiliario desde un único panel de control.
            </p>
          </div>
          <ul className={styles.lista}>
            <li>Registro completo de propiedades con detalles técnicos y fotográficos</li>
            <li>Seguimiento en tiempo real del estado de cada propiedad</li>
            <li>Gestión de contratos con renovaciones automáticas</li>
            <li>Facturación automatizada y recordatorios de pago</li>
            <li>Reportes financieros detallados y análisis de rentabilidad</li>
            <li>Gestión documental centralizada y segura</li>
          </ul>

          <h2 className={styles.subtitulo}>Para Inquilinos</h2>
          <div className={styles.tarjeta}>
            <h3>Portal del Inquilino</h3>
            <p>
              Acceso completo a tu información contractual y facilidades de pago en línea.
            </p>
          </div>
          <ul className={styles.lista}>
            <li>Visualización de contratos activos y términos acordados</li>
            <li>Pagos en línea seguros con múltiples métodos de pago</li>
            <li>Historial completo de pagos y facturas</li>
            <li>Descarga de documentos y recibos</li>
            <li>Canal de comunicación directo con propietarios</li>
            <li>Notificaciones automáticas de vencimientos</li>
          </ul>

          <h2 className={styles.subtitulo}>Para Administradores</h2>
          <div className={styles.tarjeta}>
            <h3>Panel de Administración Avanzado</h3>
            <p>
              Supervisión completa del sistema con herramientas de gestión empresarial.
            </p>
          </div>
          <ul className={styles.lista}>
            <li>Dashboard ejecutivo con KPIs en tiempo real</li>
            <li>Gestión centralizada de usuarios y permisos</li>
            <li>Supervisión de todas las operaciones del sistema</li>
            <li>Generación de reportes personalizados</li>
            <li>Auditoría completa de actividades</li>
            <li>Herramientas de análisis predictivo</li>
          </ul>

          <h2 className={styles.subtitulo}>Para Contadores</h2>
          <div className={styles.tarjeta}>
            <h3>Módulo Contable Profesional</h3>
            <p>
              Herramientas especializadas para gestión financiera y auditoría.
            </p>
          </div>
          <ul className={styles.lista}>
            <li>Verificación y validación de pagos</li>
            <li>Conciliación bancaria automatizada</li>
            <li>Generación de reportes contables estándar</li>
            <li>Exportación a sistemas contables externos</li>
            <li>Auditoría de transacciones financieras</li>
            <li>Cumplimiento normativo y fiscal</li>
          </ul>

          <div className={styles.contacto}>
            <h3>¿Quieres ver RentManager en acción?</h3>
            <p>Solicita una demo personalizada</p>
            <p><strong>ventas@rentmanager.com</strong></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Caracteristicas;
