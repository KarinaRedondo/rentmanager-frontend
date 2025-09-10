import React from "react";
import Header from "../Header";
import styles from "./ContenedorVistas.module.css";

interface Props {
  children: React.ReactNode;
}

const ContenedorVistas = ({ children }: Props) => {
  return (
    <>
      <Header />
      <div className={styles.contenedor__vistas}>{children}</div>
    </>
  );
};

export default ContenedorVistas;
