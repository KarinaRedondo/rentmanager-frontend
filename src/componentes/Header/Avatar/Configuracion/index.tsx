import React, { useState } from "react";
import Header from "../..";
import Footer from "../../../Footer";
import styles from "./Configuracion.module.css";

const Configuracion: React.FC = () => {
  // Estados para las configuraciones
  const [notificaciones, setNotificaciones] = useState(true);
  const [notificacionesEmail, setNotificacionesEmail] = useState(true);
  const [temaOscuro, setTemaOscuro] = useState(false);
  const [idioma, setIdioma] = useState("es");
  const [guardando, setGuardando] = useState(false);

  // Guardar configuración
  const handleGuardar = async () => {
    setGuardando(true);
    
    // Simular guardado (aquí conectarías con tu API)
    setTimeout(() => {
      const config = {
        notificaciones,
        notificacionesEmail,
        temaOscuro,
        idioma,
      };
      localStorage.setItem("configuracion", JSON.stringify(config));
      setGuardando(false);
      alert("Configuración guardada correctamente");
    }, 800);
  };

  return (
    <>
      <Header />
      <main className={styles.configMain}>
        <section className={styles.configCard}>
          <div className={styles.header}>
            <h2 className={styles.title}>Configuración</h2>
          </div>

          {/* Sección: Notificaciones */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notificaciones</h3>
            <div className={styles.configItem}>
              <div className={styles.configLabel}>
                <span className={styles.labelText}>Notificaciones push</span>
                <span className={styles.labelDesc}>
                  Recibe notificaciones en tiempo real
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notificaciones}
                  onChange={() => setNotificaciones(!notificaciones)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.configItem}>
              <div className={styles.configLabel}>
                <span className={styles.labelText}>Notificaciones por correo</span>
                <span className={styles.labelDesc}>
                  Recibe resúmenes y alertas por email
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={notificacionesEmail}
                  onChange={() => setNotificacionesEmail(!notificacionesEmail)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {/* Sección: Apariencia */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Apariencia</h3>
            <div className={styles.configItem}>
              <div className={styles.configLabel}>
                <span className={styles.labelText}>Tema oscuro</span>
                <span className={styles.labelDesc}>
                  Activa el modo oscuro para reducir la fatiga visual
                </span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={temaOscuro}
                  onChange={() => setTemaOscuro(!temaOscuro)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {/* Sección: Idioma */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Idioma</h3>
            <div className={styles.configItem}>
              <div className={styles.configLabel}>
                <span className={styles.labelText}>Idioma de la interfaz</span>
                <span className={styles.labelDesc}>
                  Selecciona el idioma de tu preferencia
                </span>
              </div>
              <select
                className={styles.select}
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className={styles.actions}>
            <button
              className={styles.btnGuardar}
              onClick={handleGuardar}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Configuracion;

