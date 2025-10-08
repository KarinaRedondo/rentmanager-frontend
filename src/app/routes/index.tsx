import { Navigate, Outlet } from "react-router-dom";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";

interface ProtectedRouteProps {
  allowedRoles: TipoUsuario[];
  usuario: {
    rol: TipoUsuario;
  } | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, usuario }) => {
  console.log("🔐 [ProtectedRoute] Validando acceso:", { 
    allowedRoles, 
    usuario,
    usuarioCompleto: JSON.stringify(usuario)
  });

  if (!usuario) {
    console.log("❌ [ProtectedRoute] No hay usuario, redirigiendo a login");
    return <Navigate to="/login" replace />;
  }

  console.log("🔐 [ProtectedRoute] Rol del usuario:", usuario.rol);
  console.log("🔐 [ProtectedRoute] Roles permitidos:", allowedRoles);

  if (!allowedRoles.includes(usuario.rol)) {
    console.warn("⛔ [ProtectedRoute] Acceso denegado. Rol del usuario:", usuario.rol, "No está en:", allowedRoles);
    return <Navigate to="/" replace />;
  }

  console.log("✅ [ProtectedRoute] Acceso permitido:", usuario.rol);
  return <Outlet />;
};

export default ProtectedRoute;