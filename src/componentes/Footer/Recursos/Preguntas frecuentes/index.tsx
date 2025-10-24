import Header from "../../../Header";
import Footer from "../..";
import styles from "./PreguntasFrecuentes.module.css";

const FAQ = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Preguntas Frecuentes</h1>
            <p className={styles.descripcion}>
              Respuestas rápidas a las consultas más comunes
            </p>
          </div>

          <h2 className={styles.subtitulo}>General</h2>

          <div className={styles.tarjeta}>
            <h3>¿Qué es RentManager?</h3>
            <p>
              RentManager es una plataforma integral de gestión de propiedades en arriendo que conecta 
              propietarios, inquilinos, administradores y contadores en un único sistema digital, 
              facilitando todos los procesos relacionados con el alquiler de inmuebles.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>¿Necesito conocimientos técnicos para usar RentManager?</h3>
            <p>
              No. RentManager está diseñado con una interfaz intuitiva y fácil de usar. Cualquier persona 
              con conocimientos básicos de navegación web puede utilizar la plataforma sin problemas.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Cuenta y Seguridad</h2>

          <div className={styles.tarjeta}>
            <h3>¿Es seguro RentManager?</h3>
            <p>
              Sí. Utilizamos encriptación SSL de nivel bancario, autenticación de dos factores y cumplimos 
              con estándares internacionales de seguridad (ISO 27001). Tus datos están protegidos con los 
              más altos niveles de seguridad.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>¿Puedo cambiar de plan en cualquier momento?</h3>
            <p>
              Sí. Puedes actualizar o cambiar tu plan en cualquier momento desde el panel de configuración. 
              Los cambios se aplican de inmediato y se ajusta la facturación proporcionalmente.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Facturación y Pagos</h2>

          <div className={styles.tarjeta}>
            <h3>¿Qué métodos de pago aceptan?</h3>
            <p>
              Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express), PSE, 
              transferencias bancarias y pagos por PayU. Para planes empresariales ofrecemos 
              facturación directa.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>¿Hay costos ocultos o cargos adicionales?</h3>
            <p>
              No. El precio que ves es el precio que pagas. No hay cargos ocultos, tarifas de instalación 
              ni costos adicionales sorpresa. Todo está incluido en tu plan mensual.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Funcionalidades</h2>

          <div className={styles.tarjeta}>
            <h3>¿Puedo gestionar múltiples propiedades?</h3>
            <p>
              Sí. Dependiendo de tu plan, puedes gestionar desde 5 hasta propiedades ilimitadas. 
              El Plan Empresarial no tiene límite de propiedades.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>¿Los inquilinos pueden pagar en línea?</h3>
            <p>
              Sí. RentManager integra pasarelas de pago seguras para que los inquilinos puedan realizar 
              pagos en línea de forma rápida y segura, con confirmación automática.
            </p>
          </div>

          <h2 className={styles.subtitulo}>Soporte</h2>

          <div className={styles.tarjeta}>
            <h3>¿Ofrecen capacitación o onboarding?</h3>
            <p>
              Sí. Todos los clientes reciben un proceso de onboarding guiado. Los clientes empresariales 
              cuentan con capacitación personalizada y un gestor de cuenta dedicado.
            </p>
          </div>

          <div className={styles.contacto}>
            <h3>¿No encontraste tu respuesta?</h3>
            <p>Contáctanos y te ayudaremos</p>
            <p><strong>soporte@rentmanager.com</strong></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ;
