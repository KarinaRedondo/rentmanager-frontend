import { BrowserRouter, Route, Routes } from "react-router-dom";
import Inicio from "./vistas/Inicio";
import Login from "./vistas/Login";
import ProtectedRoute from "./app/routes";
import { TipoUsuario } from "./modelos/enumeraciones/tipoUsuario";
import AdminDashboard from "./vistas/Administrador";
import PropietarioDashboard from "./vistas/Propietario";
import Usuarios from "./vistas/Administrador/Usuarios";
import InquilinoDashboard from "./vistas/Inquilino";
import ContadorDashboard from "./vistas/Contador";
import InquilinoHistorialPagos from "./vistas/Inquilino/Pagos";
import ContadorGestionPagos from "./vistas/Contador/Pagos";
import PropietarioPropiedades from "./vistas/Propietario/Propiedades";
import PropietarioHistorialContratos from "./vistas/Propietario/Contratos";
import InquilinoFacturas from "./vistas/Inquilino/Facturas";
import DetalleContrato from "./vistas/Propietario/Contratos/Detalles";
import PropietarioFacturas from "./vistas/Propietario/Facturas";
import AdministradorPropiedades from "./vistas/Administrador/Propiedades";
import ContadorFacturas from "./vistas/Contador/Facturas";
import PropiedadDetalle from "./vistas/Propietario/Propiedades/Detalle";
import DetalleFactura from "./vistas/Propietario/Facturas/Detalles";
import DetallePagoInquilino from "./vistas/Inquilino/Pagos/Detalles";
import DetalleContratoInquilino from "./vistas/Inquilino/Contratos/Detalles";
import DetalleFacturaInquilino from "./vistas/Inquilino/Facturas/Detalles";
import ContratosInquilino from "./vistas/Inquilino/Contratos";
import DetallePropiedad from "./vistas/Administrador/Propiedades/Detalle";
import DetalleFacturaContador from "./vistas/Contador/Facturas/Detalles";
import InquilinoRegistrarPago from "./vistas/Inquilino/Pagos/Registrar";
import DetalleContratoContador from "./vistas/Contador/DetalleContratoContador";
import DetallesPagoContador from "./vistas/Contador/DetallePagoContador";
import DetallePropiedadContador from "./vistas/Contador/DetallePropiedadContador";
import AcercaDeNosotros from "./componentes/Footer/Empresa/Acerca de Nosotros";
import Carreras from "./componentes/Footer/Empresa/Carreras";
import Prensa from "./componentes/Footer/Empresa/Prensa";
import Caracteristicas from "./componentes/Footer/Producto/Caracteristicas";
import Precios from "./componentes/Footer/Producto/Precios";
import Integraciones from "./componentes/Footer/Producto/Integraciones";
import Blog from "./componentes/Footer/Recursos/Blog";
import Soporte from "./componentes/Footer/Recursos/Soporte";
import FAQ from "./componentes/Footer/Recursos/Preguntas frecuentes";
import Terminos from "./componentes/Footer/Legal/Terminos de Servicio";
import Privacidad from "./componentes/Footer/Legal/Politica de Privacidad";
import Perfil from "./componentes/Header/Avatar/Perfil";
import Configuracion from "./componentes/Header/Avatar/Configuracion";

function App() {
  // Cargar usuario guardado en localStorage
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />

        {/* ... otras rutas */}
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracion" element={<Configuracion />} />

        {/* Rutas informativas públicas */}
        <Route path="/acerca" element={<AcercaDeNosotros />} />
        <Route path="/carreras" element={<Carreras />} />
        <Route path="/prensa" element={<Prensa />} />
        <Route path="/caracteristicas" element={<Caracteristicas />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/integraciones" element={<Integraciones />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/soporte" element={<Soporte />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />

        {/* ADMINISTRADOR */}
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
        </Route>

        {/* PROPIETARIO */}
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
        </Route>

        {/* INQUILINO */}
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
        </Route>

        <Route path="/inquilino/pagos/:id" element={<DetallePagoInquilino />} />
        <Route
          path="/inquilino/contratos/:id"
          element={<DetalleContratoInquilino />}
        />
        <Route
          path="/inquilino/facturas/:id"
          element={<DetalleFacturaInquilino />}
        />

        {/* CONTADOR */}
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
        </Route>
        <Route path="/contador/facturas" element={<ContadorFacturas />} />

        <Route
          path="/contador/facturas/:id"
          element={<DetalleFacturaContador />}
        />
        <Route
          path="/contador/contratos/:id"
          element={<DetalleContratoContador />}
        />
        <Route path="/contador/pagos/:id" element={<DetallesPagoContador />} />
        <Route
          path="/contador/propiedades/:id"
          element={<DetallePropiedadContador />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
