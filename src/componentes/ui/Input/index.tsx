import React, { useState, type Dispatch, type SetStateAction } from "react";
import styles from "./InputCustom.module.css";
import { Eye, EyeOff } from "react-feather";

interface InputCustomProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  type?: "number" | "email" | "text" | "password" | "date" | "tel";
  placeholder?: string;
  title?: string;
  readOnly?: boolean;
}

const InputCustom: React.FC<InputCustomProps> = ({
  value,
  setValue,
  type = "text",
  placeholder,
  title,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={styles.container}>
      {title && <label className={styles.label}>{title}</label>}
      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete={
            type === "email"
              ? "email"
              : type === "password"
              ? "current-password"
              : "off"
          }
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword((s) => !s)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputCustom;
