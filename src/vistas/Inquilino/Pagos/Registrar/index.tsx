import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../componentes/Header";
import Footer from "../../../../componentes/Footer";
import { BotonComponente } from "../../../../componentes/ui/Boton";
import { obtenerFacturas } from "../../../../servicios/facturas";
import { crearPago } from "../../../../servicios/pagos";
import type { DTOFacturaRespuesta } from "../../../../modelos/types/Factura";
import { TipoUsuario } from "../../../../modelos/enumeraciones/tipoUsuario";
import { MetodoPago } from "../../../../modelos/enumeraciones/metodoPago";
import styles from "./InquilinoRegistrarPago.module.css";
import {
  DollarSign,
  Upload,
  FileText,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "react-feather";

// ========================================
// REGISTRAR PAGO - ROL INQUILINO
// ========================================
//
// Formulario completo para que el inquilino registre pagos de facturas pendientes.
// Incluye validaciones, resumen dinámico y flujo de éxito.
//
// FUNCIONALIDADES:
// - Carga automática de facturas pendientes del inquilino.
// - Selección de factura con autocompletado de monto.
// - Formulario completo con validaciones.
// - Campos condicionales según método de pago.
// - Panel de resumen dinámico en tiempo real.
// - Pantalla de éxito con redirección automática.
// - Subida opcional de comprobante mediante URL.
//
// SEGURIDAD:
// - verificarAcceso(): Valida autenticación y rol INQUILINO exclusivamente.
// - Redirección a login si no hay sesión.
// - Redirección a home si rol no es INQUILINO.
//
// ESTADO:
// - facturas: Lista de facturas pendientes (PENDIENTE o GENERADA).
// - cargando: Indica carga inicial de facturas.
// - enviando: Indica envío del formulario en proceso.
// - error: Mensaje de error para mostrar al usuario.
// - exitoso: Flag para mostrar pantalla de éxito.
// - formulario: Objeto FormularioPago con todos los campos del pago.
//
// INTERFACE FormularioPago:
// - idFactura: ID de la factura seleccionada
// - monto: Monto del pago (autocompletado desde factura)
// - metodoPago: Método seleccionado (enum MetodoPago)
// - fecha: Fecha del pago (default: hoy)
// - referenciaTransaccion: Referencia única del pago
// - bancoOrigen: Banco desde donde se hizo el pago (opcional)
// - bancoDestino: Banco receptor del pago (opcional)
// - comprobanteUrl: URL del comprobante subido (opcional)
//
// FUNCIONES PRINCIPALES:
//
// cargarFacturasPendientes():
// - Obtiene todas las facturas con obtenerFacturas().
// - Filtra solo las que tienen estado PENDIENTE o GENERADA.
// - Normaliza estados a mayúsculas para comparación.
// - Maneja arrays vacíos.
//
// handleFacturaChange():
// - Se ejecuta al seleccionar una factura.
// - Encuentra la factura en la lista.
// - Autocompleta el campo monto con factura.total.
// - Actualiza formulario con spread operator.
//
// handleSubmit():
// - Previene comportamiento default del form.
// - Ejecuta validaciones completas:
//   * Factura seleccionada (idFactura != 0)
//   * Método de pago seleccionado
//   * Monto > 0
//   * Referencia de transacción no vacía
// - Construye objeto nuevoPago con:
//   * Objeto factura completo
//   * Fecha en formato ISO (YYYY-MM-DDTHH:mm:ss)
//   * Estado inicial: PENDIENTE
//   * Campos opcionales con spread condicional (...campo && {campo})
// - Llama crearPago() del servicio.
// - Muestra pantalla de éxito.
// - Redirección automática después de 2 segundos a /inquilino/pagos.
//
// VALIDACIONES:
// 1. Factura requerida
// 2. Método de pago requerido
// 3. Monto > 0
// 4. Referencia de transacción no vacía
// 5. Campos HTML5: required, type="number", type="date", type="url"
//
// MÉTODOS DE PAGO:
// - TRANSFERENCIA: Transferencia Bancaria
// - EFECTIVO: Efectivo
//
// LISTA DE BANCOS:
// BANCOLOMBIA, BANCO_DE_BOGOTA, DAVIVIENDA, BBVA, BANCO_POPULAR,
// BANCO_OCCIDENTE, BANCO_CAJA_SOCIAL, BANCO_AV_VILLAS,
// SCOTIABANK_COLPATRIA, BANCO_AGRARIO, NEQUI, DAVIPLATA, OTRO
//
// COMPONENTES VISUALES:
//
// Encabezado:
// - Botón volver al dashboard.
// - Título "Registrar Nuevo Pago".
// - Subtítulo descriptivo.
//
// Alerta de Error:
// - Banner rojo con icono AlertCircle.
// - Se muestra si hay error.
//
// Formulario (Grid 2 columnas):
// - Tarjeta formulario (izquierda):
//   * Select de factura con información completa: Dirección - Monto (Fecha vencimiento)
//   * Input monto (readonly, autocompletado)
//   * Select método de pago
//   * Input fecha (type="date", default: hoy)
//   * Input referencia de transacción
//   * Select banco origen (condicional si método es TRANSFERENCIA)
//   * Select banco destino (condicional si método es TRANSFERENCIA)
//   * Input URL comprobante (opcional)
//   * Texto de ayuda para comprobante
//   * Botones: Cancelar y Registrar Pago
//
// - Tarjeta resumen (derecha):
//   * Header con título
//   * Items del resumen:
//     - Propiedad (dirección)
//     - Periodo (mes y año de emisión)
//     - Fecha vencimiento
//     - Separador
//     - Método de pago (label legible)
//     - Referencia
//     - Separador
//     - Total a pagar (destacado)
//   * Nota informativa sobre verificación
//   * Estado vacío si no hay factura seleccionada
//
// Pantalla de Éxito:
// - Icono CheckCircle verde grande.
// - Título "¡Pago Registrado Exitosamente!".
// - Mensaje de confirmación.
// - Texto de redirección con animación.
//
// CAMPOS CONDICIONALES:
// - bancoOrigen y bancoDestino: Solo visibles si metodoPago === TRANSFERENCIA.
// - Campos opcionales en objeto de creación: Spread condicional.
//
// AUTOCOMPLETADO:
// - Monto: Se autocompleta desde factura.total al seleccionar factura.
// - Campo monto es readonly (no editable por usuario).
//
// MANEJO DE FECHAS:
// - Input fecha: Formato HTML5 (YYYY-MM-DD).
// - Default: Fecha actual con new Date().toISOString().split("T")[0].
// - Conversión para backend: new Date(fecha).toISOString().slice(0, 19).
//
// NAVEGACIÓN:
// - Volver: /inquilino/dashboard
// - Cancelar: /inquilino/dashboard
// - Éxito: Redirección automática a /inquilino/pagos después de 2 segundos
//
// ESTADOS VISUALES:
// - Cargando: Spinner con "Cargando información...".
// - Exitoso: Pantalla completa de éxito con icono y redirección.
// - Error: Banner de alerta con mensaje descriptivo.
// - Enviando: Botón deshabilitado con texto "Registrando...".
//
// CARACTERÍSTICAS DESTACADAS:
// - Resumen dinámico que se actualiza en tiempo real.
// - Validaciones robustas antes de enviar.
// - Manejo de errores del backend.
// - Feedback visual claro en cada etapa.
// - UX optimizada con defaults inteligentes.
// - Soporte para comprobante mediante URL (no upload directo).
//
// ESTILOS:
// - CSS Modules encapsulado.
// - Grid 2 columnas responsive (formulario + resumen).
// - Inputs y selects con iconos descriptivos.
// - Tarjetas con sombras y bordes.
// - Botones con estados disabled.
// - Pantalla de éxito con diseño centrado.

interface FormularioPago {
  idFactura: number;
  monto: number;
  metodoPago: string;
  fecha: string;
  referenciaTransaccion: string;
  bancoOrigen: string;
  bancoDestino: string;
  comprobanteUrl: string;
}

const METODOS_PAGO = [
  { value: MetodoPago.TRANSFERENCIA, label: "Transferencia Bancaria" },
  { value: MetodoPago.EFECTIVO, label: "Efectivo" },
];

const BANCOS = [
  "BANCOLOMBIA",
  "BANCO_DE_BOGOTA",
  "DAVIVIENDA",
  "BBVA",
  "BANCO_POPULAR",
  "BANCO_OCCIDENTE",
  "BANCO_CAJA_SOCIAL",
  "BANCO_AV_VILLAS",
  "SCOTIABANK_COLPATRIA",
  "BANCO_AGRARIO",
  "NEQUI",
  "DAVIPLATA",
  "OTRO",
];

const InquilinoRegistrarPago: React.FC = () => {
  const navigate = useNavigate();

  const [facturas, setFacturas] = useState<DTOFacturaRespuesta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [exitoso, setExitoso] = useState<boolean>(false);

  const [formulario, setFormulario] = useState<FormularioPago>({
    idFactura: 0,
    monto: 0,
    metodoPago: "",
    fecha: new Date().toISOString().split("T")[0],
    referenciaTransaccion: "",
    bancoOrigen: "",
    bancoDestino: "",
    comprobanteUrl: "",
  });

  useEffect(() => {
    verificarAcceso();
  }, []);

  const verificarAcceso = async () => {
    try {
      const usuarioString = localStorage.getItem("usuario");
      const token = localStorage.getItem("token");

      if (!usuarioString || !token) {
        navigate("/login");
        return;
      }

      const usuario = JSON.parse(usuarioString);
      const rolUsuario = usuario.rol || usuario.tipoUsuario;

      if (rolUsuario !== "INQUILINO" && rolUsuario !== TipoUsuario.INQUILINO) {
        alert("No tienes permisos para acceder a esta sección");
        navigate("/");
        return;
      }

      await cargarFacturasPendientes();
    } catch (err: any) {
      console.error("Error al verificar acceso:", err);
      navigate("/login");
    }
  };

  const cargarFacturasPendientes = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerFacturas();

      const facturasPendientes = Array.isArray(data)
        ? data.filter((f) => {
            const estado = String(f.estado).toUpperCase();
            return estado === "PENDIENTE" || estado === "GENERADA";
          })
        : [];

      setFacturas(facturasPendientes);
    } catch (err: any) {
      console.error("Error al cargar facturas:", err);
      setError("Error al cargar las facturas pendientes");
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFacturaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idFactura = parseInt(e.target.value);
    const facturaSeleccionada = facturas.find((f) => f.idFactura === idFactura);

    setFormulario((prev) => ({
      ...prev,
      idFactura,
      monto: facturaSeleccionada?.total || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formulario.idFactura) {
      setError("Debe seleccionar una factura");
      return;
    }

    if (!formulario.metodoPago) {
      setError("Debe seleccionar un método de pago");
      return;
    }

    if (formulario.monto <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    if (!formulario.referenciaTransaccion.trim()) {
      setError("Debe ingresar una referencia de transacción");
      return;
    }

    try {
      setEnviando(true);

      const facturaSeleccionada = facturas.find(
        (f) => f.idFactura === formulario.idFactura
      );

      if (!facturaSeleccionada) {
        setError("Factura no encontrada");
        return;
      }

      const nuevoPago: any = {
        factura: facturaSeleccionada,
        fecha: new Date(formulario.fecha).toISOString().slice(0, 19),
        monto: formulario.monto,
        metodoPago: formulario.metodoPago,
        referenciaTransaccion: formulario.referenciaTransaccion,
        estado: "PENDIENTE",
        ...(formulario.bancoOrigen && { bancoOrigen: formulario.bancoOrigen }),
        ...(formulario.bancoDestino && {
          bancoDestino: formulario.bancoDestino,
        }),
        ...(formulario.comprobanteUrl && {
          comprobanteUrl: formulario.comprobanteUrl,
        }),
      };

      await crearPago(nuevoPago);

      setExitoso(true);

      setTimeout(() => {
        navigate("/inquilino/pagos");
      }, 2000);
    } catch (err: any) {
      console.error("Error al registrar pago:", err);
      setError(
        err.response?.data?.message ||
          "Error al registrar el pago. Por favor, intente nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  const facturaSeleccionada = facturas.find(
    (f) => f.idFactura === formulario.idFactura
  );

  if (cargando) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.cargando}>
            <div className={styles.spinner}></div>
            <p>Cargando información...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (exitoso) {
    return (
      <div className={styles.pagina}>
        <Header />
        <main className={styles.main}>
          <div className={styles.exitoContenedor}>
            <CheckCircle size={64} className={styles.iconoExito} />
            <h2>¡Pago Registrado Exitosamente!</h2>
            <p>Tu pago ha sido registrado y está en proceso de verificación.</p>
            <p className={styles.textoRedireccion}>
              Redirigiendo al historial de pagos...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pagina}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contenedor}>
          <div className={styles.encabezado}>
            <button
              className={styles.btnVolver}
              onClick={() => navigate("/inquilino/dashboard")}
            >
              <ArrowLeft size={20} />
              Volver al Dashboard
            </button>
            <h1>Registrar Nuevo Pago</h1>
            <p className={styles.subtitulo}>
              Registra tu pago de alquiler y sube el comprobante
            </p>
          </div>

          {error && (
            <div className={styles.alerta}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.gridFormulario}>
            <div className={styles.tarjetaFormulario}>
              <div className={styles.headerFormulario}>
                <h2>
                  <DollarSign size={24} />
                  Información del Pago
                </h2>
              </div>

              <form onSubmit={handleSubmit} className={styles.formulario}>
                <div className={styles.grupo}>
                  <label htmlFor="idFactura" className={styles.label}>
                    <FileText size={18} />
                    Factura a Pagar *
                  </label>
                  <select
                    id="idFactura"
                    name="idFactura"
                    value={formulario.idFactura}
                    onChange={handleFacturaChange}
                    className={styles.select}
                    required
                  >
                    <option value="">Seleccione una factura</option>
                    {facturas.map((factura) => {
                      const propiedad = factura.contrato?.propiedad;
                      const direccion =
                        propiedad?.direccion || "Propiedad no identificada";
                      return (
                        <option
                          key={factura.idFactura}
                          value={factura.idFactura}
                        >
                          {direccion} - $
                          {(factura.total || 0).toLocaleString("es-CO")} (
                          {factura.fechaVencimiento
                            ? new Date(
                                factura.fechaVencimiento
                              ).toLocaleDateString("es-CO")
                            : "Sin fecha"}
                          )
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="monto" className={styles.label}>
                    <DollarSign size={18} />
                    Monto a Pagar *
                  </label>
                  <input
                    type="number"
                    id="monto"
                    name="monto"
                    value={formulario.monto}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                    readOnly
                  />
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="metodoPago" className={styles.label}>
                    <CreditCard size={18} />
                    Método de Pago *
                  </label>
                  <select
                    id="metodoPago"
                    name="metodoPago"
                    value={formulario.metodoPago}
                    onChange={handleChange}
                    className={styles.select}
                    required
                  >
                    <option value="">Seleccione un método</option>
                    {METODOS_PAGO.map((metodo) => (
                      <option key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.grupo}>
                  <label htmlFor="fecha" className={styles.label}>
                    <Calendar size={18} />
                    Fecha de Pago *
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formulario.fecha}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.grupo}>
                  <label
                    htmlFor="referenciaTransaccion"
                    className={styles.label}
                  >
                    <FileText size={18} />
                    Referencia de Transacción *
                  </label>
                  <input
                    type="text"
                    id="referenciaTransaccion"
                    name="referenciaTransaccion"
                    value={formulario.referenciaTransaccion}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Ej: REF-123456789"
                    required
                  />
                </div>

                {formulario.metodoPago === MetodoPago.TRANSFERENCIA && (
                  <>
                    <div className={styles.grupo}>
                      <label htmlFor="bancoOrigen" className={styles.label}>
                        <CreditCard size={18} />
                        Banco Origen
                      </label>
                      <select
                        id="bancoOrigen"
                        name="bancoOrigen"
                        value={formulario.bancoOrigen}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="">Seleccione un banco</option>
                        {BANCOS.map((banco) => (
                          <option key={banco} value={banco}>
                            {banco.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.grupo}>
                      <label htmlFor="bancoDestino" className={styles.label}>
                        <CreditCard size={18} />
                        Banco Destino
                      </label>
                      <select
                        id="bancoDestino"
                        name="bancoDestino"
                        value={formulario.bancoDestino}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="">Seleccione un banco</option>
                        {BANCOS.map((banco) => (
                          <option key={banco} value={banco}>
                            {banco.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className={styles.grupo}>
                  <label htmlFor="comprobanteUrl" className={styles.label}>
                    <Upload size={18} />
                    URL del Comprobante (Opcional)
                  </label>
                  <input
                    type="url"
                    id="comprobanteUrl"
                    name="comprobanteUrl"
                    value={formulario.comprobanteUrl}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://ejemplo.com/comprobante.pdf"
                  />
                  <small className={styles.ayuda}>
                    Puedes subir tu comprobante a Google Drive o similar y pegar
                    el enlace aquí
                  </small>
                </div>

                <div className={styles.grupoBoton}>
                  <button
                    type="button"
                    onClick={() => navigate("/inquilino/dashboard")}
                    className={styles.btnCancelar}
                    disabled={enviando}
                  >
                    Cancelar
                  </button>
                  <BotonComponente
                    label={enviando ? "Registrando..." : "Registrar Pago"}
                    onClick={() => {}}
                    disabled={enviando}
                  />
                </div>
              </form>
            </div>

            <div className={styles.tarjetaResumen}>
              <div className={styles.headerResumen}>
                <h3>Resumen del Pago</h3>
              </div>

              {facturaSeleccionada ? (
                <div className={styles.contenidoResumen}>
                  <div className={styles.itemResumen}>
                    <span className={styles.labelResumen}>Propiedad:</span>
                    <span className={styles.valorResumen}>
                      {facturaSeleccionada.contrato?.propiedad?.direccion ||
                        "N/A"}
                    </span>
                  </div>

                  <div className={styles.itemResumen}>
                    <span className={styles.labelResumen}>Periodo:</span>
                    <span className={styles.valorResumen}>
                      {facturaSeleccionada.fechaEmision
                        ? new Date(
                            facturaSeleccionada.fechaEmision
                          ).toLocaleDateString("es-CO", {
                            month: "long",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>

                  <div className={styles.itemResumen}>
                    <span className={styles.labelResumen}>
                      Fecha Vencimiento:
                    </span>
                    <span className={styles.valorResumen}>
                      {facturaSeleccionada.fechaVencimiento
                        ? new Date(
                            facturaSeleccionada.fechaVencimiento
                          ).toLocaleDateString("es-CO")
                        : "N/A"}
                    </span>
                  </div>

                  <div className={styles.separador}></div>

                  <div className={styles.itemResumen}>
                    <span className={styles.labelResumen}>Método de Pago:</span>
                    <span className={styles.valorResumen}>
                      {formulario.metodoPago
                        ? METODOS_PAGO.find(
                            (m) => m.value === formulario.metodoPago
                          )?.label
                        : "No seleccionado"}
                    </span>
                  </div>

                  <div className={styles.itemResumen}>
                    <span className={styles.labelResumen}>Referencia:</span>
                    <span className={styles.valorResumen}>
                      {formulario.referenciaTransaccion || "No ingresada"}
                    </span>
                  </div>

                  <div className={styles.separador}></div>

                  <div className={styles.itemResumenTotal}>
                    <span className={styles.labelTotal}>Total a Pagar:</span>
                    <span className={styles.valorTotal}>
                      ${formulario.monto.toLocaleString("es-CO")}
                    </span>
                  </div>

                  <div className={styles.notaResumen}>
                    <AlertCircle size={16} />
                    <p>
                      Tu pago será verificado por el contador. Recibirás una
                      notificación una vez sea aprobado.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={styles.sinSeleccion}>
                  <FileText size={48} />
                  <p>Selecciona una factura para ver el resumen</p>
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

export default InquilinoRegistrarPago;
