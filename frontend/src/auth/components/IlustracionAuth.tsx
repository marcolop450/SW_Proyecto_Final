import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { LogoErgoCheck } from '../../components/ui/LogoErgoCheck';

export const IlustracionAuth: React.FC = () => {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-1/2 p-8 sm:p-10 bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/50 rounded-l-3xl border-r border-slate-200/80 text-slate-800 overflow-hidden select-none">
      {/* Malla decorativa sutil y gradientes de fondo */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Marca Superior Oficial */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
          <LogoErgoCheck className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900">ErgoCheck AI</span>
          <p className="text-[11px] text-slate-500 font-mono">Telemetría SST & Visión Segura</p>
        </div>
      </div>

      {/* Ilustración Vectorial Técnica de Precisión: Estación de Trabajo Ergonómica & Visión Artificial */}
      <div className="relative z-10 my-auto py-2 flex flex-col items-center">
        <svg
          viewBox="0 0 360 230"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[320px] drop-shadow-md"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="screenGrad" x1="180" y1="34" x2="180" y2="156" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#131E3A" />
            </linearGradient>
            <linearGradient id="spineGrad" x1="180" y1="56" x2="180" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="standGrad" x1="180" y1="156" x2="180" y2="196" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>

          {/* Cono Óptico Difuso de Calibración */}
          <polygon points="180,26 80,186 280,186" fill="#10B981" fillOpacity="0.04" />
          <line x1="180" y1="26" x2="80" y2="186" stroke="#10B981" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
          <line x1="180" y1="26" x2="280" y2="186" stroke="#10B981" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />

          {/* Soporte y Base de Aluminio del Monitor */}
          <rect x="174" y="156" width="12" height="36" rx="2" fill="url(#standGrad)" />
          <ellipse cx="180" cy="192" rx="36" ry="6" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />

          {/* Chasis Curvo del Monitor */}
          <rect x="52" y="30" width="256" height="130" rx="10" fill="#1E293B" stroke="#475569" strokeWidth="2" />
          <rect x="58" y="36" width="244" height="118" rx="7" fill="url(#screenGrad)" />

          {/* Retícula Cartesiana de Telemetría Biomecánica */}
          <line x1="58" y1="65" x2="302" y2="65" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="58" y1="95" x2="302" y2="95" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="58" y1="125" x2="302" y2="125" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="120" y1="36" x2="120" y2="154" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="180" y1="36" x2="180" y2="154" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="240" y1="36" x2="240" y2="154" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3 3" />

          {/* Cuadrante de Reconocimiento y Enfoque Postural */}
          <rect x="136" y="52" width="88" height="84" rx="6" stroke="#10B981" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.85" />
          {/* Marcadores de Esquinas del HUD */}
          <path d="M136 62 V52 H146" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
          <path d="M214 52 H224 V62" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
          <path d="M136 126 V136 H146" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />
          <path d="M214 136 H224 V126" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />

          {/* Curvatura Ergonómica Cervical y Vértebras (C1-T12) */}
          <path
            d="M180 62 C178 72, 185 88, 180 102 C175 116, 178 128, 180 134"
            stroke="url(#spineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Nodos de Inspección Biomecánica */}
          <circle cx="180" cy="62" r="5" fill="#10B981" fillOpacity="0.2" stroke="#34D399" strokeWidth="1.5" />
          <circle cx="180" cy="62" r="2" fill="#FFFFFF" />
          <circle cx="182" cy="84" r="2" fill="#34D399" />
          <circle cx="180" cy="102" r="2.5" fill="#34D399" />
          <circle cx="178" cy="120" r="2" fill="#34D399" />
          <circle cx="180" cy="134" r="3" fill="#10B981" />

          {/* Arco de Medición de Ángulo Cervical (12° Óptimo) */}
          <path d="M180 62 A18 18 0 0 1 194 72" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
          <text x="200" y="70" fill="#38BDF8" fontSize="8" fontFamily="monospace" fontWeight="bold">12° ISO</text>

          {/* Indicadores Técnicos de Pantalla */}
          <rect x="66" y="44" width="52" height="14" rx="3" fill="#0B132B" stroke="#334155" strokeWidth="0.8" />
          <text x="70" y="54" fill="#34D399" fontSize="7.5" fontFamily="monospace" fontWeight="bold">RULA 1.8</text>

          <rect x="238" y="44" width="56" height="14" rx="3" fill="#0B132B" stroke="#334155" strokeWidth="0.8" />
          <text x="242" y="54" fill="#38BDF8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">30 FPS ML</text>

          {/* Sensor de Cámara Cenital Integrado */}
          <rect x="166" y="22" width="28" height="9" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="1" />
          <circle cx="180" cy="26.5" r="2" fill="#10B981" />
          <circle cx="180" cy="26.5" r="4" stroke="#34D399" strokeWidth="0.8" opacity="0.6" />

          {/* Superficie de Trabajo Minimalista */}
          <line x1="40" y1="192" x2="320" y2="192" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Tipografía Editorial sin Cajas Repetitivas */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Telemetría y Procesamiento en el Borde
          </p>
          <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed mx-auto">
            Inferencia local en memoria RAM con descarte inmediato de fotogramas según ISO 11226 y RGPD.
          </p>
        </div>
      </div>

      {/* Pie con Certificaciones y Cumplimiento Técnico */}
      <div className="relative z-10 pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>TLS 1.3 • SHA-256</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>Inferencia Local 30 FPS</span>
        </div>
      </div>
    </div>
  );
};
