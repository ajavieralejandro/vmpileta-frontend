import { useEffect, useMemo, useState } from 'react';
import useThemeStore from '../../../stores/useThemeStore';
import api from '../../../services/api'; // ajustá el path si tu api está en otro lado
import { Plus, Pencil, Ban } from 'lucide-react';

export default function GestionPiletas() {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [editing, setEditing] = useState(null); // {id,nombre,descripcion,activa}

  const items = useMemo(() => {
    // soporta respuesta array o {success,data}
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  }, [raw]);

  const cardClass = isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white';
  const textTitle = isDark ? 'text-white' : 'text-gray-800';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/piletas');
      setRaw(res.data);
    } catch (e) {
      setError('No se pudieron cargar las piletas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      await api.post('/piletas', {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion?.trim() || null,
        activa: true,
      });
      setForm({ nombre: '', descripcion: '' });
      fetchAll();
    } catch (e) {
      setError('No se pudo crear la pileta.');
    }
  };

  const startEdit = (p) => {
    setEditing({
      id: p.id,
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      activa: !!p.activa,
    });
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (!editing.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    try {
      await api.put(`/piletas/${editing.id}`, {
        nombre: editing.nombre.trim(),
        descripcion: editing.descripcion?.trim() || null,
        activa: editing.activa,
      });
      setEditing(null);
      fetchAll();
    } catch (e) {
      setError('No se pudo actualizar la pileta.');
    }
  };

  const onDeactivate = async (p) => {
    if (!confirm(`¿Desactivar "${p.nombre}"?`)) return;

    try {
      await api.delete(`/piletas/${p.id}`); // backend: activa=false
      fetchAll();
    } catch (e) {
      setError('No se pudo desactivar la pileta.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${textTitle}`}>Gestión de Piletas</h2>
        <p className={`mt-1 ${textMuted}`}>
          Alta, edición y desactivación de piletas físicas.
        </p>
      </div>

      {error && (
        <div className={`rounded-lg p-4 border ${isDark ? 'bg-red-950 border-red-900 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {error}
        </div>
      )}

      {/* Crear */}
      <div className={`rounded-lg shadow p-5 ${cardClass}`}>
        <div className="flex items-center gap-2 mb-4">
          <Plus size={18} className={isDark ? 'text-gray-200' : 'text-gray-700'} />
          <h3 className={`font-semibold ${textTitle}`}>Crear pileta</h3>
        </div>

        <form onSubmit={onCreate} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={`text-sm ${textMuted}`}>Nombre</label>
            <input
              className={`mt-1 w-full rounded-lg px-3 py-2 border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Pileta 1"
              value={form.nombre}
              onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))}
            />
          </div>

          <div>
            <label className={`text-sm ${textMuted}`}>Descripción</label>
            <input
              className={`mt-1 w-full rounded-lg px-3 py-2 border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Opcional (ej: techada / olímpica)"
              value={form.descripcion}
              onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 font-medium transition ${
                isDark ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              Crear
            </button>
          </div>
        </form>
      </div>

      {/* Listado */}
      <div className={`rounded-lg shadow ${cardClass}`}>
        <div className="p-5 border-b border-slate-200/10">
          <h3 className={`font-semibold ${textTitle}`}>Listado</h3>
        </div>

        <div className="p-5">
          {loading ? (
            <p className={textMuted}>Cargando...</p>
          ) : items.length === 0 ? (
            <p className={textMuted}>No hay piletas cargadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    <th className="text-left py-2">Nombre</th>
                    <th className="text-left py-2">Descripción</th>
                    <th className="text-left py-2">Activa</th>
                    <th className="text-right py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className={isDark ? 'border-t border-slate-800' : 'border-t border-gray-200'}>
                      <td className={`py-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>{p.nombre}</td>
                      <td className={`py-3 ${textMuted}`}>{p.descripcion || '-'}</td>
                      <td className={`py-3 ${textMuted}`}>{p.activa ? 'Sí' : 'No'}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(p)}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                              isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                          >
                            <Pencil size={16} />
                            Editar
                          </button>

                          <button
                            onClick={() => onDeactivate(p)}
                            disabled={!p.activa}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                              !p.activa
                                ? (isDark ? 'bg-slate-900 text-gray-600' : 'bg-gray-100 text-gray-400')
                                : (isDark ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-red-600 hover:bg-red-700 text-white')
                            }`}
                          >
                            <Ban size={16} />
                            Desactivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal editar */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-lg rounded-xl p-5 shadow ${cardClass}`}>
            <h3 className={`text-xl font-bold ${textTitle}`}>Editar pileta</h3>

            <form onSubmit={onUpdate} className="mt-4 space-y-4">
              <div>
                <label className={`text-sm ${textMuted}`}>Nombre</label>
                <input
                  className={`mt-1 w-full rounded-lg px-3 py-2 border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={editing.nombre}
                  onChange={(e) => setEditing((s) => ({ ...s, nombre: e.target.value }))}
                />
              </div>

              <div>
                <label className={`text-sm ${textMuted}`}>Descripción</label>
                <input
                  className={`mt-1 w-full rounded-lg px-3 py-2 border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={editing.descripcion}
                  onChange={(e) => setEditing((s) => ({ ...s, descripcion: e.target.value }))}
                />
              </div>

              <label className={`flex items-center gap-2 ${textMuted}`}>
                <input
                  type="checkbox"
                  checked={editing.activa}
                  onChange={(e) => setEditing((s) => ({ ...s, activa: e.target.checked }))}
                />
                Activa
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className={`${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} rounded-lg px-4 py-2 font-medium`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg px-4 py-2 font-medium"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
