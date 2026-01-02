import { useEffect, useMemo, useState } from 'react';
import { Search, Users, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import useThemeStore from "../../../../stores/useThemeStore";
import { alumnosAPI } from "../../../../services/api";

import ModalActividadAlumno from './ModalActividadAlumno';

export default function GestionAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typing, setTyping] = useState('');
  const [q, setQ] = useState('');

  const [alumnoVer, setAlumnoVer] = useState(null);

  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const t = setTimeout(() => setQ(typing.trim()), 350);
    return () => clearTimeout(t);
  }, [typing]);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await alumnosAPI.getAll(q ? { search: q } : undefined);

      // soporta varias formas: {data: []} o {data:{data:[]}}
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : (raw.data || []);
      setAlumnos(list);
    } catch (e) {
      toast.error('Error al cargar alumnos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // filtro local por si backend no filtra con ?search=
  const alumnosFiltrados = useMemo(() => {
    if (!q) return alumnos;
    const needle = q.toLowerCase();
    return alumnos.filter((a) => {
      const nombre = (a?.nombre_completo || a?.nombre || '').toLowerCase();
      const dni = String(a?.dni || a?.documento || '').toLowerCase();
      const email = (a?.email || '').toLowerCase();
      return nombre.includes(needle) || dni.includes(needle) || email.includes(needle);
    });
  }, [alumnos, q]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Alumnos</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {alumnosFiltrados.length} encontrados
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-[520px]">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <Search size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            <input
              value={typing}
              onChange={(e) => setTyping(e.target.value)}
              placeholder="Buscar por nombre, DNI o email…"
              className={`w-full outline-none bg-transparent ${
                isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-800'
              }`}
            />
          </div>

          <button
            onClick={cargar}
            className={`px-3 py-2 rounded-lg border ${
              isDark ? 'border-slate-700 bg-slate-900 text-gray-200 hover:bg-slate-800'
                     : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="Recargar"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {alumnosFiltrados.length === 0 ? (
        <div className={`rounded-lg shadow p-12 text-center ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <Users className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={48} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No hay alumnos para mostrar</p>
        </div>
      ) : (
        <div className={`rounded-lg shadow overflow-hidden ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
        }`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={isDark ? 'bg-slate-800 text-gray-200' : 'bg-gray-50 text-gray-700'}>
                <tr>
                  <th className="text-left px-4 py-3">Alumno</th>
                  <th className="text-left px-4 py-3">DNI</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-right px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                {alumnosFiltrados.map((a) => (
                  <tr key={a.id} className={isDark ? 'border-t border-slate-800' : 'border-t border-gray-100'}>
                    <td className="px-4 py-3 font-medium">{a.nombre_completo || a.nombre || '—'}</td>
                    <td className="px-4 py-3">{a.dni || a.documento || '—'}</td>
                    <td className="px-4 py-3">{a.email || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setAlumnoVer(a)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded ${
                          isDark ? 'bg-blue-900 hover:bg-blue-800 text-blue-300'
                                 : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                        }`}
                      >
                        <Eye size={16} />
                        Ver actividad
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {alumnoVer && (
        <ModalActividadAlumno
          alumno={alumnoVer}
          onClose={() => setAlumnoVer(null)}
        />
      )}
    </div>
  );
}
