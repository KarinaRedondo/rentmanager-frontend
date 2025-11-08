import Header from "../../../Header";
import Footer from "../..";
import styles from "./AcercaDeNosotros.module.css";

const AcercaDeNosotros = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Acerca de RentManager</h1>
            <p className={styles.descripcion}>
              Transformando la gestión inmobiliaria con tecnología innovadora y
              soluciones inteligentes
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              RentManager nace como respuesta a la creciente necesidad de
              digitalización en el sector inmobiliario. Somos una plataforma
              integral que conecta propietarios, inquilinos, administradores y
              contadores en un ecosistema eficiente, transparente y seguro.
            </p>
            <p className={styles.texto}>
              Con años de experiencia en desarrollo de software empresarial,
              nuestro equipo ha diseñado una solución que combina potencia,
              simplicidad y confiabilidad para revolucionar la manera en que se
              gestionan las propiedades en arriendo.
            </p>
          </div>

          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>Nuestra Misión</h4>
              <p>
                Simplificar y optimizar la administración de propiedades
                mediante tecnología de vanguardia, eliminando procesos manuales
                y facilitando la toma de decisiones informadas.
              </p>
            </div>

            <div className={styles.gridItem}>
              <h4>Nuestra Visión</h4>
              <p>
                Convertirnos en la plataforma líder de gestión inmobiliaria en
                Latinoamérica, estableciendo nuevos estándares de eficiencia,
                seguridad y satisfacción del cliente.
              </p>
            </div>
          </div>

          <h2 className={styles.subtitulo}>Nuestros Valores</h2>
          <ul className={styles.lista}>
            <li>Innovación continua en cada aspecto de nuestro servicio</li>
            <li>Transparencia absoluta en operaciones y comunicación</li>
            <li>Compromiso inquebrantable con la satisfacción del cliente</li>
            <li>Seguridad de datos como prioridad fundamental</li>
            <li>Excelencia en el servicio y soporte técnico</li>
            <li>Responsabilidad social y sostenibilidad empresarial</li>
          </ul>

          <div className={styles.contacto}>
            <h3>¿Quieres saber más?</h3>
            <p>
              Contáctanos en <strong>info@rentmanager.com</strong>
            </p>
            <p>
              Teléfono: <strong>+57 (1) 234 5678</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AcercaDeNosotros;
