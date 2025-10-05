import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./vistas/Inicio";
import Login from "./vistas/Login";
import Usuarios from "./vistas/Administrador/Usuarios";
import VistaContratos from "./vistas/Administrador/Contratos";
import VistaPropiedades from "./vistas/Inquilino/Propiedad";
import Pagos from "./vistas/Inquilino/Pagos";
import ProtectedRoute from "./app/routes";
import { TipoUsuario } from "./modelos/enumeraciones/tipoUsuario"; 
// ⚡ Ejemplo: usuario logueado (simulado)
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
          <Route path="/administrador/usuarios" element={<Usuarios />} />
          <Route path="/administrador/contratos" element={<VistaContratos />} />
        </Route>

        {/* INQUILINO */}
        <Route element={<ProtectedRoute allowedRoles={[TipoUsuario.INQUILINO]} usuario={usuario} />}>
          <Route path="/inquilino/propiedades" element={<VistaPropiedades />} />
          <Route path="/inquilino/pagos" element={<Pagos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
