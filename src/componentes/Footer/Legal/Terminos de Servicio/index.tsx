import Header from "../../../Header";
import Footer from "../..";
import styles from "./TerminosDeservicio.module.css";

const Terminos = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Términos de Servicio</h1>
            <p className={styles.descripcion}>
              Última actualización: Enero 2025
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              Bienvenido a RentManager. Al acceder y utilizar nuestra
              plataforma, aceptas cumplir con estos Términos de Servicio. Por
              favor, léelos cuidadosamente antes de usar nuestros servicios.
            </p>
          </div>

          <h2 className={styles.subtitulo}>1. Aceptación de los Términos</h2>
          <p className={styles.texto}>
            Al registrarte y utilizar RentManager, aceptas estar legalmente
            vinculado por estos términos. Si no estás de acuerdo con alguna
            parte de estos términos, no debes utilizar nuestros servicios.
          </p>

          <h2 className={styles.subtitulo}>2. Descripción del Servicio</h2>
          <p className={styles.texto}>
            RentManager proporciona una plataforma web para la gestión de
            propiedades en arriendo, incluyendo pero no limitado a:
          </p>
          <ul className={styles.lista}>
            <li>Registro y gestión de propiedades</li>
            <li>Administración de contratos de arrendamiento</li>
            <li>Facturación y seguimiento de pagos</li>
            <li>Reportes y análisis financieros</li>
            <li>Comunicación entre propietarios e inquilinos</li>
          </ul>

          <h2 className={styles.subtitulo}>3. Registro y Cuenta de Usuario</h2>
          <p className={styles.texto}>Para utilizar RentManager debes:</p>
          <ul className={styles.lista}>
            <li>Ser mayor de 18 años</li>
            <li>Proporcionar información verdadera y actualizada</li>
            <li>Mantener la confidencialidad de tus credenciales</li>
            <li>
              Notificar inmediatamente cualquier uso no autorizado de tu cuenta
            </li>
          </ul>

          <h2 className={styles.subtitulo}>4. Uso Aceptable</h2>
          <p className={styles.texto}>
            Te comprometes a NO utilizar RentManager para:
          </p>
          <ul className={styles.lista}>
            <li>Actividades ilegales o fraudulentas</li>
            <li>Violar derechos de propiedad intelectual</li>
            <li>Distribuir malware o contenido dañino</li>
            <li>Intentar acceder a sistemas sin autorización</li>
            <li>Suplantar identidades o proporcionar información falsa</li>
          </ul>

          <h2 className={styles.subtitulo}>5. Propiedad Intelectual</h2>
          <p className={styles.texto}>
            Todos los derechos de propiedad intelectual sobre RentManager,
            incluyendo software, diseño, contenido y marca, pertenecen
            exclusivamente a RentManager y están protegidos por las leyes de
            propiedad intelectual aplicables.
          </p>

          <h2 className={styles.subtitulo}>
            6. Privacidad y Protección de Datos
          </h2>
          <p className={styles.texto}>
            El uso de tus datos personales está regulado por nuestra Política de
            Privacidad. Al utilizar RentManager, aceptas el tratamiento de tus
            datos conforme a dicha política.
          </p>

          <h2 className={styles.subtitulo}>7. Facturación y Pagos</h2>
          <ul className={styles.lista}>
            <li>
              Los pagos se procesan de forma mensual o anual según el plan
              seleccionado
            </li>
            <li>Las renovaciones son automáticas salvo cancelación previa</li>
            <li>
              No se realizan reembolsos parciales por cancelaciones anticipadas
            </li>
            <li>Los precios pueden modificarse con 30 días de anticipación</li>
          </ul>

          <h2 className={styles.subtitulo}>8. Cancelación y Suspensión</h2>
          <p className={styles.texto}>
            RentManager se reserva el derecho de suspender o cancelar cuentas
            que violen estos términos. Los usuarios pueden cancelar su
            suscripción en cualquier momento desde el panel de configuración.
          </p>

          <h2 className={styles.subtitulo}>9. Limitación de Responsabilidad</h2>
          <p className={styles.texto}>
            RentManager no será responsable por daños indirectos, incidentales o
            consecuentes derivados del uso o imposibilidad de uso de la
            plataforma. Nuestro servicio se proporciona "tal cual" sin garantías
            de ningún tipo.
          </p>

          <h2 className={styles.subtitulo}>10. Modificaciones</h2>
          <p className={styles.texto}>
            RentManager se reserva el derecho de modificar estos términos en
            cualquier momento. Los cambios significativos serán notificados con
            al menos 15 días de anticipación.
          </p>

          <h2 className={styles.subtitulo}>11. Ley Aplicable</h2>
          <p className={styles.texto}>
            Estos términos se rigen por las leyes de la República de Colombia.
            Cualquier disputa se resolverá en los tribunales competentes de
            Bogotá D.C.
          </p>

          <div className={styles.contacto}>
            <h3>Contacto Legal</h3>
            <p>Para consultas sobre estos términos:</p>
            <p>
              <strong>legal@rentmanager.com</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terminos;
