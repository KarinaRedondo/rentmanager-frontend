import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./vistas/Inicio";
import Login from "./vistas/Login";
import ProtectedRoute from "./app/routes";
import { TipoUsuario } from "./modelos/enumeraciones/tipoUsuario";

// Dashboards
import AdminDashboard from "./vistas/Administrador";
import PropietarioDashboard from "./vistas/Propietario";
import InquilinoDashboard from "./vistas/Inquilino";
import ContadorDashboard from "./vistas/Contador";

// Administrador
import Usuarios from "./vistas/Administrador/Usuarios";
import AdministradorPropiedades from "./vistas/Administrador/Propiedades";
import DetallePropiedad from "./vistas/Administrador/Propiedades/Detalle";
import DetalleContratoAdministrador from "./vistas/Administrador/Usuarios/Detalles/Contrato";
import DetalleFacturaAdministrador from "./vistas/Administrador/Usuarios/Detalles/Factura";
import AdministradorHistorial from "./vistas/Administrador/Historial";

// Propietario
import PropietarioPropiedades from "./vistas/Propietario/Propiedades";
import PropietarioHistorialContratos from "./vistas/Propietario/Contratos";
import PropietarioFacturas from "./vistas/Propietario/Facturas";
import DetalleContrato from "./vistas/Propietario/Contratos/Detalles";
import PropiedadDetalle from "./vistas/Propietario/Propiedades/Detalle";
import DetalleFactura from "./vistas/Propietario/Facturas/Detalles";

// Inquilino
import InquilinoHistorialPagos from "./vistas/Inquilino/Pagos";
import InquilinoFacturas from "./vistas/Inquilino/Facturas";
import ContratosInquilino from "./vistas/Inquilino/Contratos";
import DetallePagoInquilino from "./vistas/Inquilino/Pagos/Detalles";
import DetalleContratoInquilino from "./vistas/Inquilino/Contratos/Detalles";
import DetalleFacturaInquilino from "./vistas/Inquilino/Facturas/Detalles";
import InquilinoRegistrarPago from "./vistas/Inquilino/Pagos/Registrar";

// Contador
import ContadorGestionPagos from "./vistas/Contador/Pagos";
import ContadorFacturas from "./vistas/Contador/Facturas";
import DetalleFacturaContador from "./vistas/Contador/Facturas/Detalles";
import DetalleContratoContador from "./vistas/Contador/Facturas/Detalles/DetalleContratoContador";
import DetallesPagoContador from "./vistas/Contador/Facturas/Detalles/DetallePagoContador";
import DetallePropiedadContador from "./vistas/Contador/Facturas/Detalles/DetallePropiedadContador";
import ContadorHistorial from "./vistas/Contador/Historial";

// Reportes
import SelectorReportes from "./vistas/Administrador/Reportes/Selector";
import ReporteContrato from "./vistas/Administrador/Reportes/Contratos";
import ReportePropiedad from "./vistas/Administrador/Reportes/Propiedad";
import ReportePago from "./vistas/Administrador/Reportes/Pagos";
import ReporteFactura from "./vistas/Administrador/Reportes/Facturas";

// Footer - Empresa
import AcercaDeNosotros from "./componentes/Footer/Empresa/Acerca de Nosotros";
import Carreras from "./componentes/Footer/Empresa/Carreras";
import Prensa from "./componentes/Footer/Empresa/Prensa";

// Footer - Producto
import Caracteristicas from "./componentes/Footer/Producto/Caracteristicas";
import Precios from "./componentes/Footer/Producto/Precios";
import Integraciones from "./componentes/Footer/Producto/Integraciones";

// Footer - Recursos
import Blog from "./componentes/Footer/Recursos/Blog";
import Soporte from "./componentes/Footer/Recursos/Soporte";
import FAQ from "./componentes/Footer/Recursos/Preguntas frecuentes";

// Footer - Legal
import Terminos from "./componentes/Footer/Legal/Terminos de Servicio";
import Privacidad from "./componentes/Footer/Legal/Politica de Privacidad";

// Header - Avatar
import Perfil from "./componentes/Header/Avatar/Perfil";
import Configuracion from "./componentes/Header/Avatar/Configuracion";

