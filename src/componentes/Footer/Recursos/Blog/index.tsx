import Header from "../../../Header";
import Footer from "../..";
import styles from "./Blog.module.css";

const Blog = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Blog RentManager</h1>
            <p className={styles.descripcion}>
              Noticias, consejos y tendencias del sector inmobiliario
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              Mantente actualizado con nuestros artículos sobre gestión de
              propiedades, tecnología inmobiliaria, consejos legales y mejores
              prácticas del sector.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Artículos Destacados</h2>

          <div className={styles.tarjeta}>
            <h3>Cómo Optimizar la Rentabilidad de tus Propiedades en 2025</h3>
            <p>
              Descubre las estrategias clave para maximizar el retorno de
              inversión en el mercado inmobiliario actual. Análisis de
              tendencias, precios y demanda.
            </p>
            <p
              style={{
                color: "#667eea",
                fontSize: "0.9rem",
                marginTop: "1rem",
              }}
            >
              Publicado: 15 de Octubre, 2025
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>Guía Completa: Contratos de Arrendamiento en Colombia</h3>
            <p>
              Todo lo que necesitas saber sobre la legislación colombiana en
              contratos de arriendo. Derechos, deberes y aspectos legales
              fundamentales.
            </p>
            <p
              style={{
                color: "#667eea",
                fontSize: "0.9rem",
                marginTop: "1rem",
              }}
            >
              Publicado: 8 de Octubre, 2025
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>Digitalización Inmobiliaria: El Futuro Ya Está Aquí</h3>
            <p>
              Cómo la tecnología está transformando la gestión de propiedades y
              por qué es momento de adoptar soluciones digitales.
            </p>
            <p
              style={{
                color: "#667eea",
                fontSize: "0.9rem",
                marginTop: "1rem",
              }}
            >
              Publicado: 20 de Diciembre, 2024
            </p>
          </div>

          <h2 className={styles.subtitulo}>Categorías</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <h4>Gestión Inmobiliaria</h4>
              <p>
                Estrategias y mejores prácticas para administrar propiedades
                eficientemente
              </p>
            </div>

            <div className={styles.gridItem}>
              <h4>Legal y Normativo</h4>
              <p>
                Actualizaciones legales y regulaciones del sector inmobiliario
              </p>
            </div>

            <div className={styles.gridItem}>
              <h4>Tecnología</h4>
              <p>Innovaciones y herramientas digitales para el sector</p>
            </div>
          </div>

          <div className={styles.contacto}>
            <h3>Suscríbete a Nuestro Newsletter</h3>
            <p>Recibe artículos exclusivos directamente en tu email</p>
            <p>
              <strong>newsletter@rentmanager.com</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Blog;
