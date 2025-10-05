import { type Dispatch, type SetStateAction } from "react";
import styles from "./Modal.module.css";

interface PropsModal {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  nombreModal: string;
  children: React.ReactNode;
  guardar: () => void;
  recomendaciones?: string[]; // Opcional
}

export const ModalComponente = ({
  openModal,
  setOpenModal,
  nombreModal,
  children,
  guardar,
  recomendaciones = [],
}: PropsModal) => {
  const cerrarModal = () => {
    setOpenModal(false);
  };

  if (!openModal) return null;

  return (
    <div className={styles.contenedorModal}>
      <div className={styles.modal}>
        <div className={styles.headerModal}>
          <h2>{nombreModal}</h2>
          <button className={styles.boton__x} onClick={cerrarModal}>
            X
          </button>
        </div>
        <div className={styles.contenido}>
          {children}

          {recomendaciones.length > 0 && (
            <div className={styles.recomendaciones}>
              <h3>Recomendaciones:</h3>
              <ul>
                {recomendaciones.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.boton__cancelar} onClick={cerrarModal}>
            Cancelar
          </button>
          <button className={styles.boton__guardar} onClick={guardar}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
