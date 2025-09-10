import React from "react";
import style from "./Boton.module.css";

interface Props {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; 
}

export const BotonComponente = ({label, onClick }: Props) => {
  return (
    <div className={style.Boton}>
      <button onClick={onClick}>{label}</button>
    </div>
  );
};