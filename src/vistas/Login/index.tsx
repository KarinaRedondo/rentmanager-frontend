import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../servicios/login";
import InputCustom from "../../componentes/ui/Input";
import { BotonComponente } from "../../componentes/ui/Boton";
import Header from "../../componentes/Header";
import Footer from "../../componentes/Footer";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!correo || !contrasena) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      const data = await AuthService.iniciarSesion(correo, contrasena);
      const { token, usuario } = data;

      console.log("Token recibido:", token);
      console.log("Usuario recibido:", usuario);

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Redirigir según rol del usuario
      switch (usuario.rol) {
        case "ADMINISTRADOR":
          navigate("/administrador/dashboard");
          break;
        case "PROPIETARIO":
          navigate("/propietario/dashboard");
          break;
        case "INQUILINO":
          navigate("/inquilino/tablero");
          break;
        case "CONTADOR":
          navigate("/contador/panel");
          break;
        default:
          navigate("/");
      }
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err);
      if (err.response && err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Correo o contraseña incorrectos");
      }
    }
  };

  return (
    <div className={styles.login}>
      <Header />
      <main className={styles.main}>
        <div className={styles.formulario}>
          <h2>Iniciar Sesión en RentManager</h2>
          <p className={styles.subtitulo}>
            Ingrese sus credenciales para acceder a su cuenta.
          </p>

          <InputCustom
            value={correo}
            setValue={setCorreo}
            type="email"
            placeholder="Correo electrónico"
            title="Correo"
          />

          <InputCustom
            value={contrasena}
            setValue={setContrasena}
            type="password"
            placeholder="Contraseña"
            title="Contraseña"
          />

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.botonCustom}>
            <BotonComponente label="Ingresar" onClick={handleLogin} />
          </div>

          {/* Enlaces debajo del botón */}
          <div className={styles.enlaces}>
            <span
              className={styles.link}
              onClick={() => navigate("/recuperar-contraseña")}
            >
              ¿Olvidaste tu contraseña?
            </span>
            <span
              className={styles.link}
              onClick={() => navigate("/registro")}
            >
              ¿No tienes una cuenta? Regístrate
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
