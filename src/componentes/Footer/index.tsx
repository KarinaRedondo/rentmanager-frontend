import estilos from "./Footer.module.css";
import {
  Home,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  GitHub,
  Mail,
} from "react-feather";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className={estilos.pie}>
      <div className={estilos.contenedor}>
        {/* Logo + descripción */}
        <div className={estilos.seccionLogo}>
          <div className={estilos.logo}>
            <Home size={36} color="#2563eb" />
          </div>
          <p>Gestión profesional de alquiler de propiedades.</p>
          <div className={estilos.redes}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHub size={20} />
            </a>
            <a href="mailto:contacto@rentmanager.com">
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Empresa */}
        <div>
          <h3>Empresa</h3>
          <ul>
            <li>
              <Link to="/acerca">Acerca de Nosotros</Link>
            </li>
            <li>
              <Link to="/carreras">Carreras</Link>
            </li>
            <li>
              <Link to="/prensa">Prensa</Link>
            </li>
          </ul>
        </div>

        {/* Producto */}
        <div>
          <h3>Producto</h3>
          <ul>
            <li>
              <Link to="/caracteristicas">Características</Link>
            </li>
            <li>
              <Link to="/precios">Precios</Link>
            </li>
            <li>
              <Link to="/integraciones">Integraciones</Link>
            </li>
          </ul>
        </div>

        {/* Recursos */}
        <div>
          <h3>Recursos</h3>
          <ul>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/soporte">Soporte</Link>
            </li>
            <li>
              <Link to="/faq">Preguntas Frecuentes</Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3>Legal</h3>
          <ul>
            <li>
              <Link to="/terminos">Términos de Servicio</Link>
            </li>
            <li>
              <Link to="/privacidad">Política de Privacidad</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={estilos.inferior}>
        <p>
          ¿Listo para gestionar tus propiedades?{" "}
          <Link to="/login">Comenzar</Link>
        </p>
        <p>© 2025 RentManager. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
