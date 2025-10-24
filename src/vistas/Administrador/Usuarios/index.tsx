import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModalComponente } from "../../../componentes/Modal";
import InputCustom from "../../../componentes/ui/Input";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { UsuarioService } from "../../../servicios/usuarios";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import { TipoDocumento } from "../../../modelos/enumeraciones/tipoDocumento";
import { NivelAcceso } from "../../../modelos/enumeraciones/nivelAcceso";
import { EspecialidadContador } from "../../../modelos/enumeraciones/especialidadContador";
import { EstadoCivil } from "../../../modelos/enumeraciones/estadoCivil";
import { TipoCuenta } from "../../../modelos/enumeraciones/tipoCuenta";
import { EntidadFinanciera } from "../../../modelos/enumeraciones/entidadFinanciera";
import { obtenerContratos } from "../../../servicios/contratos";
import { PropiedadService } from "../../../servicios/propiedades";
import { obtenerFacturas } from "../../../servicios/facturas";
import { obtenerPagos } from "../../../servicios/pagos";
import styles from "./AdministradorUsuarios.module.css";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { Eye, FileText, Home, X, Edit, Trash2, DollarSign, CreditCard, Search, ArrowUp, ArrowDown } from "react-feather";

const Usuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any | null>(null);

  // Modal de detalles
  const [modalDetalles, setModalDetalles] = useState(false);
  const [usuarioDetalles, setUsuarioDetalles] = useState<any | null>(null);
  const [contratos, setContratos] = useState<any[]>([]);
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  // Filtros y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [ordenarPor, setOrdenarPor] = useState<"nombre" | "apellido" | "correo" | "tipoUsuario">("nombre");
  const [ordenAscendente, setOrdenAscendente] = useState(true);

  // Estados de formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(TipoUsuario.INQUILINO);
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>(TipoDocumento.CC);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");
  const [nivelAcceso, setNivelAcceso] = useState<NivelAcceso>(NivelAcceso.BASICO);
  const [numeroTarjetaProfesional, setNumeroTarjetaProfesional] = useState("");
  const [especialidadContador, setEspecialidadContador] = useState<EspecialidadContador>(EspecialidadContador.GENERAL);
  const [telefonoAlternativo, setTelefonoAlternativo] = useState("");
  const [referenciaPersonal, setReferenciaPersonal] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [ingresosMensuales, setIngresosMensuales] = useState("");
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivil>(EstadoCivil.SOLTERO);
  const [cuentaBancaria, setCuentaBancaria] = useState("");
  const [banco, setBanco] = useState<EntidadFinanciera>(EntidadFinanciera.BANCOLOMBIA);
  const [tipoCuenta, setTipoCuenta] = useState<TipoCuenta>(TipoCuenta.AHORROS);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await UsuarioService.listarTodos();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const usuariosFiltrados = () => {
    let resultado = [...usuarios];

    if (busqueda.trim()) {
      resultado = resultado.filter((u) =>
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroTipo !== "TODOS") {
      resultado = resultado.filter((u) => u.tipoUsuario === filtroTipo);
    }

    resultado.sort((a, b) => {
      let valorA = a[ordenarPor]?.toString().toLowerCase() || "";
      let valorB = b[ordenarPor]?.toString().toLowerCase() || "";

      if (ordenAscendente) {
        return valorA.localeCompare(valorB);
      } else {
        return valorB.localeCompare(valorA);
      }
    });

    return resultado;
  };

  const cambiarOrden = (columna: "nombre" | "apellido" | "correo" | "tipoUsuario") => {
    if (ordenarPor === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenarPor(columna);
      setOrdenAscendente(true);
    }
  };

  const verDetalles = async (usuario: any) => {
    setUsuarioDetalles(usuario);
    setModalDetalles(true);
    setCargandoDetalles(true);

    try {
      if (usuario.tipoUsuario === TipoUsuario.PROPIETARIO) {
        const todasPropiedades = await PropiedadService.obtenerPropiedades();
        const propsPropietario = todasPropiedades.filter((p: any) => p.propietario?.idUsuario === usuario.idUsuario);
        setPropiedades(propsPropietario);

        const todosContratos = await obtenerContratos();
        const idsProps = propsPropietario.map((p: any) => p.idPropiedad);
        const contratosProps = todosContratos.filter((c: any) => idsProps.includes(c.propiedad?.idPropiedad));
        setContratos(contratosProps);

        const todasFacturas = await obtenerFacturas();
        const idsContratos = contratosProps.map((c: any) => c.idContrato);
        const facturasProps = todasFacturas.filter((f: any) => idsContratos.includes(f.contrato?.idContrato));
        setFacturas(facturasProps);

        const todosPagos = await obtenerPagos();
        const idsFacturas = facturasProps.map((f: any) => f.idFactura);
        const pagosProps = todosPagos.filter((p: any) => idsFacturas.includes(p.factura?.idFactura));
        setPagos(pagosProps);

      } else if (usuario.tipoUsuario === TipoUsuario.INQUILINO) {
        const todosContratos = await obtenerContratos();
        const contratosInquilino = todosContratos.filter((c: any) => c.idInquilino === usuario.idUsuario);
        setContratos(contratosInquilino);

        const idsProps = contratosInquilino.map((c: any) => c.propiedad?.idPropiedad).filter(Boolean);
        const todasPropiedades = await PropiedadService.obtenerPropiedades();
        const propsInquilino = todasPropiedades.filter((p: any) => idsProps.includes(p.idPropiedad));
        setPropiedades(propsInquilino);

        const todasFacturas = await obtenerFacturas();
        const idsContratos = contratosInquilino.map((c: any) => c.idContrato);
        const facturasInquilino = todasFacturas.filter((f: any) => idsContratos.includes(f.contrato?.idContrato));
        setFacturas(facturasInquilino);

        const todosPagos = await obtenerPagos();
        const idsFacturas = facturasInquilino.map((f: any) => f.idFactura);
        const pagosInquilino = todosPagos.filter((p: any) => idsFacturas.includes(p.factura?.idFactura));
        setPagos(pagosInquilino);
      }
    } catch (error) {
      console.error("Error al cargar detalles:", error);
    } finally {
      setCargandoDetalles(false);
    }
  };

  const abrirModalEditar = (usuario?: any) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setNombre(usuario.nombre);
      setApellido(usuario.apellido);
      setCorreo(usuario.correo);
      setTipoUsuario(usuario.tipoUsuario);
      setTipoDocumento(usuario.tipoDocumento || TipoDocumento.CC);
      setNumeroDocumento(usuario.numeroDocumento);
      setTelefono(usuario.telefono || "");
      setCargo(usuario.cargo || "");
      setNivelAcceso(usuario.nivelAcceso || NivelAcceso.BASICO);
      setNumeroTarjetaProfesional(usuario.numeroTarjetaProfesional || "");
      setEspecialidadContador(usuario.especialidadContador || EspecialidadContador.GENERAL);
      setTelefonoAlternativo(usuario.telefonoAlternativo || "");
      setReferenciaPersonal(usuario.referenciaPersonal || "");
      setOcupacion(usuario.ocupacion || "");
      setIngresosMensuales(usuario.ingresosMensuales?.toString() || "");
      setEstadoCivil(usuario.estadoCivil || EstadoCivil.SOLTERO);
      setCuentaBancaria(usuario.cuentaBancaria || "");
      setBanco(usuario.banco || EntidadFinanciera.BANCOLOMBIA);
      setTipoCuenta(usuario.tipoCuenta || TipoCuenta.AHORROS);
    } else {
      setUsuarioEditando(null);
      setNombre("");
      setApellido("");
      setCorreo("");
      setContrasena("");
      setTipoUsuario(TipoUsuario.INQUILINO);
      setTipoDocumento(TipoDocumento.CC);
      setNumeroDocumento("");
      setTelefono("");
      setCargo("");
      setNivelAcceso(NivelAcceso.BASICO);
      setNumeroTarjetaProfesional("");
      setEspecialidadContador(EspecialidadContador.GENERAL);
      setTelefonoAlternativo("");
      setReferenciaPersonal("");
      setOcupacion("");
      setIngresosMensuales("");
      setEstadoCivil(EstadoCivil.SOLTERO);
      setCuentaBancaria("");
      setBanco(EntidadFinanciera.BANCOLOMBIA);
      setTipoCuenta(TipoCuenta.AHORROS);
    }
    setOpenModal(true);
  };

  const guardarUsuario = async () => {
    try {
      const datosBase: any = {
        nombre,
        apellido,
        correo,
        contrasena: contrasena || undefined,
        tipoUsuario,
        tipoDocumento,
        numeroDocumento,
        telefono: telefono || undefined,
      };

      switch (tipoUsuario) {
        case TipoUsuario.ADMINISTRADOR:
          datosBase.cargo = cargo;
          datosBase.nivelAcceso = nivelAcceso;
          break;
        case TipoUsuario.CONTADOR:
          datosBase.numeroTarjetaProfesional = numeroTarjetaProfesional;
          datosBase.especialidad = especialidadContador;
          break;
        case TipoUsuario.INQUILINO:
          datosBase.telefonoAlternativo = telefonoAlternativo;
          datosBase.referenciaPersonal = referenciaPersonal;
          datosBase.ocupacion = ocupacion;
          datosBase.ingresosMensuales = ingresosMensuales ? Number(ingresosMensuales) : undefined;
          datosBase.estadoCivil = estadoCivil;
          break;
        case TipoUsuario.PROPIETARIO:
          datosBase.cuentaBancaria = cuentaBancaria;
          datosBase.banco = banco;
          datosBase.tipoCuenta = tipoCuenta;
          break;
      }

      if (usuarioEditando) {
        await UsuarioService.actualizar(usuarioEditando.idUsuario, datosBase);
      } else {
        await UsuarioService.registrar(datosBase);
      }

      setOpenModal(false);
      await cargarUsuarios();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  const eliminarUsuario = async (id: number, tipo?: TipoUsuario, estado?: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    if (estado && estado !== "INACTIVO" && estado !== "SUSPENDIDO") {
      alert("No se puede eliminar este usuario por su estado");
      return;
    }
    try {
      await UsuarioService.eliminar(id, tipo);
      await cargarUsuarios();
      alert("Usuario eliminado correctamente");
    } catch (error: any) {
      console.error("Error al eliminar usuario:", error.response?.data || error.message);
      alert("No se pudo eliminar el usuario");
    }
  };

  const formatearMoneda = (valor: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className={styles.paginaCompleta}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.contenedorPrincipal}>
          <div className={styles.encabezado}>
            <div>
              <h1 className={styles.titulo}>Gestión de Usuarios</h1>
              <p className={styles.subtitulo}>Administra todos los usuarios del sistema</p>
            </div>
            <BotonComponente label="+ Nuevo Usuario" onClick={() => abrirModalEditar()} />
          </div>

          {/* Barra de filtros */}
          <div className={styles.barraFiltros}>
            <div className={styles.busquedaContenedor}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.inputBusqueda}
              />
            </div>

            <div className={styles.filtroTipo}>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={styles.selectFiltro}
              >
                <option value="TODOS">Todos los tipos</option>
                {Object.values(TipoUsuario).map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className={styles.resultados}>
              {usuariosFiltrados().length} usuarios encontrados
            </div>
          </div>

          {/* Tabla */}
          <div className={styles.tablaContenedor}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th onClick={() => cambiarOrden("nombre")} className={styles.thOrdenable}>
                    <div className={styles.headerColumna}>
                      Nombre
                      {ordenarPor === "nombre" && (
                        ordenAscendente ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => cambiarOrden("apellido")} className={styles.thOrdenable}>
                    <div className={styles.headerColumna}>
                      Apellido
                      {ordenarPor === "apellido" && (
                        ordenAscendente ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => cambiarOrden("correo")} className={styles.thOrdenable}>
                    <div className={styles.headerColumna}>
                      Correo
                      {ordenarPor === "correo" && (
                        ordenAscendente ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      )}
                    </div>
                  </th>
                  <th onClick={() => cambiarOrden("tipoUsuario")} className={styles.thOrdenable}>
                    <div className={styles.headerColumna}>
                      Tipo
                      {ordenarPor === "tipoUsuario" && (
                        ordenAscendente ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      )}
                    </div>
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados().length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.sinResultados}>
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados().map((usuario) => (
                    <tr key={usuario.idUsuario}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.apellido}</td>
                      <td>{usuario.correo}</td>
                      <td>
                        <span className={styles.tipoBadge}>{usuario.tipoUsuario}</span>
                      </td>
                      <td>
                        <div className={styles.acciones}>
                          <button className={styles.btnEditar} onClick={() => abrirModalEditar(usuario)} title="Editar">
                            <Edit size={18} />
                          </button>
                          <button className={styles.btnEliminar} onClick={() => eliminarUsuario(usuario.idUsuario, usuario.tipoUsuario, usuario.estado)} title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                          {(usuario.tipoUsuario === TipoUsuario.PROPIETARIO || usuario.tipoUsuario === TipoUsuario.INQUILINO) && (
                            <button className={styles.btnVerDetalles} onClick={() => verDetalles(usuario)} title="Ver detalles">
                              <Eye size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Crear/Editar */}
      <ModalComponente
        openModal={openModal}
        setOpenModal={setOpenModal}
        nombreModal={usuarioEditando ? "Editar Usuario" : "Crear Usuario"}
        guardar={guardarUsuario}
      >
        <div className={styles.formulario}>
          <InputCustom value={nombre} setValue={setNombre} title="Nombre" />
          <InputCustom value={apellido} setValue={setApellido} title="Apellido" />
          <InputCustom value={correo} setValue={setCorreo} title="Correo" type="email" />
          <InputCustom value={contrasena} setValue={setContrasena} title={usuarioEditando ? "Nueva Contraseña" : "Contraseña"} type="password" />

          <div className={styles.campo}>
            <label>Tipo de Documento</label>
            <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)} className={styles.select}>
              {Object.values(TipoDocumento).map((td) => (
                <option key={td} value={td}>{td}</option>
              ))}
            </select>
          </div>

          <InputCustom value={numeroDocumento} setValue={setNumeroDocumento} title="Número de Documento" />
          <InputCustom value={telefono} setValue={setTelefono} title="Teléfono" type="tel" />

          <div className={styles.campo}>
            <label>Tipo de Usuario</label>
            <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value as TipoUsuario)} className={styles.select}>
              {Object.values(TipoUsuario).map((tu) => (
                <option key={tu} value={tu}>{tu}</option>
              ))}
            </select>
          </div>

          {tipoUsuario === TipoUsuario.ADMINISTRADOR && (
            <>
              <InputCustom value={cargo} setValue={setCargo} title="Cargo" />
              <div className={styles.campo}>
                <label>Nivel de Acceso</label>
                <select value={nivelAcceso} onChange={(e) => setNivelAcceso(e.target.value as NivelAcceso)} className={styles.select}>
                  {Object.values(NivelAcceso).map((n) => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </>
          )}

          {tipoUsuario === TipoUsuario.CONTADOR && (
            <>
              <InputCustom value={numeroTarjetaProfesional} setValue={setNumeroTarjetaProfesional} title="Número de Tarjeta Profesional" />
              <div className={styles.campo}>
                <label>Especialidad</label>
                <select value={especialidadContador} onChange={(e) => setEspecialidadContador(e.target.value as EspecialidadContador)} className={styles.select}>
                  {Object.values(EspecialidadContador).map((esp) => (<option key={esp} value={esp}>{esp}</option>))}
                </select>
              </div>
            </>
          )}

          {tipoUsuario === TipoUsuario.INQUILINO && (
            <>
              <InputCustom value={telefonoAlternativo} setValue={setTelefonoAlternativo} title="Teléfono Alternativo" />
              <InputCustom value={referenciaPersonal} setValue={setReferenciaPersonal} title="Referencia Personal" />
              <InputCustom value={ocupacion} setValue={setOcupacion} title="Ocupación" />
              <InputCustom value={ingresosMensuales} setValue={setIngresosMensuales} title="Ingresos Mensuales" type="number" />
              <div className={styles.campo}>
                <label>Estado Civil</label>
                <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value as EstadoCivil)} className={styles.select}>
                  {Object.values(EstadoCivil).map((ec) => (<option key={ec} value={ec}>{ec}</option>))}
                </select>
              </div>
            </>
          )}

          {tipoUsuario === TipoUsuario.PROPIETARIO && (
            <>
              <InputCustom value={cuentaBancaria} setValue={setCuentaBancaria} title="Cuenta Bancaria" />
              <div className={styles.campo}>
                <label>Entidad Financiera</label>
                <select value={banco} onChange={(e) => setBanco(e.target.value as EntidadFinanciera)} className={styles.select}>
                  <option value="">Seleccione un banco</option>
                  {Object.values(EntidadFinanciera).map((entidad) => (
                    <option key={entidad} value={entidad}>{entidad.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className={styles.campo}>
                <label>Tipo de Cuenta</label>
                <select value={tipoCuenta} onChange={(e) => setTipoCuenta(e.target.value as TipoCuenta)} className={styles.select}>
                  {Object.values(TipoCuenta).map((tc) => (<option key={tc} value={tc}>{tc}</option>))}
                </select>
              </div>
            </>
          )}
        </div>
      </ModalComponente>

      {/* Modal de Detalles */}
      {modalDetalles && (
        <div className={styles.modalOverlay} onClick={() => setModalDetalles(false)}>
          <div className={styles.modalDetalles} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalles de {usuarioDetalles?.nombre} {usuarioDetalles?.apellido}</h2>
              <button className={styles.btnCerrar} onClick={() => setModalDetalles(false)}>
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {cargandoDetalles ? (
                <div className={styles.cargando}>
                  <div className={styles.spinner}></div>
                  <p>Cargando información...</p>
                </div>
              ) : (
                <>
                  {usuarioDetalles?.tipoUsuario === TipoUsuario.PROPIETARIO && (
                    <>
                      <div className={styles.seccionDetalles}>
                        <h3><Home size={20} /> Propiedades ({propiedades.length})</h3>
                        {propiedades.length === 0 ? (
                          <p className={styles.sinDatos}>No hay propiedades registradas</p>
                        ) : (
                          <div className={styles.lista}>
                            {propiedades.map((prop: any) => (
                              <div key={prop.idPropiedad} className={styles.itemLista}>
                                <div>
                                  <strong>{prop.direccion}</strong>
                                  <p>{prop.ciudad} - {prop.tipo}</p>
                                </div>
                                <button
                                  className={styles.btnAccion}
                                  onClick={() => {
                                    setModalDetalles(false);
                                    navigate(`/administrador/propiedades/${prop.idPropiedad}`);
                                  }}
                                >
                                  <Eye size={16} /> Ver
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.seccionDetalles}>
                        <h3><FileText size={20} /> Contratos ({contratos.length})</h3>
                        {contratos.length === 0 ? (
                          <p className={styles.sinDatos}>No hay contratos registrados</p>
                        ) : (
                          <div className={styles.lista}>
                            {contratos.map((cont: any) => (
                              <div key={cont.idContrato} className={styles.itemLista}>
                                <div>
                                  <strong>Contrato #{cont.idContrato}</strong>
                                  <p>{cont.direccionPropiedad} - {cont.estado}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.seccionDetalles}>
                        <h3><DollarSign size={20} /> Facturas ({facturas.length})</h3>
                        {facturas.length === 0 ? (
                          <p className={styles.sinDatos}>No hay facturas registradas</p>
                        ) : (
                          <div className={styles.lista}>
                            {facturas.map((fact: any) => (
                              <div key={fact.idFactura} className={styles.itemLista}>
                                <div>
                                  <strong>Factura #{fact.idFactura}</strong>
                                  <p>{formatearMoneda(fact.total)} - {fact.estado}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.seccionDetalles}>
                        <h3><CreditCard size={20} /> Pagos ({pagos.length})</h3>
                        {pagos.length === 0 ? (
                          <p className={styles.sinDatos}>No hay pagos registrados</p>
                        ) : (
                          <div className={styles.lista}>
                            {pagos.map((pago: any) => (
                              <div key={pago.idPago} className={styles.itemLista}>
                                <div>
                                  <strong>Pago #{pago.idPago}</strong>
                                  <p>{formatearMoneda(pago.monto)} - {pago.estado}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {usuarioDetalles?.tipoUsuario === TipoUsuario.INQUILINO && (
                    <>
                      <div className={styles.seccionDetalles}>
                        <h3><FileText size={20} /> Contratos ({contratos.length})</h3>
                        {contratos.length === 0 ? (
                          <p className={styles.sinDatos}>No hay contratos registrados</p>
                        ) : (
                          <div className={styles.lista}>
                            {contratos.map((cont: any) => (
                              <div key={cont.idContrato} className={styles.itemLista}>
                                <div>
                                  <strong>Contrato #{cont.idContrato}</strong>
                                  <p>{cont.direccionPropiedad} - {cont.estado}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.seccionDetalles}>
                        <h3><Home size={20} /> Propiedades Arrendadas ({propiedades.length})</h3>
                        {propiedades.length === 0 ? (
                          <p className={styles.sinDatos}>No hay propiedades arrendadas</p>
                        ) : (
                          <div className={styles.lista}>
                            {propiedades.map((prop: any) => (
                              <div key={prop.idPropiedad} className={styles.itemLista}>
                                <div>
                                  <strong>{prop.direccion}</strong>
                                  <p>{prop.ciudad} - {prop.tipo}</p>
                                </div>
                                <button
                                  className={styles.btnAccion}
                                  onClick={() => {
                                    setModalDetalles(false);
                                    navigate(`/administrador/propiedades/${prop.idPropiedad}`);
                                  }}
                                >
                                  <Eye size={16} /> Ver
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.seccionDetalles}>
                        <h3><DollarSign size={20} /> Facturas ({facturas.length})</h3>
                        {facturas.length === 0 ? (
                          <p className={styles.sinDatos}>No hay facturas registradas</p>
                        ) : (
                          <div className={styles.lista}>
                            {facturas.map((fact: any) => (
                              <div key={fact.idFactura} className={styles.itemLista}>
                                <div>
                                  <strong>Factura #{fact.idFactura}</strong>
                                  <p>{formatearMoneda(fact.total)} - {fact.estado}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={styles.seccionDetalles}>
                        <h3><CreditCard size={20} /> Pagos ({pagos.length})</h3>
                        {pagos.length === 0 ? (
                          <p className={styles.sinDatos}>No hay pagos registrados</p>
                        ) : (
                          <div className={styles.lista}>
                            {pagos.map((pago: any) => (
                              <div key={pago.idPago} className={styles.itemLista}>
                                <div>
                                  <strong>Pago #{pago.idPago}</strong>
                                  <p>{formatearMoneda(pago.monto)} - {pago.estado}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Usuarios;
