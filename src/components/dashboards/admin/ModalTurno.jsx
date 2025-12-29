import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { turnosAdminAPI, profesoresAPI, nivelesAPI, piletasAPI } from '../../../services/api';
import toast from 'react-hot-toast';

export default function ModalTurno({ turno, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [profesores, setProfesores] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [piletas, setPiletas] = useState([]);

  const [form, setForm] = useState({
    profesor_id: '',
    nivel_id: '',
    pileta_id: '',
    hora_inicio: '',
    hora_fin: '',
    cupo_maximo: '15',
    dia_semana: 'lunes',
  });

  // Generar clases (solo en edición)
  const [gen, setGen] = useState({ fecha_desde: '', fecha_hasta: '' });
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (turno) {
      setForm({
        profesor_id: turno.profesor?.id || '',
        nivel_id: turno.nivel?.id || '',
        pileta_id: turno.pileta?.id || '',
        hora_inicio: turno.hora_inicio || '',
        hora_fin: turno.hora_fin || '',
        cupo_maximo: turno.cupo_maximo || '15',
        dia_semana: turno.dia_semana || 'lunes',
      });
    } else {
      setForm({
        profesor_id: '',
        nivel_id: '',
        pileta_id: '',
        hora_inicio: '',
        hora_fin: '',
        cupo_maximo: '15',
        dia_semana: 'lunes',
      });
      setGen({ fecha_desde: '', fecha_hasta: '' });
    }
  }, [turno]);

  const cargarDatos = async () => {
    try {
      const [profResponse, nivResponse, pilResponse] = await Promise.all([
        profesoresAPI.getAll(),
        nivelesAPI.getAll(),
        piletasAPI.getAll(),
      ]);

      setProfesores(profResponse.data?.data || []);
      setNiveles(nivResponse.data?.data || []);

      // ✅ Soporta ambos formatos:
      // - array pelado: [{...}]
      // - objeto: { success: true, data: [...] }
      const pilData = pilResponse.data;
      const listaPiletas = Array.isArray(pilData) ? pilData : (pilData?.data || []);
      setPiletas(listaPiletas);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...form,
        profesor_id: parseInt(form.profesor_id, 10),
        nivel_id: form.nivel_id ? parseInt(form.nivel_id, 10) : null,
        pileta_id: parseInt(form.pileta_id, 10),
        cupo_maximo: parseInt(form.cupo_maximo, 10),
      };

      if (turno) {
        await turnosAdminAPI.update(turno.id, data);
        toast.success('Turno actualizado');
      } else {
        await turnosAdminAPI.create(data);
        toast.success('Turno creado');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarClases = async () => {
    if (!turno?.id) return;

    if (!gen.fecha_desde || !gen.fecha_hasta) {
      toast.error('Completá fecha desde y hasta');
      return;
    }

    setGenLoading(true);
    try {
      await turnosAdminAPI.generarClases(turno.id, {
        fecha_desde: gen.fecha_desde,
        fecha_hasta: gen.fecha_hasta,
      });
      toast.success('Clases generadas');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al generar clases');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {turno ? 'Editar Turno' : 'Nuevo Turno'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pileta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pileta *</label>
            <select
              value={form.pileta_id}
              onChange={(e) => setForm({ ...form, pileta_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar pileta</option>
              {piletas.map((p) => (
                <option key={p.id} value={p.id}>
                  {/* ✅ activa viene como 1/0 (number) en tu API */}
                  {p.nombre} {Number(p.activa) === 0 ? '(inactiva)' : ''}
                </option>
              ))}
            </select>

            <p className="text-xs text-gray-500 mt-1">
              El backend valida solapamientos por pileta + día + horario.
            </p>
          </div>

          {/* Profesor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesor *</label>
            <select
              value={form.profesor_id}
              onChange={(e) => setForm({ ...form, profesor_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar profesor</option>
              {profesores.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              value={form.nivel_id}
              onChange={(e) => setForm({ ...form, nivel_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin nivel específico</option>
              {niveles.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>
                  {nivel.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Día */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana *</label>
            <select
              value={form.dia_semana}
              onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="lunes">Lunes</option>
              <option value="martes">Martes</option>
              <option value="miercoles">Miércoles</option>
              <option value="jueves">Jueves</option>
              <option value="viernes">Viernes</option>
              <option value="sabado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio *</label>
              <input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin *</label>
              <input
                type="time"
                value={form.hora_fin}
                onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Cupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cupo máximo *</label>
            <input
              type="number"
              value={form.cupo_maximo}
              onChange={(e) => setForm({ ...form, cupo_maximo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max="50"
              required
            />
          </div>

          {/* Generar clases (solo si existe turno) */}
          {turno?.id && (
            <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Generar clases (por rango)</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    value={gen.fecha_desde}
                    onChange={(e) => setGen((s) => ({ ...s, fecha_desde: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={gen.fecha_hasta}
                    onChange={(e) => setGen((s) => ({ ...s, fecha_hasta: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerarClases}
                disabled={genLoading}
                className="mt-3 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
              >
                {genLoading ? 'Generando...' : 'Generar clases'}
              </button>

              <p className="text-xs text-gray-500 mt-2">
                Crea las clases que coinciden con el día del turno dentro del rango. No duplica (unique turno+fecha).
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
