import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../componentes/Header";
import Footer from "../../componentes/Footer";
import { BotonComponente } from "../../componentes/ui/Boton";
import { obtenerContratos } from "../../servicios/contratos";
import { obtenerFacturas } from "../../servicios/facturas";
import { obtenerPagos } from "../../servicios/pagos";
import type { DTOContratoRespuesta } from "../../modelos/types/Contrato";
import type { DTOFacturaRespuesta } from "../../modelos/types/Factura";
import type { DTOPagoRespuesta } from "../../modelos/types/Pago";
import { TipoUsuario } from "../../modelos/enumeraciones/tipoUsuario";
import styles from "./InquilinoDashboard.module.css";
import {
  Home,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from "react-feather";

// ========================================
// DASHBOARD DE INQUILINO
// ========================================
//
// Panel principal completo para rol Inquilino con estadísticas, contratos, facturas y pagos.
// Dashboard personalizado con información financiera y gestión de alquileres.
//
// FUNCIONALIDADES:
// - Visualización de estadísticas principales del inquilino.
// - Listado de contratos activos con imágenes.
// - Historial de pagos recientes (últimos 3).
// - Recordatorios de pagos próximos a vencer (2 más urgentes).
// - Estado de facturas pendientes y pagadas (4 más recientes).
// - Navegación rápida a secciones de contratos, facturas y pagos.
// - Botón destacado para registrar nuevo pago.
// - Logging extensivo para debugging.
//
// SEGURIDAD:
// - verificarAcceso(): Valida autenticación y rol INQUILINO exclusivamente.
// - Redirección a login si no hay sesión.
// - Redirección a home si rol no es INQUILINO.
// - Logging de acceso verificado con nombre de usuario.
//
// ESTADO:
// - contratos: Lista completa de contratos del inquilino.
// - facturas: Lista completa de facturas.
// - pagos: Lista completa de pagos.
// - cargando: Indica carga inicial.
// - error: Mensaje de error.
//
// CARGA DE DATOS:
// - cargarDatosIniciales(): Carga paralela con Promise.allSettled.
// - No bloquea si una carga falla (arrays vacíos como fallback).
// - Logging detallado de cada resultado.
// - cargarContratos(), cargarFacturas(), cargarPagos(): Funciones individuales con try-catch.
//
// CONSTANTES:
// - IMAGENES_PROPIEDADES: Array de 9 URLs de Unsplash para imágenes de propiedades.
//
// FUNCIONES DE CÁLCULO:
//
// calcularEstadisticas():
// - **Contratos activos**: Cantidad con estado ACTIVO.
// - **Próximo pago**: Monto de la factura más próxima a vencer.
// - **Fecha próximo pago**: Fecha de vencimiento de factura más próxima.
// - **Días restantes**: Días hasta próximo vencimiento (>=0).
// - **Porcentaje pagos**: (Facturas pagadas / Total facturas) * 100.
// - **Pagos al día**: Boolean si todas las facturas están pagadas.
// - Ordena facturas pendientes por fecha de vencimiento.
// - Usa setHours(0,0,0,0) para comparación de fechas sin hora.
//
// obtenerHistorialPagos():
// - Filtra pagos: COMPLETADO, VERIFICADO, APROBADO, PENDIENTE.
// - Ordena por pago.fecha descendente.
// - Toma los 3 más recientes.
// - Extrae: ID, dirección propiedad, método, referencia, fecha, monto, estado.
// - Genera referencia automática si no existe: PAG-000001.
// - Logging de cada pago procesado.
//
// obtenerRecordatorios():
// - Filtra facturas: PENDIENTE o GENERADA.
// - Ordena por fecha de vencimiento ascendente.
// - Toma las 2 más urgentes.
// - Calcula días restantes para cada una.
// - Extrae: ID, dirección propiedad, fecha vencimiento, días restantes.
//
// FORMATEO DE FECHAS:
// Todas las funciones usan parsing manual robusto:
// - Split por '-' para [año, mes, día]
// - Validación de 3 partes
// - Creación de Date con valores numéricos
// - Validación con isNaN()
// - Manejo de errores con mensajes descriptivos
//
// formatearFecha(): Formato largo (ej: "15 de enero de 2025")
// formatearFechaCorta(): Formato corto (ej: "15/01/2025")
// obtenerNombreMes(): Mes y año (ej: "enero de 2025")
// obtenerImagenPropiedad(): Retorna URL de imagen según índice (módulo 9)
//
// COMPONENTES VISUALES:
//
// Encabezado:
// - Título "Mi Panel de Inquilino".
// - Subtítulo descriptivo.
// - Botón destacado "Registrar Pago".
//
// Grid Principal (4 tarjetas):
// 1. **Contratos Activos**: Cantidad con descripción "Propiedades arrendadas".
// 2. **Próximo Pago**: Monto con fecha de vencimiento.
// 3. **Pagos al Día**: Porcentaje con mensaje según estado.
// 4. **Días Restantes**: Días hasta próximo vencimiento.
//
// Historial de Pagos:
// - Header con título y botón "Ver historial completo".
// - Lista de últimos 3 pagos:
//   * Icono coloreado según estado (verde: COMPLETADO/VERIFICADO, naranja: otros)
//   * Dirección de propiedad
//   * Tipo de pago y referencia
//   * Fecha
//   * Monto
//   * Badge de estado
// - Estado vacío: Icono DollarSign y mensaje.
//
// Recordatorios de Pago:
// - Header con título y descripción.
// - Lista de 2 facturas más próximas a vencer:
//   * Icono AlertCircle naranja
//   * Título "Pago próximo a vencer"
//   * Detalle: Propiedad, fecha, días restantes
// - Estado vacío: Icono CheckCircle verde y mensaje "No tienes pagos pendientes".
//
// Mis Contratos Activos:
// - Header con título y descripción.
// - Grid de contratos activos (máximo 2):
//   * Imagen de propiedad (Unsplash o placeholder)
//   * Badge "ACTIVO" sobre imagen
//   * Dirección
//   * Ciudad y detalles (habitaciones/baños o área)
//   * Renta mensual
//   * Fecha inicio
//   * Fecha vencimiento
//   * Botón "Ver detalles"
// - Estado vacío: Icono Home y mensaje.
// - Fallback de imagen en caso de error.
//
// Estado de Facturas:
// - Header con título y botón "Ver todas las facturas".
// - Lista de 4 facturas más recientes:
//   * Indicador coloreado (verde: PAGADA, naranja: otros)
//   * Título "Alquiler [mes año]"
//   * Dirección propiedad
//   * Fecha vencimiento (+ fecha pago si está pagada)
//   * Monto
//   * Badge de estado
// - Estado vacío: Icono FileText y mensaje.
//
// NAVEGACIÓN:
// - Registrar pago: /inquilino/pagos/nuevo
// - Historial completo: /inquilino/pagos
// - Detalle de contrato: /inquilino/contratos/{id}
// - Todas las facturas: /inquilino/facturas
//
// ESTADOS VISUALES:
// - Cargando: Spinner con "Cargando tu información...".
// - Error: Mensaje y botón reintentar.
// - Estados vacíos: Iconos grandes con mensajes descriptivos.
//
// LOGGING EXTENSIVO:
// - Acceso verificado con nombre de usuario.
// - Inicio de carga de datos.
// - Resultados de Promise.allSettled.
// - Cantidad y contenido de cada tipo de dato cargado.
// - Estadísticas calculadas.
// - Historial de pagos procesado.
// - Recordatorios generados.
// - Contratos y propiedades renderizados.
// - Estados de pagos en filtrado.
// - Direcciones encontradas.
// - Errores en cada operación.
//
// CARACTERÍSTICAS DESTACADAS:
// - **Parsing robusto de fechas**: Manejo manual sin zona horaria.
// - **Comentarios de corrección**: Marcados con ":" donde se corrigieron bugs.
// - **Imágenes de Unsplash**: URLs reales de propiedades.
// - **Fallback de imágenes**: Placeholder si falla la carga.
// - **Cálculos dinámicos**: Estadísticas reactivas según datos.
// - **Estados vacíos informativos**: Mensajes amigables.
// - **Logging completo**: Debug exhaustivo en producción.
// - **Extracción segura**: Optional chaining en datos anidados.
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid responsive para tarjetas principales.
// - Cards con imágenes y overlays.
// - Badges y indicadores coloreados.
// - Listas con separadores visuales.
// - Botones primarios y secundarios.

const IMAGENES_PROPIEDADES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1599423300746-b62533397364?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1600585154603-03e2a5b81c28?w=400&h=250&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
];

const InquilinoDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [contratos, setContratos] = useState<DTOContratoRespuesta[]>([]);
  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [pagos, setPagos] = useState<DTOPagoRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    verificarAcceso();
  }, []);

  const verificarAcceso = async () => {
    try {
      const usuarioString = localStorage.getItem("usuario");
      const token = localStorage.getItem("token");

      if (!usuarioString || !token) {
        console.error("No hay sesión activa");
        navigate("/login");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const rolUsuario = usuario.rol || usuario.tipoUsuario;

      if (rolUsuario !== "INQUILINO" && rolUsuario !== TipoUsuario.INQUILINO) {
        console.error("Acceso denegado: usuario no es inquilino");
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      console.log("Acceso verificado - Inquilino:", usuario.nombre);
      await cargarDatosIniciales();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);
      setError("");

      console.log("Iniciando carga de datos del inquilino...");

      const resultados = await Promise.allSettled([
        cargarContratos(),
        cargarFacturas(),
        cargarPagos(),
      ]);

      console.log("Resultados de carga:", resultados);

      if (resultados[0].status === "fulfilled") {
        setContratos(resultados[0].value);
        console.log(
          "Contratos cargados:",
          resultados[0].value.length,
          resultados[0].value
        );
      } else {
        console.warn("Error al cargar contratos:", resultados[0].reason);
        setContratos([]);
      }

      if (resultados[1].status === "fulfilled") {
        setFacturas(resultados[1].value);
        console.log(
          "Facturas cargadas:",
          resultados[1].value.length,
          resultados[1].value
        );
      } else {
        console.warn("Error al cargar facturas:", resultados[1].reason);
        setFacturas([]);
      }

      if (resultados[2].status === "fulfilled") {
        setPagos(resultados[2].value);
        console.log(
          "Pagos cargados:",
          resultados[2].value.length,
          resultados[2].value
        );
      } else {
        console.warn("Error al cargar pagos:", resultados[2].reason);
        setPagos([]);
      }

      console.log("Carga de datos completada");
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  const cargarContratos = async (): Promise<DTOContratoRespuesta[]> => {
    try {
      console.log("Llamando a obtenerContratos()...");
      const data = await obtenerContratos();
      console.log("Contratos recibidos:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al cargar contratos:", error);
      return [];
    }
  };

  const cargarFacturas = async (): Promise<DTOFacturaRespuesta[]> => {
    try {
      console.log("Llamando a obtenerFacturas()...");
      const data = await obtenerFacturas();
      console.log("Facturas recibidas:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      return [];
    }
  };

  const cargarPagos = async (): Promise<DTOPagoRespuesta[]> => {
    try {
      console.log("Llamando a obtenerPagos()...");
      const data = await obtenerPagos();
      console.log("Pagos recibidos:", data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error al cargar pagos:", error);
      return [];
    }
  };

  //  Calcular estadísticas con fechas correctas
  const calcularEstadisticas = () => {
    const contratosActivos = contratos.filter(
      (c) => String(c.estado).toUpperCase() === "ACTIVO"
    ).length;

    const facturasOrdenadas = [...facturas]
      .filter((f) => {
        const estado = String(f.estado).toUpperCase();
        return estado === "PENDIENTE" || estado === "GENERADA";
      })
      .sort((a, b) => {
        const fechaA = a.fechaVencimiento || a.fechaEmision || "";
        const fechaB = b.fechaVencimiento || b.fechaEmision || "";
        return fechaA.localeCompare(fechaB);
      });

    const proximoPago = facturasOrdenadas[0];

    const diasRestantes = proximoPago
      ? Math.ceil(
          (new Date(
            proximoPago.fechaVencimiento || proximoPago.fechaEmision || ""
          ).getTime() -
            new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const pagosAlDia = facturas.filter((f) => {
      const estado = String(f.estado).toUpperCase();
      return estado === "PAGADA" || estado === "COMPLETADA";
    }).length;

    const totalFacturas = facturas.length;
    const porcentajePagos =
      totalFacturas > 0 ? Math.round((pagosAlDia / totalFacturas) * 100) : 0;

    return {
      contratosActivos,
      proximoPago: proximoPago?.total || 0,
      fechaProximoPago:
        proximoPago?.fechaVencimiento || proximoPago?.fechaEmision || "",
      diasRestantes: Math.max(0, diasRestantes),
      porcentajePagos,
      pagosAlDia: pagosAlDia === totalFacturas && totalFacturas > 0,
    };
  };

  const obtenerHistorialPagos = () => {
    console.log("Procesando pagos para historial:", pagos);

    return pagos
      .filter((p) => {
        const estado = String(p.estado || "").toUpperCase();
        console.log("Estado de pago:", estado, "ID:", p.idPago);
        return (
          estado === "COMPLETADO" ||
          estado === "VERIFICADO" ||
          estado === "APROBADO" ||
          estado === "PENDIENTE"
        );
      })
      .sort((a, b) => {
        const fechaA = a.fecha || "";
        const fechaB = b.fecha || "";
        return fechaB.localeCompare(fechaA);
      })
      .slice(0, 3)
      .map((pago) => {
        const factura = pago.factura;
        const contrato = factura?.contrato;
        const propiedad = contrato?.propiedad;

        const direccion = propiedad?.direccion || "Propiedad no identificada";

        console.log(
          "Dirección encontrada:",
          direccion,
          "Pago ID:",
          pago.idPago
        );

        return {
          id: pago.idPago || 0,
          propiedad: direccion,
          tipo: pago.metodoPago || "TRANSFERENCIA",
          referencia:
            pago.referenciaTransaccion ||
            `PAG-${String(pago.idPago).padStart(6, "0")}`,
          fecha: pago.fecha || "",
          monto: pago.monto || 0,
          estado: String(pago.estado || "PENDIENTE").toUpperCase(),
        };
      });
  };

  const obtenerRecordatorios = () => {
    return facturas
      .filter((f) => {
        const estado = String(f.estado).toUpperCase();
        return estado === "PENDIENTE" || estado === "GENERADA";
      })
      .sort((a, b) => {
        const fechaA = a.fechaVencimiento || a.fechaEmision || "";
        const fechaB = b.fechaVencimiento || b.fechaEmision || "";
        return fechaA.localeCompare(fechaB);
      })
      .slice(0, 2)
      .map((factura) => {
        const diasRestantes = Math.ceil(
          (new Date(
            factura.fechaVencimiento || factura.fechaEmision || ""
          ).getTime() -
            new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        );

        const contrato = factura.contrato;
        const propiedad = contrato?.propiedad;

        const direccion = propiedad?.direccion || "Propiedad no identificada";

        return {
          id: factura.idFactura || 0,
          propiedad: direccion,
          fecha: factura.fechaVencimiento || factura.fechaEmision || "",
          diasRestantes,
        };
      });
  };

  // Formatear fecha sin problemas de zona horaria
  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const partes = fecha.split("-");
      if (partes.length !== 3) return "Fecha inválida";

      const [anio, mes, dia] = partes;
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Error en fecha";
    }
  };

  const formatearFechaCorta = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const partes = fecha.split("-");
      if (partes.length !== 3) return "Fecha inválida";

      const [anio, mes, dia] = partes;
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error al formatear fecha corta:", error);
      return "Error en fecha";
    }
  };

  const obtenerImagenPropiedad = (index: number): string => {
    return IMAGENES_PROPIEDADES[index % IMAGENES_PROPIEDADES.length];
  };

  const obtenerNombreMes = (fecha: string | undefined): string => {
    if (!fecha) return "N/A";
    try {
      const partes = fecha.split("-");
      if (partes.length !== 3) return "Mes inválido";

      const [anio, mes, dia] = partes;
      const date = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

      if (isNaN(date.getTime())) return "Mes inválido";
      return date.toLocaleDateString("es-CO", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error al obtener nombre del mes:", error);
      return "Error en mes";
    }
  };

  if (cargando) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando tu información...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <Header />
        <main className={styles.main}>
          <div className={styles.errorContenedor}>
            <h2>Error al cargar datos</h2>
            <p className={styles.error}>{error}</p>
            <BotonComponente
              label="Reintentar"
              onClick={cargarDatosIniciales}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estadisticas = calcularEstadisticas();
  const historialPagos = obtenerHistorialPagos();
  const recordatorios = obtenerRecordatorios();

  console.log("Estadísticas calculadas:", estadisticas);
  console.log("Historial de pagos:", historialPagos);
  console.log("Recordatorios:", recordatorios);

  return (
    <div className={styles.dashboard}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <div>
              <h1>Mi Panel de Inquilino</h1>
              <p className={styles.subtitulo}>
                Gestiona tus contratos, pagos y facturas
              </p>
            </div>
            <BotonComponente
              label="Registrar Pago"
              onClick={() => navigate("/inquilino/pagos/nuevo")}
            />
          </div>

          {/* Grid de tarjetas principales */}
          <div className={styles.gridPrincipal}>
            <div className={styles.tarjeta}>
              <div className={styles.iconoTarjeta}>
                <FileText size={24} />
              </div>
              <div className={styles.contenidoTarjeta}>
                <p className={styles.tituloTarjeta}>Contratos Activos</p>
                <h2 className={styles.valorTarjeta}>
                  {estadisticas.contratosActivos}
                </h2>
                <p className={styles.descripcionTarjeta}>
                  Propiedades arrendadas
                </p>
              </div>
            </div>

            <div className={styles.tarjeta}>
              <div className={styles.iconoTarjeta}>
                <DollarSign size={24} />
              </div>
              <div className={styles.contenidoTarjeta}>
                <p className={styles.tituloTarjeta}>Próximo Pago</p>
                <h2 className={styles.valorTarjeta}>
                  ${estadisticas.proximoPago.toLocaleString("es-CO")}
                </h2>
                <p className={styles.descripcionTarjeta}>
                  {estadisticas.fechaProximoPago
                    ? `Vence el ${formatearFechaCorta(
                        estadisticas.fechaProximoPago
                      )}`
                    : "No hay pagos pendientes"}
                </p>
              </div>
            </div>

            <div className={styles.tarjeta}>
              <div className={styles.iconoTarjeta}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.contenidoTarjeta}>
                <p className={styles.tituloTarjeta}>Pagos al Día</p>
                <h2 className={styles.valorTarjeta}>
                  {estadisticas.porcentajePagos}%
                </h2>
                <p className={styles.descripcionTarjeta}>
                  {estadisticas.pagosAlDia
                    ? "Sin pagos pendientes"
                    : "Tienes facturas pendientes"}
                </p>
              </div>
            </div>

            <div className={styles.tarjeta}>
              <div className={styles.iconoTarjeta}>
                <Calendar size={24} />
              </div>
              <div className={styles.contenidoTarjeta}>
                <p className={styles.tituloTarjeta}>Días Restantes</p>
                <h2 className={styles.valorTarjeta}>
                  {estadisticas.diasRestantes}
                </h2>
                <p className={styles.descripcionTarjeta}>
                  Para próximo vencimiento
                </p>
              </div>
            </div>
          </div>

          {/* Historial de Pagos */}
          <div className={styles.seccion}>
            <div className={styles.headerSeccion}>
              <div>
                <h2>
                  <Clock size={20} /> Historial de Pagos
                </h2>
                <p>Últimos pagos realizados</p>
              </div>
              <button
                className={styles.btnSecundario}
                onClick={() => navigate("/inquilino/pagos")}
              >
                Ver historial completo
              </button>
            </div>

            <div className={styles.tarjetaBlanca}>
              {historialPagos.length === 0 ? (
                <div className={styles.sinDatos}>
                  <DollarSign size={48} />
                  <p>No hay pagos registrados</p>
                </div>
              ) : (
                <div className={styles.listaPagos}>
                  {historialPagos.map((pago) => (
                    <div key={pago.id} className={styles.itemPago}>
                      <div className={styles.iconoPago}>
                        {pago.estado === "COMPLETADO" ||
                        pago.estado === "VERIFICADO" ? (
                          <CheckCircle
                            size={20}
                            className={styles.iconoVerde}
                          />
                        ) : (
                          <Clock size={20} className={styles.iconoNaranja} />
                        )}
                      </div>
                      <div className={styles.infoPago}>
                        <p className={styles.propiedadPago}>{pago.propiedad}</p>
                        <p className={styles.tipoPago}>
                          {pago.tipo} • {pago.referencia}
                        </p>
                        <p className={styles.fechaPago}>
                          {formatearFechaCorta(pago.fecha)}
                        </p>
                      </div>
                      <div className={styles.montoPago}>
                        <p className={styles.valorPago}>
                          ${pago.monto.toLocaleString("es-CO")}
                        </p>
                        <span
                          className={
                            pago.estado === "COMPLETADO" ||
                            pago.estado === "VERIFICADO"
                              ? styles.estadoConfirmado
                              : styles.estadoPendiente
                          }
                        >
                          {pago.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recordatorios de Pago */}
          <div className={styles.seccion}>
            <div className={styles.headerSeccion}>
              <div>
                <h2>
                  <AlertCircle size={20} /> Recordatorios de Pago
                </h2>
                <p>Próximos vencimientos y alertas importantes</p>
              </div>
            </div>

            <div className={styles.tarjetaBlanca}>
              {recordatorios.length === 0 ? (
                <div className={styles.sinDatos}>
                  <CheckCircle size={48} className={styles.iconoVerde} />
                  <p>No tienes pagos pendientes</p>
                </div>
              ) : (
                <div className={styles.listaRecordatorios}>
                  {recordatorios.map((recordatorio) => (
                    <div key={recordatorio.id} className={styles.recordatorio}>
                      <AlertCircle size={16} className={styles.iconoAlerta} />
                      <div className={styles.infoRecordatorio}>
                        <p className={styles.tituloRecordatorio}>
                          Pago próximo a vencer
                        </p>
                        <p className={styles.detalleRecordatorio}>
                          El alquiler de {recordatorio.propiedad} vence el{" "}
                          {formatearFecha(recordatorio.fecha)} (en{" "}
                          {recordatorio.diasRestantes} días)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mis Contratos Activos */}
          <div className={styles.seccion}>
            <div className={styles.headerSeccion}>
              <div>
                <h2>
                  <Home size={20} /> Mis Contratos Activos
                </h2>
                <p>Propiedades que tienes arrendadas actualmente</p>
              </div>
            </div>

            <div className={styles.tarjetaBlanca}>
              {contratos.filter(
                (c) => String(c.estado).toUpperCase() === "ACTIVO"
              ).length === 0 ? (
                <div className={styles.sinDatos}>
                  <Home size={48} />
                  <p>No tienes contratos activos</p>
                </div>
              ) : (
                <div className={styles.gridContratos}>
                  {contratos
                    .filter((c) => String(c.estado).toUpperCase() === "ACTIVO")
                    .slice(0, 2)
                    .map((contrato, index) => {
                      const propiedad = contrato.propiedad;
                      const direccion =
                        propiedad?.direccion || "Dirección no disponible";
                      const ciudad = propiedad?.ciudad || "N/A";
                      const detalles = propiedad?.habitaciones
                        ? `${propiedad.habitaciones} hab. • ${propiedad.banos} baños`
                        : `${propiedad?.area || 0} m²`;

                      console.log(
                        " Contrato:",
                        contrato.idContrato,
                        "Propiedad:",
                        propiedad
                      );

                      return (
                        <div
                          key={contrato.idContrato}
                          className={styles.tarjetaContrato}
                        >
                          <div className={styles.imagenContrato}>
                            <img
                              src={obtenerImagenPropiedad(index)}
                              alt="Propiedad"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/400x250/e5e7eb/6b7280?text=Propiedad";
                              }}
                            />
                            <span className={styles.estadoActivo}>ACTIVO</span>
                          </div>
                          <div className={styles.contenidoContrato}>
                            <h4>{direccion}</h4>
                            <p className={styles.propietarioContrato}>
                              {ciudad} • {detalles}
                            </p>
                            <div className={styles.detallesContrato}>
                              <div className={styles.detalleContrato}>
                                <span>Renta mensual:</span>
                                <strong>
                                  $
                                  {(contrato.valorMensual || 0).toLocaleString(
                                    "es-CO"
                                  )}
                                </strong>
                              </div>
                              <div className={styles.detalleContrato}>
                                <span>Inicio:</span>
                                <strong>
                                  {formatearFechaCorta(contrato.fechaInicio)}
                                </strong>
                              </div>
                              <div className={styles.detalleContrato}>
                                <span>Vencimiento:</span>
                                <strong>
                                  {formatearFechaCorta(contrato.fechaFin)}
                                </strong>
                              </div>
                            </div>
                            <button
                              className={styles.btnDescargar}
                              onClick={() =>
                                navigate(
                                  `/inquilino/contratos/${contrato.idContrato}`
                                )
                              }
                            >
                              <MoreVertical size={16} />
                              Ver detalles
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Estado de Facturas */}
          <div className={styles.seccion}>
            <div className={styles.headerSeccion}>
              <div>
                <h2>
                  <FileText size={20} /> Estado de Facturas
                </h2>
                <p>Facturas pendientes y generadas</p>
              </div>
              <button
                className={styles.btnSecundario}
                onClick={() => navigate("/inquilino/facturas")}
              >
                Ver todas las facturas
              </button>
            </div>

            <div className={styles.tarjetaBlanca}>
              {facturas.length === 0 ? (
                <div className={styles.sinDatos}>
                  <FileText size={48} />
                  <p>No hay facturas registradas</p>
                </div>
              ) : (
                <div className={styles.listaFacturas}>
                  {facturas.slice(0, 4).map((factura) => {
                    const contrato = factura.contrato;
                    const propiedad = contrato?.propiedad;
                    const direccion =
                      propiedad?.direccion || "Propiedad no identificada";

                    return (
                      <div
                        key={factura.idFactura}
                        className={styles.itemFactura}
                      >
                        <div className={styles.indicadorFactura}>
                          {String(factura.estado).toUpperCase() === "PAGADA" ? (
                            <div className={styles.puntoVerde}></div>
                          ) : (
                            <div className={styles.puntoNaranja}></div>
                          )}
                        </div>
                        <div className={styles.infoFactura}>
                          <p className={styles.tituloFactura}>
                            Alquiler {obtenerNombreMes(factura.fechaEmision)}
                          </p>
                          <p className={styles.propiedadFactura}>{direccion}</p>
                          <p className={styles.fechaFactura}>
                            Vence:{" "}
                            {formatearFechaCorta(
                              factura.fechaVencimiento || factura.fechaEmision
                            )}
                            {String(factura.estado).toUpperCase() ===
                              "PAGADA" &&
                              ` • Pagado: ${formatearFechaCorta(
                                factura.fechaEmision
                              )}`}
                          </p>
                        </div>
                        <div className={styles.montoFactura}>
                          <p className={styles.valorFactura}>
                            ${(factura.total || 0).toLocaleString("es-CO")}
                          </p>
                          <span
                            className={
                              String(factura.estado).toUpperCase() === "PAGADA"
                                ? styles.estadoPagada
                                : styles.estadoPendiente
                            }
                          >
                            {factura.estado}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InquilinoDashboard;
