import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/ContextoAutenticacion';
import { BarraLateral } from './BarraLateral';
import { BarraNavegacion } from './BarraNavegacion';
import { PantallaConsentimientoPrevio } from '../../pages/consentimiento/PantallaConsentimientoPrevio';

export const PlantillaPrivada: React.FC = () => {
  const { usuario, cargando, tieneConsentimiento } = useAuth();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  if (cargando) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC] text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-500">Cargando plataforma segura...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!tieneConsentimiento) {
    return <PantallaConsentimientoPrevio />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] bg-dot-grid bg-ambient-mesh text-slate-800">
      <BarraLateral
        abiertoEnMovil={menuMovilAbierto}
        alCerrarMovil={() => setMenuMovilAbierto(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <BarraNavegacion alAbrirMovil={() => setMenuMovilAbierto(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
