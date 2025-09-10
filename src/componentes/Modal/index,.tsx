import { type Dispatch, type SetStateAction } from "react";
import styles from "./Modal.module.css";

interface PropsModal {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  nombreModal: string;
  children: React.ReactNode;
  guardar: () => void;
}

export const ModalComponente = ({
  openModal,
  setOpenModal,
  nombreModal,
  children,
  guardar,
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
        </div>
        <div className={styles.contenido}>{children}</div>
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
