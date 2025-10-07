import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./vistas/Inicio";
import Login from "./vistas/Login";
import ProtectedRoute from "./app/routes";
import { TipoUsuario } from "./modelos/enumeraciones/tipoUsuario"; 
import AdminDashboard from "./vistas/Administrador";
import Usuarios from "./vistas/Administrador/Usuarios";
import Propiedades from "./vistas/Administrador/Propiedades";
const usuario = {
  tipoUsuario: TipoUsuario.ADMINISTRADOR, // cámbialo a INQUILINO para probar
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />

        {/* ADMINISTRADOR */}
        <Route element={<ProtectedRoute allowedRoles={[TipoUsuario.ADMINISTRADOR]} usuario={usuario} />}>
          <Route path="/administrador/dashboard" element={<AdminDashboard />} />
          <Route path="/administrador/usuarios" element={<Usuarios />} />
          <Route path="/administrador/propiedades" element={<Propiedades />} />
        </Route>

        {/* INQUILINO */}
        <Route element={<ProtectedRoute allowedRoles={[TipoUsuario.INQUILINO]} usuario={usuario} />}>
         
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
