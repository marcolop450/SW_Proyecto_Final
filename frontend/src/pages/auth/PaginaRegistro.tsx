import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/ContextoAutenticacion';
import { useNotificacion } from '../../context/ContextoNotificacion';
import { CampoTexto } from '../../components/ui/CampoTexto';
import { Boton } from '../../components/ui/Boton';
import { LogoErgoCheck } from '../../components/ui/LogoErgoCheck';
import { IlustracionAuth } from '../../auth/components/IlustracionAuth';
import { obtenerRutaPorDefecto } from '../../auth/components/RutaProtegidaPorRol';

export const PaginaRegistro: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [organizacionNombre, setOrganizacionNombre] = useState('');
  const [cargando, setCargando] = useState(false);

  const { registrar } = useAuth();
  const { mostrarError, mostrarExito } = useNotificacion();
  const navigate = useNavigate();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const sesion = await registrar({
        nombre,
        apellido,
        correo,
        clave,
        organizacionNombre: organizacionNombre.trim() || undefined,
      });
      mostrarExito('Organización y cuenta creadas exitosamente.', 'Registro Completado');
      const destino = obtenerRutaPorDefecto(sesion.rol);
      navigate(destino, { replace: true });
    } catch (err) {
      mostrarError(err, 'Error en el registro');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC] bg-dot-grid bg-ambient-mesh text-slate-800">
      <div className="w-full max-w-[880px] min-h-[520px] lg:h-[540px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row overflow-hidden animate-fade-up">
        {/* Panel Izquierdo: Ilustración Técnica SVG de Estación PC */}
        <IlustracionAuth />

        {/* Panel Derecho: Formulario de Registro con Dimensiones Fijas */}
        <div className="w-full lg:w-1/2 h-full p-6 sm:p-8 lg:p-9 flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            {/* Cabecera Móvil y Título */}
            <div className="space-y-1">
              <div className="lg:hidden flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <LogoErgoCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-900">ErgoCheck AI</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Crear Organización
              </h1>
              <p className="text-xs text-slate-500">
                Despliega telemetría y salud ergonómica para tu empresa
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={manejarEnvio} className="space-y-3">
              <CampoTexto
                etiqueta="Nombre de la Organización"
                type="text"
                icono={Building2}
                placeholder="Ej: Soluciones Tecnológicas S.A."
                value={organizacionNombre}
                onChange={(e) => setOrganizacionNombre(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-2.5">
                <CampoTexto
                  etiqueta="Nombre"
                  type="text"
                  icono={User}
                  placeholder="Carlos"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <CampoTexto
                  etiqueta="Apellido"
                  type="text"
                  placeholder="Mendoza"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                />
              </div>

              <CampoTexto
                etiqueta="Correo Corporativo"
                type="email"
                icono={Mail}
                placeholder="admin@empresa.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />

              <CampoTexto
                etiqueta="Contraseña"
                type={mostrarClave ? 'text' : 'password'}
                icono={Lock}
                placeholder="Mínimo 5 caracteres"
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

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Al registrarte se crea un tenant aislado con cifrado conforme a ISO 45001 y RGPD.
                </span>
              </div>

              <Boton
                type="submit"
                cargando={cargando}
                icono={ArrowRight}
                className="w-full py-2.5 mt-1"
              >
                Crear Cuenta Corporativa
              </Boton>
            </form>
          </div>

          {/* Enlace al Login */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              ¿Ya tienes cuenta corporativa?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
