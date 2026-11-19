import { Camera, Sun, UserRound } from 'lucide-react';

export function InstruccionesCalibracion() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Sigue estos pasos</h3>
        <ol className="mt-3 space-y-4 text-sm text-slate-600">
          <li className="flex gap-3"><UserRound className="h-5 w-5 shrink-0 text-emerald-600" /><span><strong className="block text-slate-800">Siéntate cómodamente</strong>Coloca tu rostro y hombros dentro de la imagen.</span></li>
          <li className="flex gap-3"><Sun className="h-5 w-5 shrink-0 text-emerald-600" /><span><strong className="block text-slate-800">Busca buena iluminación</strong>Evita cubrir la cámara o sentarte a contraluz.</span></li>
          <li className="flex gap-3"><Camera className="h-5 w-5 shrink-0 text-emerald-600" /><span><strong className="block text-slate-800">Quédate en el centro</strong>Cuando estés listo, mantén la postura durante 3 segundos.</span></li>
        </ol>
      </div>
      <p className="border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">La imagen se procesa en tu navegador para comprobar tu posición.</p>
    </div>
  );
}
