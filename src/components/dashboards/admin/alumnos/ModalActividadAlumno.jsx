import { useEffect, useMemo, useState } from 'react';
import { X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useThemeStore from "../../../../stores/useThemeStore";
import { alumnosAPI } from "../../../../services/api";

export default function ModalActividadAlumno({ alumno, onClose }) {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await alumnosAPI.asistencias(alumno.id);

        const raw = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(raw) ? raw : (raw.data || []);
        setItems(list);
      } catch (e) {
        toast.error('Error al cargar asistencias del alumno');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [alumno.id]);

  // Calcula “faltas seguidas” (asumiendo que viene ordenado por fecha desc)
  const faltasSeguidas = useMemo(() => {
    let c = 0;
    for (const it of items) {
      const presente = !!(it.presente ?? it.asistio ?? it.estado === 'presente');
      if (presente) break;
      c++;
    }
    return c;
  }, [items]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-3xl rounded-xl shadow-lg ${
        isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDark ? 'border-slate-800' : 'border-gray-100'
        }`}>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Actividad / Asistencias
            </h3>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {alumno.nombre_completo || alumno.nombre || 'Alumno'} — DNI: {alumno.dni || alumno.documento || '—'}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-slate-800 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* “alerta” visual de faltas seguidas */}
          {faltasSeguidas >= 4 && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              isDark ? 'bg-amber-950 text-amber-200 border border-amber-900'
                     : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              <AlertTriangle size={20} className="mt-0.5" />
              <div>
                <p className="font-semibold">Atención</p>
                <p className="text-sm">
                  Registra <b>{faltasSeguidas}</b> faltas seguidas (según el historial cargado).
                </p>
                <p className="text-xs opacity-80 mt-1">
                  Luego podemos sumar botón “Notificar” (mail / in-app) cuando definamos el endpoint.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : items.length === 0 ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              No hay asistencias registradas para este alumno.
            </p>
          ) : (
            <div className={`rounded-lg overflow-hidden border ${
              isDark ? 'border-slate-800' : 'border-gray-200'
            }`}>
              <table className="min-w-full text-sm">
                <thead className={isDark ? 'bg-slate-800 text-gray-200' : 'bg-gray-50 text-gray-700'}>
                  <tr>
                    <th className="text-left px-4 py-3">Fecha</th>
                    <th className="text-left px-4 py-3">Turno</th>
                    <th className="text-left px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                  {items.map((it, idx) => {
                    const presente = !!(it.presente ?? it.asistio ?? it.estado === 'presente');
                    const fecha = it.fecha || it.dia || it.created_at || '—';
                    const turno = it.turno?.label
                      || (it.turno?.dia_semana ? `${it.turno.dia_semana} ${it.turno.hora_inicio}-${it.turno.hora_fin}` : null)
                      || it.turno_id
                      || '—';

                    return (
                      <tr key={it.id ?? idx} className={isDark ? 'border-t border-slate-800' : 'border-t border-gray-100'}>
                        <td className="px-4 py-3">{fecha}</td>
                        <td className="px-4 py-3">{turno}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                            presente
                              ? (isDark ? 'bg-green-950 text-green-300 border border-green-900' : 'bg-green-100 text-green-700')
                              : (isDark ? 'bg-red-950 text-red-300 border border-red-900' : 'bg-red-100 text-red-700')
                          }`}>
                            {presente ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                            {presente ? 'Presente' : 'Ausente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`px-5 py-4 border-t flex justify-end ${
          isDark ? 'border-slate-800' : 'border-gray-100'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
