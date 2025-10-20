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

           <Route path="/administrador/propiedades/:id" element={<DetallePropiedad />} />
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
          
          <Route
            path="/inquilino/contratos"
            element={<ContratosInquilino />}
          />
          <Route path="/inquilino/facturas" element={<InquilinoFacturas />} />
        </Route>

        <Route path="/inquilino/pagos/:id" element={<DetallePagoInquilino />} />
        <Route path="/inquilino/contratos/:id" element={<DetalleContratoInquilino />} />
        <Route path="/inquilino/facturas/:id" element={<DetalleFacturaInquilino />} />


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

        <Route path="/contador/facturas/:id" element={<DetalleFacturaContador />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
