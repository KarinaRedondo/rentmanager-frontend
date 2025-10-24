import React, { useState } from "react";
import Header from "../..";
import Footer from "../../../Footer";
import styles from "./Perfil.module.css";

const Perfil: React.FC = () => {
  const usuarioInicial = JSON.parse(localStorage.getItem("usuario") || "{}");
  
  const [usuario, setUsuario] = useState(usuarioInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEditados, setDatosEditados] = useState(usuarioInicial);

  // Activar modo edición
  const handleEditar = () => {
    setDatosEditados({ ...usuario });
    setModoEdicion(true);
  };

  // Cancelar edición
  const handleCancelar = () => {
    setDatosEditados({ ...usuario });
    setModoEdicion(false);
  };

  // Guardar cambios
  const handleGuardar = () => {
    // Aquí puedes hacer una llamada a tu API para actualizar los datos
    // Por ahora solo actualiza el localStorage y el estado
    localStorage.setItem("usuario", JSON.stringify(datosEditados));
    setUsuario(datosEditados);
    setModoEdicion(false);
    alert("Perfil actualizado correctamente");
  };

  // Manejar cambios en inputs
  const handleChange = (campo: string, valor: string) => {
    setDatosEditados({ ...datosEditados, [campo]: valor });
  };

  // Renderizar campo (modo lectura o edición)
  const renderField = (
    label: string,
    campo: string,
    value: string | null | undefined,
    isBadge: boolean = false,
    editable: boolean = true
  ) => {
    const displayValue = value || "No disponible";

    return (
      <>
        <dt className={styles.dt}>{label}</dt>
        <dd className={isBadge ? styles.ddBadge : modoEdicion && editable ? styles.ddEdit : styles.dd}>
          {modoEdicion && editable ? (
            <input
              type="text"
              className={styles.input}
              value={datosEditados[campo] || ""}
              onChange={(e) => handleChange(campo, e.target.value)}
            />
          ) : isBadge ? (
            <span className={value ? styles.badgeContent : styles.badgeEmpty}>
              {value ? displayValue.toUpperCase() : "NO DISPONIBLE"}
            </span>
          ) : (
            displayValue
          )}
        </dd>
      </>
    );
  };

  return (
    <>
      <Header />
      <main className={styles.perfilMain}>
        <section className={styles.perfilCard}>
          <div className={styles.header}>
            <h2 className={styles.title}>Mi Perfil</h2>
            <div className={styles.acciones}>
              {!modoEdicion ? (
                <button className={styles.btnEditar} onClick={handleEditar}>
                  Editar
                </button>
              ) : (
                <>
                  <button className={styles.btnGuardar} onClick={handleGuardar}>
                    Guardar
                  </button>
                  <button className={styles.btnCancelar} onClick={handleCancelar}>
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          <dl className={styles.infoList}>
            {renderField("Nombre:", "nombre", usuario.nombre, false, true)}
            {renderField("Apellido:", "apellido", usuario.apellido, false, true)}
            {renderField("Correo:", "correo", usuario.correo, false, true)}
            {renderField("Teléfono:", "telefono", usuario.telefono, false, true)}
            {renderField("Rol:", "rol", usuario.rol, true, false)}
            {renderField("Estado:", "estado", usuario.estado, true, false)}
            {renderField("Tipo documento:", "tipo de documento", usuario["tipo de documento"], false, false)}
            {renderField("Número de documento:", "numero de documento", usuario["numero de documento"], false, false)}
            {renderField("Fecha de registro:", "fecha de registro", usuario["fecha de registro"], false, false)}
          </dl>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Perfil;
