import { Navigate, Outlet } from "react-router-dom";
import { TipoUsuario
  
 } from "../../modelos/enumeraciones/tipoUsuario"; 
interface ProtectedRouteProps {
  allowedRoles: TipoUsuario[];
  usuario: {
    tipoUsuario: TipoUsuario;
  } | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, usuario }) => {
  console.log("🔐 Validando acceso:", { allowedRoles, usuario });

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(usuario.tipoUsuario)) {
    console.warn("⛔ Acceso denegado. Rol:", usuario.tipoUsuario);
    return <Navigate to="/" replace />;
  }

  console.log("✅ Acceso permitido:", usuario.tipoUsuario);
  return <Outlet />;
};

export default ProtectedRoute;


