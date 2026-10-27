import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { CampoTexto } from '../../components/ui/CampoTexto';
import { Boton } from '../../components/ui/Boton';
import { LogoErgoCheck } from '../../components/ui/LogoErgoCheck';
import { IlustracionAuth } from '../../auth/components/IlustracionAuth';
import { obtenerRutaPorDefecto } from '../../auth/components/RutaProtegidaPorRol';

export const PaginaInicioSesion: React.FC = () => {
  const [correo, setCorreo] = useState('carlos.mendoza@visitask.com');
  const [clave, setClave] = useState('12345');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [recordarme, setRecordarme] = useState(true);
  const [cargando, setCargando] = useState(false);

  const { usuario, iniciarSesion } = useAuth();
  const { mostrarError, mostrarExito } = useNotificacion();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      navigate(obtenerRutaPorDefecto(usuario.rol), { replace: true });
    }
  }, [usuario, navigate]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const sesion = await iniciarSesion(correo, clave);
      mostrarExito('Autenticación validada con firma criptográfica.', 'Sesión Iniciada');
      const destino = obtenerRutaPorDefecto(sesion.rol);
      navigate(destino, { replace: true });
    } catch (err) {
      mostrarError(err, 'Error de autenticación');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarUsuarioRapido = (email: string) => {
    setCorreo(email);
    setClave('12345');
  };

  const rolesQA = [
    { label: 'Admin Org', email: 'carlos.mendoza@visitask.com' },
    { label: 'Super Admin', email: 'manuela@gmail.com' },
    { label: 'Supervisor', email: 'jairo.camacho@visitask.com' },
    { label: 'Empleado', email: 'juan.matienzo@visitask.com' },
    { label: 'Postulante', email: 'candidato.demo@gmail.com' },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] bg-dot-grid bg-ambient-mesh text-slate-800">
      <div className="w-full max-w-[880px] min-h-[520px] lg:h-[540px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row overflow-hidden animate-fade-up">
        {/* Panel Izquierdo: Ilustración Técnica SVG de Estación PC */}
        <IlustracionAuth />

        {/* Panel Derecho: Formulario de Acceso con Dimensiones Fijas */}
        <div className="w-full lg:w-1/2 h-full p-6 sm:p-8 lg:p-9 flex flex-col justify-between overflow-y-auto space-y-5">
          <div className="space-y-5">
            {/* Cabecera Móvil y Título */}
            <div className="space-y-1">
              <div className="lg:hidden flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <LogoErgoCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-900">ErgoCheck AI</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Iniciar Sesión
              </h1>
              <p className="text-xs text-slate-500">
                Ingresa tus credenciales para acceder a la plataforma
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarEnvio} className="space-y-3.5">
              <CampoTexto
                etiqueta="Correo Electrónico"
                type="email"
                icono={Mail}
                placeholder="usuario@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />

              <CampoTexto
                etiqueta="Contraseña"
                type={mostrarClave ? 'text' : 'password'}
                icono={Lock}
                placeholder="••••••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                accionDerecha={
                  <button
                    type="button"
                    onClick={() => setMostrarClave(!mostrarClave)}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
                    aria-label={mostrarClave ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {mostrarClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              {/* Recordarme y Recuperar Contraseña */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={recordarme}
                    onChange={(e) => setRecordarme(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Recordarme</span>
                </label>
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    mostrarExito('Enlace enviado a tu bandeja corporativa.', 'Recuperación');
                  }}
                  className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Boton
                type="submit"
                cargando={cargando}
                icono={ArrowRight}
                className="w-full py-2.5 mt-1"
              >
                Ingresar al Sistema
              </Boton>
            </form>

            {/* Selector Rápido de Roles para Pruebas QA con Cuentas Reales */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Acceso Rápido QA (Clave: 12345):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                {rolesQA.map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => seleccionarUsuarioRapido(item.email)}
                    className={`px-2.5 py-1.5 rounded-lg border text-center transition-all cursor-pointer min-w-0 ${
                      idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      correo === item.email
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-2xs ring-1 ring-emerald-400/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="block truncate font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enlace al Registro */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              ¿No tienes cuenta corporativa?{' '}
              <Link to="/registro" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
