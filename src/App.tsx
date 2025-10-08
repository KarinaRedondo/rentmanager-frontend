import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./vistas/Inicio";
import Login from "./vistas/Login";
import ProtectedRoute from "./app/routes";
import { TipoUsuario } from "./modelos/enumeraciones/tipoUsuario";
import AdminDashboard from "./vistas/Administrador";
import PropietarioDashboard from "./vistas/Propietario";
import Propiedades from "./vistas/Administrador/Propiedades";
import Usuarios from "./vistas/Administrador/Usuarios";
import InquilinoDashboard from "./vistas/Inquilino";
import ContadorDashboard from "./vistas/Contador";

function App() {
  // Cargar usuario guardado en localStorage
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />

        {/* ADMINISTRADOR */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.ADMINISTRADOR]}
              usuario={usuario}
            />
          }
        >
          <Route path="/administrador/dashboard" element={<AdminDashboard />} />
           <Route path="/administrador/usuarios" element={<Usuarios />} />
           <Route path="/administrador/propiedades" element={<Propiedades />} />
        </Route>

        {/* PROPIETARIO */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.PROPIETARIO]}
              usuario={usuario}
            />
          }
        >
          <Route
            path="/propietario/dashboard"
            element={<PropietarioDashboard />}
          />
        </Route>

         {/* INQUILINO */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.INQUILINO]}
              usuario={usuario}
            />
          }
        >
          <Route
            path="/inquilino/dashboard"
            element={<InquilinoDashboard />}
          />
        </Route>

         {/* CONTADOR */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.CONTADOR]}
              usuario={usuario}
            />
          }
        >
          <Route
            path="/contador/dashboard"
            element={<ContadorDashboard />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;