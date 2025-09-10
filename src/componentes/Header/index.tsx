"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./Header.module.css";
import type { Usuario } from "../../modelos/types/Usuario";
import { useNavigate, useLocation } from "react-router-dom";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";

const Header = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUsuario = localStorage.getItem("usuario");
    if (storedUsuario) {
      setUsuario(JSON.parse(storedUsuario));
    }
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMostrarMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("Usuario");
    setMostrarMenu(false);
    navigate("/");
  };

  const navegarA = (ruta: string) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

 const obtenerRutasNavegacion = () => {
  if (!usuario) return [];

  const rutasBase = [{ label: "Inicio", ruta: "/", icon: "🏠" }];

  switch (usuario.tipoUsuario) {
    case TipoUsuario.ADMINISTRADOR:
      return [
        ...rutasBase,
        { label: "Gestión Usuarios", ruta: "/administrador/usuarios", icon: "👥" },
        { label: "Reportes", ruta: "/administrador/reportes", icon: "📊" },
      ];
    case TipoUsuario.PROPIETARIO:
      return [
        ...rutasBase,
        { label: "Mis Propiedades", ruta: "/propietario/propiedades", icon: "🏠" },
        { label: "Contratos", ruta: "/propietario/contratos", icon: "📜" },
      ];
    case TipoUsuario.INQUILINO:
      return [
        ...rutasBase,
        { label: "Propiedades Disponibles", ruta: "/inquilino/propiedades", icon: "🏘️" },
        { label: "Mis Pagos", ruta: "/inquilino/pagos", icon: "💳" },
      ];
    case TipoUsuario.CONTADOR:
      return [
        ...rutasBase,
        { label: "Pagos", ruta: "/contador/pagos", icon: "💰" },
        { label: "Reportes Financieros", ruta: "/contador/reportes", icon: "📑" },
      ];
    default:
      return rutasBase;
  }
};

  const rutasNavegacion = obtenerRutasNavegacion();

  const obtenerIniciales = (nombre: string, apellido?: string) => {
    const inicial1 = nombre?.charAt(0).toUpperCase() || "U";
    const inicial2 = apellido?.charAt(0).toUpperCase() || "";
    return inicial1 + inicial2;
  };

  const obtenerTipoUsuarioLabel = (tipo: TipoUsuario) => {
  switch (tipo) {
    case TipoUsuario.ADMINISTRADOR:
      return "Administrador";
    case TipoUsuario.PROPIETARIO:
      return "Propietario";
    case TipoUsuario.INQUILINO:
      return "Inquilino";
    case TipoUsuario.CONTADOR:
      return "Contador";
    default:
      return "Usuario";
  }
};

  return (
    <header className={styles.header}>
      <div className={styles.header_container}>
        {/* Logo */}
        <div className={styles.logo_section}>
          <div className={styles.logo} onClick={() => navegarA("/")}>
            <span className={styles.logo_text}>
              <span className={styles.logo_highlight}>Tiend</span>app
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className={styles.navigation}>
          {rutasNavegacion.map((item) => (
            <button
              key={item.ruta}
              className={`${styles.nav_item} ${
                location.pathname === item.ruta ? styles.nav_active : ""
              }`}
              onClick={() => navegarA(item.ruta)}
            >
              <span className={styles.nav_icon}>{item.icon}</span>
              <span className={styles.nav_label}>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Usuario */}
        {usuario ? (
          <div className={styles.user_section} ref={menuRef}>
            <div className={styles.user_info}>
              <span className={styles.user_name}>{usuario.nombre}</span>
              <span className={styles.user_type}>
                {obtenerTipoUsuarioLabel(usuario.tipoUsuario)}
              </span>
            </div>
            <button
              className={styles.avatar}
              onClick={() => setMostrarMenu(!mostrarMenu)}
            >
              {obtenerIniciales(usuario.nombre, usuario.apellido)}
            </button>

            {mostrarMenu && (
              <div className={styles.dropdown_menu}>
                <div className={styles.menu_header}>
                  <div className={styles.menu_avatar}>
                    {obtenerIniciales(usuario.nombre, usuario.apellido)}
                  </div>
                  <div className={styles.menu_user_info}>
                    <span className={styles.menu_name}>
                      {usuario.nombre} {usuario.apellido}
                    </span>
                    <span className={styles.menu_email}>{usuario.correo}</span>
                    <span className={styles.menu_type}>
                      {obtenerTipoUsuarioLabel(usuario.tipoUsuario)}
                    </span>
                  </div>
                </div>

                <div className={styles.menu_divider}></div>
                <div className={styles.menu_divider}></div>

                <button
                  className={`${styles.menu_item} ${styles.logout_item}`}
                  onClick={cerrarSesion}
                >
                  <span className={styles.menu_icon}>🚪</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.auth_buttons}>
            <button className={styles.login_btn} onClick={() => navegarA("/")}>
              Iniciar Sesión
            </button>
            <button
              className={styles.register_btn}
              onClick={() => navegarA("/registrarse")}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;