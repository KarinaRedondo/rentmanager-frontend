import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { FileText, Home, DollarSign,  Search, ArrowRight, RefreshCw } from "react-feather";
import styles from "./SelectorReportes.module.css";

type TipoReporte = "contrato" | "propiedad" | "pago" | "factura";

interface OpcionReporte {
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  icono: React.ReactElement; 
  color: string;
}

const SelectorReportes: React.FC = () => {
  const navigate = useNavigate();
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("contrato");
  const [idRegistro, setIdRegistro] = useState<string>("");

  const usuarioString = localStorage.getItem("usuario");
  const usuario = JSON.parse(usuarioString || "{}");
  const rol = (usuario.rol || usuario.tipoUsuario || "").toLowerCase();

  const opcionesReporte: OpcionReporte[] = [
    {
      tipo: "contrato",
      titulo: "Contrato",
      descripcion: "Ver historial completo de un contrato con facturas y pagos",
      icono: <FileText size={32} />,
      color: "#3b82f6",
    },
    {
      tipo: "propiedad",
      titulo: "Propiedad",
      descripcion: "Ver información completa de una propiedad y sus contratos",
      icono: <Home size={32} />,
      color: "#10b981",
    },
    {
      tipo: "pago",
      titulo: "Pago",
      descripcion: "Detalles de un pago específico con factura y contrato asociado",
      icono: <DollarSign size={32} />,
      color: "#f59e0b",
    },
    {
      tipo: "factura",
      titulo: "Factura",
      descripcion: "Ver factura con pagos asociados y detalles del contrato",
      icono: <RefreshCw size={32} />,
      color: "#8b5cf6",
    },
  ];

  const generarReporte = () => {
    if (!idRegistro) {
      alert("⚠️ Por favor ingresa un ID válido");
      return;
    }

    const id = parseInt(idRegistro);
    if (isNaN(id) || id <= 0) {
      alert("⚠️ El ID debe ser un número mayor a 0");
      return;
    }

    const ruta = `/${rol}/reporte/${tipoReporte}/${idRegistro}`;
    navigate(ruta);
  };

  const opcionSeleccionada = opcionesReporte.find((op) => op.tipo === tipoReporte);

  return (
    <div className={styles.pagina}>
      <Header />
      <main className={styles.main}>
        <div className={styles.contenedor}>
          {/* Encabezado */}
          <div className={styles.encabezado}>
            <div className={styles.iconoHeader}>
              <Search size={48} />
            </div>
            <h1>Generar Reporte</h1>
            <p className={styles.subtitulo}>
              Selecciona el tipo de reporte que deseas consultar e ingresa el ID del registro
            </p>
          </div>

          {/* Opciones de Reporte */}
          <div className={styles.gridOpciones}>
            {opcionesReporte.map((opcion) => (
              <button
                key={opcion.tipo}
                onClick={() => setTipoReporte(opcion.tipo)}
                className={`${styles.tarjetaOpcion} ${tipoReporte === opcion.tipo ? styles.activa : ""}`}
                style={{
                  borderColor: tipoReporte === opcion.tipo ? opcion.color : "#e5e7eb",
                  background: tipoReporte === opcion.tipo
                    ? `linear-gradient(135deg, ${opcion.color}15 0%, ${opcion.color}05 100%)`
                    : "#ffffff",
                }}
              >
                <div
                  className={styles.iconoOpcion}
                  style={{
                    color: tipoReporte === opcion.tipo ? opcion.color : "#6b7280",
                  }}
                >
                  {opcion.icono}
                </div>
                <h3 className={styles.tituloOpcion}>{opcion.titulo}</h3>
                <p className={styles.descripcionOpcion}>{opcion.descripcion}</p>
                {tipoReporte === opcion.tipo && (
                  <div
                    className={styles.checkMarca}
                    style={{ backgroundColor: opcion.color }}
                  >
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Formulario */}
          <div className={styles.formulario}>
            <div className={styles.campoFormulario}>
              <label className={styles.label}>
                ID del {opcionSeleccionada?.titulo}
                <span className={styles.requerido}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  value={idRegistro}
                  onChange={(e) => setIdRegistro(e.target.value)}
                  placeholder="Ej: 1"
                  className={styles.input}
                  min="1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") generarReporte();
                  }}
                />
                <div
                  className={styles.inputIcono}
                  style={{ color: opcionSeleccionada?.color }}
                >
                  {opcionSeleccionada?.icono}
                </div>
              </div>
              <p className={styles.ayuda}>
                💡 Ingresa el identificador único del {opcionSeleccionada?.titulo.toLowerCase()} que deseas consultar
              </p>
            </div>

            <button
              onClick={generarReporte}
              className={styles.btnGenerar}
              style={{
                background: `linear-gradient(135deg, ${opcionSeleccionada?.color} 0%, ${opcionSeleccionada?.color}dd 100%)`,
              }}
            >
              <span>Generar Reporte</span>
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Información Adicional */}
          <div className={styles.infoAdicional}>
            <div className={styles.infoCard}>
              <FileText size={20} />
              <div>
                <h4>Reportes Detallados</h4>
                <p>Incluye historial completo de cambios y auditoría</p>
              </div>
            </div>
            <div className={styles.infoCard}>
              <DollarSign size={20} />
              <div>
                <h4>Exportación PDF</h4>
                <p>Descarga el reporte en formato PDF profesional</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SelectorReportes;
