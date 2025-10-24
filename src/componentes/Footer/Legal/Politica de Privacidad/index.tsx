import Header from "../../../Header";
import Footer from "../..";
import styles from "./PoliticaDePrivacidad.module.css";

const Privacidad = () => {
  return (
    <>
      <Header />
      <div className={styles.pagina}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <h1 className={styles.titulo}>Política de Privacidad</h1>
            <p className={styles.descripcion}>
              Última actualización: Enero 2025
            </p>
          </div>

          <div className={styles.seccion}>
            <p className={styles.texto}>
              En RentManager nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política 
              explica qué información recopilamos, cómo la utilizamos y tus derechos sobre ella.
            </p>
          </div>

          <h2 className={styles.subtitulo}>1. Información que Recopilamos</h2>
          
          <div className={styles.tarjeta}>
            <h3>Información de Registro</h3>
            <p>
              Nombre, correo electrónico, número de teléfono, documento de identidad, información de 
              pago y datos relacionados con tu actividad inmobiliaria.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>Información de Uso</h3>
            <p>
              Direcciones IP, tipo de navegador, páginas visitadas, tiempo de uso, interacciones con 
              la plataforma y datos de dispositivos.
            </p>
          </div>

          <div className={styles.tarjeta}>
            <h3>Información de Propiedades</h3>
            <p>
              Datos de propiedades, contratos, facturas, pagos y documentos asociados a la gestión 
              inmobiliaria.
            </p>
          </div>

          <h2 className={styles.subtitulo}>2. Cómo Utilizamos tu Información</h2>
          <ul className={styles.lista}>
            <li>Proporcionar y mejorar nuestros servicios</li>
            <li>Procesar transacciones y pagos</li>
            <li>Enviar notificaciones importantes sobre tu cuenta</li>
            <li>Personalizar tu experiencia en la plataforma</li>
            <li>Cumplir con obligaciones legales y fiscales</li>
            <li>Prevenir fraudes y garantizar la seguridad</li>
            <li>Realizar análisis y mejoras del servicio</li>
          </ul>

          <h2 className={styles.subtitulo}>3. Compartir Información</h2>
          <p className={styles.texto}>
            NO vendemos tu información personal a terceros. Compartimos información únicamente en 
            estas circunstancias:
          </p>
          <ul className={styles.lista}>
            <li>Con tu consentimiento explícito</li>
            <li>Con proveedores de servicios (procesadores de pago, hosting)</li>
            <li>Cuando sea requerido por ley o autoridades competentes</li>
            <li>Para proteger nuestros derechos legales</li>
          </ul>

          <h2 className={styles.subtitulo}>4. Seguridad de los Datos</h2>
          <p className={styles.texto}>
            Implementamos medidas de seguridad técnicas y organizativas apropiadas:
          </p>
          <ul className={styles.lista}>
            <li>Encriptación SSL/TLS en todas las comunicaciones</li>
            <li>Autenticación de dos factores opcional</li>
            <li>Copias de seguridad automáticas diarias</li>
            <li>Monitoreo continuo de seguridad</li>
            <li>Acceso restringido a datos sensibles</li>
            <li>Cumplimiento con estándares ISO 27001</li>
          </ul>

          <h2 className={styles.subtitulo}>5. Tus Derechos</h2>
          <p className={styles.texto}>
            Conforme a la legislación colombiana de protección de datos (Ley 1581 de 2012), tienes 
            derecho a:
          </p>
          <ul className={styles.lista}>
            <li>Acceder a tu información personal</li>
            <li>Rectificar datos inexactos o incompletos</li>
            <li>Solicitar la eliminación de tus datos</li>
            <li>Revocar autorizaciones otorgadas</li>
            <li>Oponerte al tratamiento de datos</li>
            <li>Solicitar la portabilidad de tus datos</li>
          </ul>

          <h2 className={styles.subtitulo}>6. Cookies y Tecnologías Similares</h2>
          <p className={styles.texto}>
            Utilizamos cookies para mejorar tu experiencia, analizar el uso de la plataforma y 
            recordar tus preferencias. Puedes configurar tu navegador para rechazar cookies, aunque 
            esto puede afectar la funcionalidad de RentManager.
          </p>

          <h2 className={styles.subtitulo}>7. Retención de Datos</h2>
          <p className={styles.texto}>
            Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario 
            para cumplir con obligaciones legales. Los datos pueden ser archivados conforme a 
            requisitos fiscales y legales aplicables.
          </p>

          <h2 className={styles.subtitulo}>8. Transferencias Internacionales</h2>
          <p className={styles.texto}>
            Tus datos pueden ser almacenados y procesados en servidores ubicados fuera de Colombia. 
            Garantizamos que estos proveedores cumplen con estándares adecuados de protección de datos.
          </p>

          <h2 className={styles.subtitulo}>9. Menores de Edad</h2>
          <p className={styles.texto}>
            RentManager no está dirigido a menores de 18 años. No recopilamos intencionalmente 
            información de menores. Si detectamos información de un menor, la eliminaremos de inmediato.
          </p>

          <h2 className={styles.subtitulo}>10. Cambios a esta Política</h2>
          <p className={styles.texto}>
            Nos reservamos el derecho de modificar esta política en cualquier momento. Los cambios 
            significativos serán notificados por correo electrónico y/o mediante aviso en la plataforma.
          </p>

          <div className={styles.contacto}>
            <h3>Contacto sobre Privacidad</h3>
            <p>Oficial de Protección de Datos</p>
            <p><strong>privacidad@rentmanager.com</strong></p>
            <p>Para ejercer tus derechos o realizar consultas sobre privacidad</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacidad;
