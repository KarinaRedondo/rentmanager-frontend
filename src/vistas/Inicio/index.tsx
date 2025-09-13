import { useNavigate } from "react-router-dom";
import styles from "./Inicio.module.css";
import Footer from "../../componentes/Footer";
import Header from "../../componentes/Header";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className={styles.inicio}>
      <Header />
      {/* Contenido principal */}
      <main className={styles.main}>
        <div className={styles.texto}>
          <h1>
            Bienvenido a <span>RentManager</span>
          </h1>
          <p>
            Su solución integral para una gestión de propiedades sin
            complicaciones. Desde el seguimiento de alquileres hasta las
            solicitudes de servicio, simplificamos la vida de propietarios,
            inquilinos y administradores.
          </p>
          <button onClick={() => navigate("/login")}>Iniciar Sesión</button>
        </div>
        <div className={styles.imagen}>
          <img src="/propiedad.webp" alt="Ilustración de propiedad de lujo" />
          <img src="/casa.jpg" alt="Casa moderna" />
          <img src="/fachadaModerna.jpg" alt="Fachada contemporánea" />
        </div>
      </main>
      <Footer />
    </div>
  );
}
