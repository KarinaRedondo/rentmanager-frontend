import React from "react";
import style from "./Boton.module.css";

interface Props {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  small?: boolean;
  className?: string;
}

export const BotonComponente = ({
  label,
  onClick,
  disabled,
  small,
  className,
}: Props) => {
  return (
    <div className={style.Boton}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${style.base} ${small ? style.small : ""} ${
          className || ""
        }`}
      >
        {label}
      </button>
    </div>
  );
};
