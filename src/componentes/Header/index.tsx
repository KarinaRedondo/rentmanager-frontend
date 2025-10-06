import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Header.module.css";
import { Globe, Layers, User, Settings, LogOut } from "react-feather";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMINISTRADOR" | "PROPIETARIO" | "INQUILINO" | "CONTADOR";
}

const Header: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUsuario = localStorage.getItem("usuario");

    if (storedUsuario) {
      try {
        const parsedUsuario = JSON.parse(storedUsuario);
        setUsuario(parsedUsuario);
      } catch (error) {
        console.error("Error al parsear usuario de localStorage:", error);
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  }, []);

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
    localStorage.removeItem("usuario");
    setMostrarMenu(false);
    navigate("/");
  };

  const navegarA = (ruta: string) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

  const obtenerRutasNavegacion = () => {
    // Si no hay usuario o estamos en login, mostrar menú de inicio de sesión
    if (!usuario || location.pathname === "/login") {
      return [
        { nombre: "Inicio", ruta: "/" },
        { nombre: "Iniciar Sesión", ruta: "/login" },
        { nombre: "Quiénes Somos", ruta: "/nosotros" },
        { nombre: "Contacto", ruta: "/contacto" },
      ];
    }

    switch (usuario.rol) {
      case "ADMINISTRADOR":
        return [
          { nombre: "Dashboard", ruta: "/administrador/dashboard" },
        ];
      case "PROPIETARIO":
        return [
          { nombre: "Dashboard", ruta: "/propietario/dashboard" },
        ];
      case "INQUILINO":
        return [
          { nombre: "Tablero", ruta: "/inquilino/tablero" },
        ];
      case "CONTADOR":
        return [
          { nombre: "Panel", ruta: "/contador/panel" },
        ];
      default:
        return [];
    }
  };

  const obtenerIniciales = (nombre: string) => {
    return nombre
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const opcionesMenu = obtenerRutasNavegacion();

  // Determinar si estamos en la vista de inicio
  const esInicio = location.pathname === "/";
  // Determinar si estamos en login
  const esLogin = location.pathname === "/login";

  return (
    <header
      className={
        esInicio
          ? styles.headerInicio
          : esLogin
          ? `${styles.headerInicio} ${styles.loginHeader}`
          : styles.encabezado
      }
      ref={menuRef}
    >
      <div className={styles.logo}>
        {esInicio || esLogin ? (
          <Layers size={28} color="#2563eb" />
        ) : (
          <Globe size={28} color="#2563eb" />
        )}
      </div>

      {/* Caso: Inicio y Login */}
      {(esInicio || esLogin) && (
        <nav className={styles.menuInicio}>
          <ul>
            <li>
              <a
                href="/"
                className={location.pathname === "/" ? styles.active : ""}
              >
                Inicio
              </a>
            </li>
            <li>
              <a
                href="/login"
                className={location.pathname === "/login" ? styles.active : ""}
              >
                Iniciar Sesión
              </a>
            </li>
            <li>
              <a
                href="/nosotros"
                className={
                  location.pathname === "/nosotros" ? styles.active : ""
                }
              >
                Quiénes Somos
              </a>
            </li>
            <li>
              <a
                href="/contacto"
                className={
                  location.pathname === "/contacto" ? styles.active : ""
                }
              >
                Contacto
              </a>
            </li>
          </ul>
        </nav>
      )}

      {/* Caso: Usuario logueado */}
      {!esInicio && !esLogin && usuario && (
        <>
          <nav className={styles.menu}>
            <ul>
              {opcionesMenu.map((opcion, index) => (
                <li
                  key={index}
                  className={
                    location.pathname === opcion.ruta ? styles.activo : ""
                  }
                  onClick={() => navegarA(opcion.ruta)}
                >
                  {opcion.nombre}
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.userSection}>
            <div
              className={styles.avatar}
              onClick={() => setMostrarMenu(!mostrarMenu)}
            >
              {usuario.nombre ? (
                obtenerIniciales(usuario.nombre)
              ) : (
                <User size={20} />
              )}
            </div>

            {mostrarMenu && (
              <div className={styles.dropdownMenu}>
                <div className={styles.menuHeader}>
                  <div className={styles.menuAvatar}>
                    {usuario.nombre ? (
                      obtenerIniciales(usuario.nombre)
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className={styles.menuUserInfo}>
                    <div className={styles.menuName}>
                      {usuario.nombre || "Usuario"}
                    </div>
                    <div className={styles.menuEmail}>{usuario.email}</div>
                    <div className={styles.menuType}>{usuario.rol}</div>
                  </div>
                </div>

                <div className={styles.menuDivider}></div>

                <div className={styles.menuItems}>
                  <button
                    className={styles.menuItem}
                    onClick={() => navegarA("/perfil")}
                  >
                    <User size={16} className={styles.menuIcon} />
                    Mi Perfil
                  </button>

                  <button
                    className={styles.menuItem}
                    onClick={() => navegarA("/configuracion")}
                  >
                    <Settings size={16} className={styles.menuIcon} />
                    Configuración
                  </button>

                  <div className={styles.menuDivider}></div>

                  <button
                    className={`${styles.menuItem} ${styles.logoutItem}`}
                    onClick={cerrarSesion}
                  >
                    <LogOut size={16} className={styles.menuIcon} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
