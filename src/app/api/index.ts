import axios from "axios";

// ========================================
// CONFIGURACIÓN CENTRALIZADA DE AXIOS
// ========================================
//
// Archivo de configuración global para todas las peticiones HTTP del frontend.
// Implementa autenticación JWT, interceptores globales y manejo de errores centralizado.
//
// PROPÓSITO:
// - Centralizar configuración de HTTP client para evitar duplicación de código.
// - Adjuntar automáticamente token JWT en cada petición autenticada.
// - Manejar errores globales (401, 403) de forma consistente en toda la aplicación.
// - Facilitar cambio de URL base en diferentes ambientes (dev, staging, prod).
//
// ARQUITECTURA:
// - Instancia única de Axios configurada con baseURL del backend.
// - Interceptor de REQUEST adjunta token JWT antes de enviar peticiones.
// - Interceptor de RESPONSE detecta errores de autenticación/autorización.
// - Uso de localStorage para persistencia de token entre sesiones.
//
// FLUJO DE AUTENTICACIÓN:
// 1. Usuario hace login → Backend retorna token JWT.
// 2. Token se guarda en localStorage.
// 3. Cada petición lee token de localStorage y lo adjunta en header Authorization.
// 4. Backend valida token y procesa petición.
// 5. Si token expira o es inválido, interceptor de RESPONSE redirige a login.

// ---------------------------------------------------------
// Configuración base de Axios
// ---------------------------------------------------------
// baseURL: URL base del backend (puerto 8080 en desarrollo local).
// withCredentials: false → No se envían cookies, solo JWT en headers.
// USO: Importar 'urlApi' en servicios y usar métodos HTTP (get, post, put, delete).

// ---------------------------------------------------------
// Interceptor de REQUEST
// Se ejecuta antes de enviar cada petición
// Su función es adjuntar el token JWT en el header Authorization
// ---------------------------------------------------------
// FLUJO:
// 1. Lee token JWT desde localStorage.
// 2. Si existe token, lo adjunta en header "Authorization: Bearer {token}".
// 3. Backend valida token con Spring Security (JwtAuthFilter).
// 4. Si token es válido, procesa petición; si no, retorna 401.
//
// CASOS DE USO:
// - Peticiones a endpoints protegidos (/api/propiedades, /api/contratos, etc.).
// - Envío de operaciones CRUD que requieren usuario autenticado.
// - Consulta de datos sensibles (historial, reportes, estadísticas).

// ---------------------------------------------------------
// Interceptor de RESPONSE
// Se ejecuta después de recibir una respuesta del backend
// Detecta errores globales como token inválido o permisos insuficientes
// ---------------------------------------------------------
// CÓDIGOS DE ERROR MANEJADOS:
//
// 401 UNAUTHORIZED:
// - Significa: Token JWT expirado, inválido o ausente.
// - Acción: Elimina token y datos de usuario, redirige a /login.
// - Casos: Token expirado, token manipulado, backend reiniciado.
//
// 403 FORBIDDEN:
// - Significa: Usuario autenticado pero sin permisos suficientes.
// - Acción: Muestra advertencia en consola.
// - Casos: INQUILINO intenta acceder a endpoint de ADMINISTRADOR.
//
// Otros errores (4xx, 5xx):
// - Se propagan al servicio que hizo la petición para manejo específico.

// ========================================
// NOTAS DE SEGURIDAD
// ========================================
// - Token JWT en localStorage es vulnerable a XSS si hay inyección de scripts.
// - Alternativas más seguras: httpOnly cookies, sessionStorage, Secure + SameSite cookies.
// - IMPORTANTE: Sanitizar todos los inputs para prevenir XSS.
// - Usar HTTPS en producción para proteger tokens en tránsito.

// ---------------------------------------------------------
// Configuración base de Axios
// ---------------------------------------------------------
export const urlApi = axios.create({
  baseURL: "http://localhost:8080", // Cambiar al dominio real del backend
  withCredentials: false, // No se usan cookies, solo JWT en headers
});

// ---------------------------------------------------------
// Interceptor de REQUEST
// Se ejecuta antes de enviar cada petición
// Su función es adjuntar el token JWT en el header Authorization
// ---------------------------------------------------------
urlApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      // Añadir encabezado Authorization con el token JWT
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Si hay un error antes de enviar la solicitud
    console.error("Error en el interceptor de request:", error);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------
// Interceptor de RESPONSE
// Se ejecuta después de recibir una respuesta del backend
// Detecta errores globales como token inválido o permisos insuficientes
// ---------------------------------------------------------
urlApi.interceptors.response.use(
  (response) => {
    // Si la respuesta es correcta (2xx), se devuelve tal cual
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Token expirado o usuario no autenticado");
      // Elimina datos locales del usuario
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      // Redirige al login
      window.location.href = "/login";
    }

    if (status === 403) {
      console.warn("Acceso denegado: el rol del usuario no tiene permiso");
      // Se puede redirigir a una página personalizada si se desea
    }

    // Devuelve el error para que el servicio que hizo la petición también pueda manejarlo
    return Promise.reject(error);
  }
);
