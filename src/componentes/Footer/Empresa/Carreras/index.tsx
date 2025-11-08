import Header from "../../../Header";
import Footer from "../..";
import styles from "./Carreras.module.css";

const Carreras = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Únete a Nuestro Equipo</h1>
            <p className={styles.descripcion}>
              Construyamos juntos el futuro de la gestión inmobiliaria
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              En RentManager valoramos el talento, la creatividad y la pasión
              por la innovación. Buscamos profesionales comprometidos que
              quieran marcar la diferencia en la industria inmobiliaria y crecer
              junto a nosotros.
            </p>
          </div>

          <h2 className={styles.subtitulo}>¿Por Qué RentManager?</h2>
          <ul className={styles.lista}>
            <li>Proyectos desafiantes con impacto real en el mercado</li>
            <li>Ambiente colaborativo que fomenta la innovación</li>
            <li>
              Oportunidades de crecimiento profesional y capacitación continua
            </li>
            <li>Flexibilidad horaria y opciones de trabajo remoto</li>
            <li>Salario competitivo y beneficios superiores al mercado</li>
            <li>Cultura empresarial enfocada en el bienestar del equipo</li>
          </ul>

          <h2 className={styles.subtitulo}>Posiciones Abiertas</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>Desarrollo</h4>
              <ul>
                <li>Frontend Developer (React)</li>
                <li>Backend Developer (Java/Spring)</li>
                <li>Full Stack Developer</li>
                <li>DevOps Engineer</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Diseño & UX</h4>
              <ul>
                <li>UX/UI Designer</li>
                <li>Product Designer</li>
                <li>Diseñador Gráfico</li>
              </ul>
            </div>

            <div className={styles.gridItem}>
              <h4>Negocio</h4>
              <ul>
                <li>Product Manager</li>
                <li>Marketing Digital</li>
                <li>Customer Success</li>
                <li>Ventas B2B</li>
              </ul>
            </div>
          </div>

          <div className={styles.contacto}>
            <h3>Postúlate Ahora</h3>
            <p>
              Envía tu CV y portafolio a{" "}
              <strong>carreras@rentmanager.com</strong>
            </p>
            <p>Asunto: [Posición] - Tu Nombre</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Carreras;
