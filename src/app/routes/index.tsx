import { Navigate, Outlet } from "react-router-dom";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";

// ========================================
// PROTECCIÓN DE RUTAS CON CONTROL DE ROLES
// ========================================
//
// Componente de seguridad que controla acceso a rutas según rol del usuario.
// Implementa validación de autenticación y autorización basada en roles (RBAC).
//
// PROPÓSITO:
// - Prevenir acceso no autorizado a páginas protegidas.
// - Validar que usuario esté autenticado antes de acceder a rutas privadas.
// - Verificar que rol del usuario coincida con roles permitidos para la ruta.
// - Redirigir automáticamente usuarios no autorizados o sin permisos.
//
// ARQUITECTURA:
// - Recibe allowedRoles (array de roles permitidos) y usuario actual.
// - Usa React Router Navigate para redirecciones declarativas.
// - Outlet renderiza componentes hijos si validación pasa.
// - Logging detallado en consola para debugging de permisos.
//
// FLUJO DE VALIDACIÓN:
// 1. Verifica si existe objeto usuario (autenticación).
// 2. Si no hay usuario, redirige a /login.
// 3. Si hay usuario, verifica si su rol está en allowedRoles (autorización).
// 4. Si rol no permitido, redirige a página principal (/).
// 5. Si rol permitido, renderiza componente hijo con Outlet.
//
// PROPS:
// - allowedRoles: Array de roles permitidos (ej: [TipoUsuario.ADMINISTRADOR]).
// - usuario: Objeto con información del usuario autenticado, incluyendo rol.
//
// REDIRECCIONES:
// - Sin usuario: /login (requiere autenticación).
// - Rol no autorizado: / (acceso denegado, vuelve a inicio).
//
// CASOS DE USO:
// 1. ADMINISTRADOR accede a /administrador/*, allowedRoles=[ADMINISTRADOR], permite acceso.
// 2. INQUILINO intenta /administrador/*, allowedRoles=[ADMINISTRADOR], redirige a /.
// 3. Usuario no logueado intenta /propietario/*, no hay usuario, redirige a /login.
//
// LOGGING:
// - Logs de validación en consola para debugging.
// - Muestra roles permitidos, rol del usuario y decisión de acceso.
// - Warning cuando se deniega acceso por rol incorrecto.
//
// SEGURIDAD:
// - Validación en FRONTEND es solo UX, NO es seguridad real.
// - Backend DEBE validar permisos con Spring Security (@PreAuthorize).
// - Este componente evita navegación accidental, pero usuario técnico puede bypassear.
//
// INTEGRACIÓN CON ROUTER:
// Uso en App.tsx o rutas:
// <Route element={<ProtectedRoute allowedRoles={[TipoUsuario.ADMINISTRADOR]} usuario={usuario} />}>
//   <Route path="/administrador" element={<DashboardAdmin />} />
// </Route>

interface ProtectedRouteProps {
  allowedRoles: TipoUsuario[];
  usuario: {
    rol: TipoUsuario;
  } | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  usuario,
}) => {
  console.log("[ProtectedRoute] Validando acceso:", {
    allowedRoles,
    usuario,
    usuarioCompleto: JSON.stringify(usuario),
  });

  if (!usuario) {
    console.log("[ProtectedRoute] No hay usuario, redirigiendo a login");
    return <Navigate to="/login" replace />;
  }

  console.log("[ProtectedRoute] Rol del usuario:", usuario.rol);
  console.log("[ProtectedRoute] Roles permitidos:", allowedRoles);

  if (!allowedRoles.includes(usuario.rol)) {
    console.warn(
      "[ProtectedRoute] Acceso denegado. Rol del usuario:",
      usuario.rol,
      "No está en:",
      allowedRoles
    );
    return <Navigate to="/" replace />;
  }

  console.log("[ProtectedRoute] Acceso permitido:", usuario.rol);
  return <Outlet />;
};

export default ProtectedRoute;
