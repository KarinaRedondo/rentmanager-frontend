import estilos from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={estilos.pie}>
      <div className={estilos.contenedor}>
        {/* Logo + descripción */}
        <div className={estilos.seccionLogo}>
          <div className={estilos.logo}>＊</div>
          <p>Gestión profesional de alquiler de propiedades.</p>
          <div className={estilos.redes}>
            <a href="#">🔗</a>
            <a href="#">🐦</a>
            <a href="#">📘</a>
          </div>
        </div>

        {/* Empresa */}
        <div>
          <h3>Empresa</h3>
          <ul>
            <li><a href="#">Acerca de Nosotros</a></li>
            <li><a href="#">Carreras</a></li>
            <li><a href="#">Prensa</a></li>
          </ul>
        </div>

        {/* Producto */}
        <div>
          <h3>Producto</h3>
          <ul>
            <li><a href="#">Características</a></li>
            <li><a href="#">Precios</a></li>
            <li><a href="#">Integraciones</a></li>
          </ul>
        </div>

        {/* Recursos */}
        <div>
          <h3>Recursos</h3>
          <ul>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Soporte</a></li>
            <li><a href="#">Preguntas Frecuentes</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3>Legal</h3>
          <ul>
            <li><a href="#">Términos de Servicio</a></li>
            <li><a href="#">Política de Privacidad</a></li>
          </ul>
        </div>
      </div>

      <div className={estilos.inferior}>
        <p>
          ¿Listo para gestionar tus propiedades?{" "}
          <a href="#">Comenzar</a>
        </p>
        <p>© 2025 RentManager. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;