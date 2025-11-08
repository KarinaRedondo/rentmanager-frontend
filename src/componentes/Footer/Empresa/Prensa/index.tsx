import Header from "../../../Header";
import Footer from "../..";
import styles from "./Prensa.module.css";

const Prensa = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Sala de Prensa</h1>
            <p className={styles.descripcion}>
              Recursos e información para medios de comunicación
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              Bienvenidos a la sala de prensa de RentManager. Aquí encontrarás
              toda la información corporativa, comunicados oficiales, recursos
              multimedia y contactos para consultas periodísticas.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>Últimas Noticias</h3>
            <p>
              RentManager continúa su expansión en el mercado latinoamericano,
              alcanzando más de 10,000 propiedades gestionadas activamente en la
              plataforma durante 2025.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Kit de Prensa</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>Recursos Visuales</h4>
              <ul>
                <li>Logotipos en alta resolución</li>
                <li>Capturas de pantalla del sistema</li>
                <li>Imágenes corporativas</li>
                <li>Videos demostrativos</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Información Corporativa</h4>
              <ul>
                <li>Perfil de la empresa</li>
                <li>Biografías ejecutivas</li>
                <li>Datos y estadísticas</li>
                <li>Casos de éxito</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Documentación</h4>
              <ul>
                <li>Comunicados de prensa</li>
                <li>White papers</li>
                <li>Estudios de mercado</li>
                <li>Informes anuales</li>
              </ul>
            </div>
          </div>

          <div className={styles.contacto}>
            <h3>Contacto de Prensa</h3>
            <p>Departamento de Comunicaciones</p>
            <p>
              Email: <strong>prensa@rentmanager.com</strong>
            </p>
            <p>
              Teléfono: <strong>+57 (1) 234 5678 ext. 201</strong>
            </p>
            <p>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Prensa;
