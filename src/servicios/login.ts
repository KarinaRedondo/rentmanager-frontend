import { urlApi } from "../api";

const API_URL = "/api/v1/auth";

export class AuthService {
  static async iniciarSesion(
    correo: string,
    contrasena: string
  ): Promise<{ token: string }> {
    const { data } = await urlApi.post(`${API_URL}/login`, {
      correo,
      contrasena,
    });
    return data as { token: string };
  }
}