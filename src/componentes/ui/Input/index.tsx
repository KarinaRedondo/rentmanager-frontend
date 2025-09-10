import React, { useState, type Dispatch, type SetStateAction } from "react";
import styles from "./InputCustom.module.css";
import { Eye, EyeOff } from "react-feather";

interface InputCustomProps {
  value: string | number;
  setValue: Dispatch<SetStateAction<string>>;
  type?: "text" | "password" | "email" | "number" | "date";
  placeholder?: string;
  title?: string;
}

const InputCustom = ({
  value,
  setValue,
  type = "text",
  placeholder,
  title,
}: InputCustomProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={styles.container}>
      <span>{title}</span>
      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword((show) => !show)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputCustom;