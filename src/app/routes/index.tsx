import { Navigate, Outlet } from "react-router-dom";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";

interface ProtectedRouteProps {
  allowedRoles: TipoUsuario[];
  usuario: {
    rol: TipoUsuario; // Cambiado de tipoUsuario a rol
  } | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, usuario }) => {
  console.log("🔐 Validando acceso:", { allowedRoles, usuario });

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(usuario.rol)) {
    console.warn("⛔ Acceso denegado. Rol:", usuario.rol);
    return <Navigate to="/" replace />;
  }

  console.log("✅ Acceso permitido:", usuario.rol);
  return <Outlet />;
};

export default ProtectedRoute;