import { useEffect, useState } from "react";
import { ModalComponente } from "../../../componentes/Modal/index,";
import InputCustom from "../../../componentes/ui/Input";
import { BotonComponente } from "../../../componentes/ui/Boton";
import { UsuarioService } from "../../../servicios/usuarios";
import { TipoUsuario } from "../../../modelos/enumeraciones/tipoUsuario";
import { TipoDocumento } from "../../../modelos/enumeraciones/tipoDocumento";
import { NivelAcceso } from "../../../modelos/enumeraciones/nivelAcceso";
import { EspecialidadContador } from "../../../modelos/enumeraciones/especialidadContador";
import { EstadoCivil } from "../../../modelos/enumeraciones/estadoCivil";
import { TipoCuenta } from "../../../modelos/enumeraciones/tipoCuenta";
 import styles from "./AdministradorUsuarios.module.css";
import Header from "../../../componentes/Header";
import Footer from "../../../componentes/Footer";
import { TablaBase } from "../../../componentes/ui/TablaBase";
import { EntidadFinanciera } from "../../../modelos/enumeraciones/entidadFinanciera";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any | null>(null);

  // --- Campos base ---
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(
    TipoUsuario.INQUILINO
  );
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>(
    TipoDocumento.CC
  );
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [telefono, setTelefono] = useState("");

  // --- Administrador ---
  const [cargo, setCargo] = useState("");
  const [nivelAcceso, setNivelAcceso] = useState<NivelAcceso>(
    NivelAcceso.BASICO
  );

  // --- Contador ---
  const [numeroTarjetaProfesional, setNumeroTarjetaProfesional] = useState("");
  const [especialidadContador, setEspecialidadContador] =
    useState<EspecialidadContador>(EspecialidadContador.GENERAL);

  // --- Inquilino ---
  const [telefonoAlternativo, setTelefonoAlternativo] = useState("");
  const [referenciaPersonal, setReferenciaPersonal] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [ingresosMensuales, setIngresosMensuales] = useState("");
  const [estadoCivil, setEstadoCivil] = useState<EstadoCivil>(
    EstadoCivil.SOLTERO
  );

  // --- Propietario ---
  const [cuentaBancaria, setCuentaBancaria] = useState("");
  const [banco, setBanco] = useState<EntidadFinanciera>(
    EntidadFinanciera.BANCOLOMBIA
  );
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
      setEspecialidadContador(
        usuario.especialidadContador || EspecialidadContador.GENERAL
      );

      setTelefonoAlternativo(usuario.telefonoAlternativo || "");
      setReferenciaPersonal(usuario.referenciaPersonal || "");
      setOcupacion(usuario.ocupacion || "");
      setIngresosMensuales(usuario.ingresosMensuales?.toString() || "");
      setEstadoCivil(usuario.estadoCivil || EstadoCivil.SOLTERO);

      setCuentaBancaria(usuario.cuentaBancaria || "");
      setBanco(usuario.banco || "");
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
          datosBase.ingresosMensuales = ingresosMensuales
            ? Number(ingresosMensuales)
            : undefined;
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

  const eliminarUsuario = async (
    id: number,
    tipo?: TipoUsuario,
    estado?: string
  ) => {
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
      console.error(
        "Error al eliminar usuario:",
        error.response?.data || error.message
      );
      alert("No se pudo eliminar el usuario");
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.header}>
        <h1>Gestión de Usuarios</h1>
        <BotonComponente
          label="Nuevo Usuario"
          onClick={() => abrirModalEditar()}
        />
      </div>

      <TablaBase
        columnas={[
          { key: "nombre", label: "Nombre" },
          { key: "apellido", label: "Apellido" },
          { key: "correo", label: "Correo" },
          { key: "tipoUsuario", label: "Tipo de Usuario" },
        ]}
        datos={usuarios}
        onEditar={(fila) => abrirModalEditar(fila)}
        onEliminar={(fila) =>
          eliminarUsuario(fila.idUsuario, fila.tipoUsuario, fila.estado)
        }
      />

      <ModalComponente
        openModal={openModal}
        setOpenModal={setOpenModal}
        nombreModal={usuarioEditando ? "Editar Usuario" : "Crear Usuario"}
        guardar={guardarUsuario}
      >
        <div className={styles.formulario}>
          {/* Campos base */}
          <InputCustom value={nombre} setValue={setNombre} title="Nombre" />
          <InputCustom
            value={apellido}
            setValue={setApellido}
            title="Apellido"
          />
          <InputCustom
            value={correo}
            setValue={setCorreo}
            title="Correo"
            type="email"
          />
          <InputCustom
            value={contrasena}
            setValue={setContrasena}
            title={usuarioEditando ? "Nueva Contraseña" : "Contraseña"}
            type="password"
          />

          <div className={styles.campo}>
            <label>Tipo de Documento</label>
            <select
              value={tipoDocumento}
              onChange={(e) =>
                setTipoDocumento(e.target.value as TipoDocumento)
              }
              className={styles.select}
            >
              {Object.values(TipoDocumento).map((td) => (
                <option key={td} value={td}>
                  {td}
                </option>
              ))}
            </select>
          </div>

          <InputCustom
            value={numeroDocumento}
            setValue={setNumeroDocumento}
            title="Número de Documento"
          />
          <InputCustom
            value={telefono}
            setValue={setTelefono}
            title="Teléfono"
            type="tel"
          />

          <div className={styles.campo}>
            <label>Tipo de Usuario</label>
            <select
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value as TipoUsuario)}
              className={styles.select}
            >
              {Object.values(TipoUsuario).map((tu) => (
                <option key={tu} value={tu}>
                  {tu}
                </option>
              ))}
            </select>
          </div>

          {/* ADMINISTRADOR */}
          {tipoUsuario === TipoUsuario.ADMINISTRADOR && (
            <>
              <InputCustom value={cargo} setValue={setCargo} title="Cargo" />
              <div className={styles.campo}>
                <label>Nivel de Acceso</label>
                <select
                  value={nivelAcceso}
                  onChange={(e) =>
                    setNivelAcceso(e.target.value as NivelAcceso)
                  }
                  className={styles.select}
                >
                  {Object.values(NivelAcceso).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* CONTADOR */}
          {tipoUsuario === TipoUsuario.CONTADOR && (
            <>
              <InputCustom
                value={numeroTarjetaProfesional}
                setValue={setNumeroTarjetaProfesional}
                title="Número de Tarjeta Profesional"
              />
              <div className={styles.campo}>
                <label>Especialidad</label>
                <select
                  value={especialidadContador}
                  onChange={(e) =>
                    setEspecialidadContador(
                      e.target.value as EspecialidadContador
                    )
                  }
                  className={styles.select}
                >
                  {Object.values(EspecialidadContador).map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* INQUILINO */}
          {tipoUsuario === TipoUsuario.INQUILINO && (
            <>
              <InputCustom
                value={telefonoAlternativo}
                setValue={setTelefonoAlternativo}
                title="Teléfono Alternativo"
              />
              <InputCustom
                value={referenciaPersonal}
                setValue={setReferenciaPersonal}
                title="Referencia Personal"
              />
              <InputCustom
                value={ocupacion}
                setValue={setOcupacion}
                title="Ocupación"
              />
              <InputCustom
                value={ingresosMensuales}
                setValue={setIngresosMensuales}
                title="Ingresos Mensuales"
                type="number"
              />
              <div className={styles.campo}>
                <label>Estado Civil</label>
                <select
                  value={estadoCivil}
                  onChange={(e) =>
                    setEstadoCivil(e.target.value as EstadoCivil)
                  }
                  className={styles.select}
                >
                  {Object.values(EstadoCivil).map((ec) => (
                    <option key={ec} value={ec}>
                      {ec}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* PROPIETARIO */}
          {tipoUsuario === TipoUsuario.PROPIETARIO && (
            <>
              <InputCustom
                value={cuentaBancaria}
                setValue={setCuentaBancaria}
                title="Cuenta Bancaria"
              />

              <div className={styles.campo}>
                <label>Entidad Financiera</label>
                <select
                  value={banco}
                  onChange={(e) =>
                    setBanco(e.target.value as EntidadFinanciera)
                  }
                  className={styles.select}
                >
                  <option value="">Seleccione un banco</option>
                  {Object.values(EntidadFinanciera).map((entidad) => (
                    <option key={entidad} value={entidad}>
                      {entidad.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.campo}>
                <label>Tipo de Cuenta</label>
                <select
                  value={tipoCuenta}
                  onChange={(e) => setTipoCuenta(e.target.value as TipoCuenta)}
                  className={styles.select}
                >
                  {Object.values(TipoCuenta).map((tc) => (
                    <option key={tc} value={tc}>
                      {tc}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </ModalComponente>
      <Footer />
    </div>
  );
};

export default Usuarios;
