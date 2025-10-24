import Header from "../../../Header";
import Footer from "../..";
import styles from "./Soporte.module.css";

const Soporte = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Centro de Soporte</h1>
            <p className={styles.descripcion}>
              Estamos aquí para ayudarte en cada paso
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              Nuestro equipo de soporte está disponible para resolver tus dudas, solucionar problemas 
              técnicos y ayudarte a sacar el máximo provecho de RentManager.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Canales de Soporte</h2>

          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>📧 Email</h4>
              <p><strong>soporte@rentmanager.com</strong></p>
              <p>Respuesta en menos de 24 horas</p>
              <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
            </div>

            <div className={styles.gridItem}>
              <h4>💬 Chat en Vivo</h4>
              <p>Disponible en la plataforma</p>
              <p>Respuesta inmediata en horario laboral</p>
              <p>Lunes a Viernes: 9:00 AM - 5:00 PM</p>
            </div>

            <div className={styles.gridItem}>
              <h4>📞 Teléfono</h4>
              <p><strong>+57 (1) 234 5678</strong></p>
              <p>Soporte telefónico directo</p>
              <p>Lunes a Viernes: 8:00 AM - 6:00 PM</p>
            </div>
          </div>

          <h2 className={styles.subtitulo}>Recursos de Ayuda</h2>

          <div className={styles.tarjeta}>
            <h3>📚 Base de Conocimientos</h3>
            <p>
              Accede a nuestra biblioteca de artículos, tutoriales y guías paso a paso para resolver 
              las consultas más comunes sobre el uso de la plataforma.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>🎥 Video Tutoriales</h3>
            <p>
              Aprende a usar RentManager con nuestros videos explicativos. Desde configuración inicial 
              hasta funciones avanzadas.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>📖 Documentación Técnica</h3>
            <p>
              Documentación completa de API, guías de integración y manuales técnicos para desarrolladores.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Niveles de Soporte</h2>
          <ul className={styles.lista}>
            <li>Soporte Básico: Incluido en todos los planes</li>
            <li>Soporte Prioritario: Planes Profesional y Empresarial</li>
            <li>Soporte 24/7: Exclusivo Plan Empresarial</li>
            <li>Gestor de Cuenta Dedicado: Plan Empresarial personalizado</li>
          </ul>

          <div className={styles.contacto}>
            <h3>¿Necesitas Ayuda Urgente?</h3>
            <p>Contacta a nuestro equipo de emergencias</p>
            <p><strong>urgencias@rentmanager.com</strong></p>
            <p>Para clientes Plan Empresarial: +57 (1) 234 5679 (24/7)</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Soporte;
