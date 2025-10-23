import React from "react";
import styles from "./TablaBase.module.css";

interface Columna {
  key: string;
  label: string;
  render?: (valor: any, fila: any) => React.ReactNode;
}

interface Props {
  columnas: Columna[];
  datos: any[];
  onEditar?: (fila: any) => void;
  onEliminar?: (fila: any) => void;
  
}

export const TablaBase: React.FC<Props> = ({
  columnas,
  datos,
  onEditar,
  onEliminar,
}) => {
  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {(onEditar || onEliminar) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan={columnas.length + 1} className={styles.sinDatos}>
                No hay registros disponibles
              </td>
            </tr>
          ) : (
            datos.map((fila, i) => (
              <tr key={i}>
                {columnas.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(fila[col.key], fila) : fila[col.key]}
                  </td>
                ))}
                {(onEditar || onEliminar) && (
                  <td className={styles.acciones}>
                    {onEditar && (
                      <button
                        className={styles.botonEditar}
                        onClick={() => onEditar(fila)}
                      >
                        Editar
                      </button>
                    )}
                    {onEliminar && (
                      <button
                        className={styles.botonEliminar}
                        onClick={() => onEliminar(fila)}
                      >
                        Cambiar Estado
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};