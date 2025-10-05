import axios from "axios";

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