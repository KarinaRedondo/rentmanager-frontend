import Header from "../../../Header";
import Footer from "../..";
import styles from "./Integraciones.module.css";

const Integraciones = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Integraciones</h1>
            <p className={styles.descripcion}>
              Conecta RentManager con tus herramientas favoritas
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              RentManager se integra perfectamente con las principales plataformas y servicios del mercado, 
              permitiéndote crear un ecosistema de trabajo completamente conectado y automatizado.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Pagos y Facturación</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>Pasarelas de Pago</h4>
              <ul>
                <li>PSE (Pagos Seguros en Línea)</li>
                <li>Tarjetas de Crédito/Débito</li>
                <li>Transferencias bancarias</li>
                <li>PayU Colombia</li>
                <li>Mercado Pago</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Software Contable</h4>
              <ul>
                <li>Siigo Cloud</li>
                <li>Alegra</li>
                <li>Zoho Books</li>
                <li>QuickBooks</li>
                <li>Exportación a Excel/CSV</li>
              </ul>
            </div>
          </div>

          <h2 className={styles.subtitulo}>Comunicación</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>Notificaciones</h4>
              <ul>
                <li>Email automatizado (SMTP)</li>
                <li>WhatsApp Business API</li>
                <li>SMS masivos</li>
                <li>Notificaciones push</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Almacenamiento</h4>
              <ul>
                <li>Google Drive</li>
                <li>Dropbox</li>
                <li>OneDrive</li>
                <li>AWS S3</li>
              </ul>
            </div>
          </div>

          <div className={styles.tarjeta}>
            <h3>API RESTful Disponible</h3>
            <p>
              Desarrolla integraciones personalizadas con nuestra API documentada. Perfecta para 
              empresas que necesitan conectar RentManager con sistemas internos o aplicaciones 
              propietarias.
            </p>
          </div>

          <div className={styles.contacto}>
            <h3>¿Necesitas una integración específica?</h3>
            <p>Consulta con nuestro equipo técnico</p>
            <p><strong>soporte@rentmanager.com</strong></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Integraciones;
