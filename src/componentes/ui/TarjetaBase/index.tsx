// TarjetaBase.tsx
import React from "react";
import styles from "./TarjetaBase.module.css";
import { Home, FileText, DollarSign, AlertTriangle } from "react-feather";

interface Props {
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  icono?: "propiedad" | "contrato" | "pago" | "alerta";
  estado?: string;
  acciones?: React.ReactNode;
  children?: React.ReactNode;
}

export const TarjetaBase: React.FC<Props> = ({
  titulo,
  subtitulo,
  descripcion,
  icono = "propiedad",
  estado,
  acciones,
  children,
}) => {
  const Icono =
    icono === "contrato"
      ? FileText
      : icono === "pago"
      ? DollarSign
      : icono === "alerta"
      ? AlertTriangle
      : Home;

  return (
    <div className={styles.tarjeta}>
      <div className={styles.header}>
        <div className={styles.icono}>
          <Icono size={24} />
        </div>
        <div className={styles.titulos}>
          <h3>{titulo}</h3>
          {subtitulo && <span className={styles.subtitulo}>{subtitulo}</span>}
        </div>
        {estado && (
          <span className={`${styles.estado} ${styles[estado.toLowerCase()]}`}>
            {estado}
          </span>
        )}
      </div>

      {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
      {children && <div className={styles.contenido}>{children}</div>}
      {acciones && <div className={styles.acciones}>{acciones}</div>}
    </div>
  );
};