function App() {
  // Cargar usuario guardado en localStorage
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== RUTAS PÚBLICAS ==================== */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />

        {/* Perfil y Configuración */}
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracion" element={<Configuracion />} />

        {/* Footer - Empresa */}
        <Route path="/acerca" element={<AcercaDeNosotros />} />
        <Route path="/carreras" element={<Carreras />} />
        <Route path="/prensa" element={<Prensa />} />

        {/* Footer - Producto */}
        <Route path="/caracteristicas" element={<Caracteristicas />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/integraciones" element={<Integraciones />} />

        {/* Footer - Recursos */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/soporte" element={<Soporte />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Footer - Legal */}
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />

        {/* ==================== ADMINISTRADOR ==================== */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.ADMINISTRADOR]}
              usuario={usuario}
            />
          }
        >
          <Route path="/administrador/dashboard" element={<AdminDashboard />} />
          <Route path="/administrador/usuarios" element={<Usuarios />} />
          <Route
            path="/administrador/propiedades"
            element={<AdministradorPropiedades />}
          />
          <Route
            path="/administrador/propiedades/:id"
            element={<DetallePropiedad />}
          />
          <Route
            path="/administrador/contratos/:id"
            element={<DetalleContratoAdministrador />}
          />
          <Route
            path="/administrador/facturas/:id"
            element={<DetalleFacturaAdministrador />}
          />
          <Route
            path="/administrador/historial"
            element={<AdministradorHistorial />}
          />

          {/* Reportes - Administrador */}
          <Route
            path="/administrador/reportes"
            element={<SelectorReportes />}
          />
          <Route
            path="/administrador/reporte/contrato/:id"
            element={<ReporteContrato />}
          />
          <Route
            path="/administrador/reporte/propiedad/:id"
            element={<ReportePropiedad />}
          />

          <Route
            path="/administrador/reporte/pago/:id"
            element={<ReportePago />}
          />
          <Route
            path="/administrador/reporte/factura/:id"
            element={<ReporteFactura />}
          />
        </Route>

        {/* ==================== PROPIETARIO ==================== */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.PROPIETARIO]}
              usuario={usuario}
            />
          }
        >
          <Route
            path="/propietario/dashboard"
            element={<PropietarioDashboard />}
          />
          <Route
            path="/propietario/propiedades"
            element={<PropietarioPropiedades />}
          />
          <Route
            path="/propietario/contratos"
            element={<PropietarioHistorialContratos />}
          />
          <Route
            path="/propietario/facturas"
            element={<PropietarioFacturas />}
          />
          <Route
            path="/propietario/contratos/:id"
            element={<DetalleContrato />}
          />
          <Route
            path="/propietario/propiedades/:id"
            element={<PropiedadDetalle />}
          />
          <Route
            path="/propietario/facturas/:id"
            element={<DetalleFactura />}
          />

          {/* Reportes - Propietario */}
          <Route path="/propietario/reportes" element={<SelectorReportes />} />
          <Route
            path="/propietario/reporte/contrato/:id"
            element={<ReporteContrato />}
          />
          <Route
            path="/propietario/reporte/propiedad/:id"
            element={<ReportePropiedad />}
          />

          <Route
            path="/propietario/reporte/pago/:id"
            element={<ReportePago />}
          />
          <Route
            path="/propietario/reporte/factura/:id"
            element={<ReporteFactura />}
          />
        </Route>

        {/* ==================== INQUILINO ==================== */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.INQUILINO]}
              usuario={usuario}
            />
          }
        >
          <Route path="/inquilino/dashboard" element={<InquilinoDashboard />} />
          <Route
            path="/inquilino/pagos"
            element={<InquilinoHistorialPagos />}
          />
          <Route path="/inquilino/contratos" element={<ContratosInquilino />} />
          <Route path="/inquilino/facturas" element={<InquilinoFacturas />} />
          <Route
            path="/inquilino/pagos/nuevo"
            element={<InquilinoRegistrarPago />}
          />
          <Route
            path="/inquilino/pagos/:id"
            element={<DetallePagoInquilino />}
          />
          <Route
            path="/inquilino/contratos/:id"
            element={<DetalleContratoInquilino />}
          />
          <Route
            path="/inquilino/facturas/:id"
            element={<DetalleFacturaInquilino />}
          />

          {/* Reportes - Inquilino */}
          <Route
            path="/inquilino/reporte/contrato/:id"
            element={<ReporteContrato />}
          />

          <Route
            path="/inquilino/reporte/contrato/:id"
            element={<ReporteContrato />}
          />
          <Route path="/inquilino/reporte/pago/:id" element={<ReportePago />} />
          <Route
            path="/inquilino/reporte/factura/:id"
            element={<ReporteFactura />}
          />
        </Route>

        {/* ==================== CONTADOR ==================== */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[TipoUsuario.CONTADOR]}
              usuario={usuario}
            />
          }
        >
          <Route path="/contador/dashboard" element={<ContadorDashboard />} />
          <Route path="/contador/pagos" element={<ContadorGestionPagos />} />
          <Route path="/contador/facturas" element={<ContadorFacturas />} />
          <Route
            path="/contador/facturas/:id"
            element={<DetalleFacturaContador />}
          />
          <Route
            path="/contador/contratos/:id"
            element={<DetalleContratoContador />}
          />
          <Route
            path="/contador/pagos/:id"
            element={<DetallesPagoContador />}
          />
          <Route
            path="/contador/propiedades/:id"
            element={<DetallePropiedadContador />}
          />
          <Route path="/contador/historial" element={<ContadorHistorial />} />

          {/* Reportes - Contador */}
          <Route path="/contador/reportes" element={<SelectorReportes />} />
          <Route
            path="/contador/reporte/contrato/:id"
            element={<ReporteContrato />}
          />
          <Route
            path="/contador/reporte/propiedad/:id"
            element={<ReportePropiedad />}
          />

          <Route path="/contador/reporte/pago/:id" element={<ReportePago />} />
          <Route
            path="/contador/reporte/factura/:id"
            element={<ReporteFactura />}
          />
        </Route>

        {/* Ruta 404 - Opcional */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <h1>404 - Página no encontrada</h1>
              <p>La página que buscas no existe.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
