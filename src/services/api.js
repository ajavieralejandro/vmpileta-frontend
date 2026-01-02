import axios from 'axios';

const API_BASE_URL = 'https://vmpiletas.surtekbb.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  login: (dni, password) => api.post('/login', { dni, password }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// TURNOS
export const turnosAPI = {
  getAll: (params) => api.get('/turnos', { params }),
  getById: (id) => api.get(`/turnos/${id}`),
  getPorDias: (dias) => api.get('/turnos', { params: { dias: dias.join(',') } }),
  getInscripciones: (turnoId) => api.get(`/turnos/${turnoId}/inscripciones`),
  getClases: (turnoId) => api.get(`/turnos/${turnoId}/clases`),
  getPorNiveles: () => api.get('/turnos/por-niveles'),
};

// INSCRIPCIONES
export const inscripcionesAPI = {
  crear: (data) => api.post('/inscripciones', data),
  eliminar: (id) => api.delete(`/inscripciones/${id}`),

  // Devuelve la response de axios (para debug o si necesitás el payload completo)
  getPorTurnoRaw: (turnoId) => api.get(`/turnos/${turnoId}/inscripciones`),

  // Devuelve SIEMPRE array (ideal para UI)
  getPorTurno: async (turnoId) => {
    const res = await api.get(`/turnos/${turnoId}/inscripciones`);
    const lista =
      res?.data?.data?.inscripciones ??
      res?.data?.inscripciones ??
      res?.data?.data ??
      res?.data ??
      [];
    return Array.isArray(lista) ? lista : [];
  },

  // Devuelve { turno, inscripciones }
  getPorTurnoDetallado: async (turnoId) => {
    const res = await api.get(`/turnos/${turnoId}/inscripciones`);
    const data = res?.data?.data ?? {};
    return {
      turno: data?.turno ?? null,
      inscripciones: Array.isArray(data?.inscripciones) ? data.inscripciones : [],
    };
  },
};

// ALUMNOS
export const alumnosAPI = {
    getAll: (params) => api.get('/alumnos', { params }),

  crear: (data) => api.post('/alumnos', data),
  buscar: (query) => api.get('/alumnos', { params: { search: query } }),
  getInasistentes: () => api.get('/alumnos/inasistentes'),
};

// ASISTENCIAS
export const asistenciasAPI = {
  registrar: (claseId, asistencias) => api.post(`/clases/${claseId}/asistencias`, { asistencias }),
  getPorTurno: (turnoId, mes, anio) => api.get(`/turnos/${turnoId}/asistencias`, { params: { mes, anio } }),
};

// CAMBIOS NIVEL
export const cambiosNivelAPI = {
  getPendientes: () => api.get('/cambios-nivel/pendientes'),
  sugerir: (data) => api.post('/cambios-nivel', data),
  aprobar: (id) => api.post(`/cambios-nivel/${id}/aprobar`),
  rechazar: (id) => api.post(`/cambios-nivel/${id}/rechazar`),
};

// PASES LIBRE
export const pasesLibreAPI = {
  getTurnosDisponibles: (fecha) => api.get('/pases-libre/disponibles', { params: { fecha } }),
  reservar: (turnoId, fecha) => api.post('/pases-libre', { turno_id: turnoId, fecha }),
  getMisReservas: () => api.get('/pases-libre/mis-reservas'),
  cancelar: (id) => api.delete(`/pases-libre/${id}`),
};

// ESTADO CUENTA
export const estadoCuentaAPI = {
  getMiEstado: () => api.get('/mi-estado-cuenta'),
  getMovimientos: () => api.get('/mi-estado-cuenta/movimientos'),
};

// NOTIFICACIONES
export const notificacionesAPI = {
  getAll: () => api.get('/notificaciones'),
  contarNoLeidas: () => api.get('/notificaciones/no-leidas'),
  marcarLeida: (id) => api.put(`/notificaciones/${id}/leida`),
  marcarTodasLeidas: () => api.put('/notificaciones/marcar-todas-leidas'),
  eliminar: (id) => api.delete(`/notificaciones/${id}`),
  limpiarLeidas: () => api.delete('/notificaciones/limpiar-leidas'),
};

// PROFESORES
export const profesoresAPI = {
  getAll: () => api.get('/profesores'),
  create: (data) => api.post('/profesores', data),
  update: (id, data) => api.put(`/profesores/${id}`, data),
  delete: (id) => api.delete(`/profesores/${id}`),
};

// NIVELES
export const nivelesAPI = {
  getAll: () => api.get('/niveles'),
  create: (data) => api.post('/niveles', data),
  update: (id, data) => api.put(`/niveles/${id}`, data),
  delete: (id) => api.delete(`/niveles/${id}`),
};

// PILETAS
export const piletasAPI = {
  getAll: () => api.get('/piletas'),
  create: (data) => api.post('/piletas', data),
  update: (id, data) => api.put(`/piletas/${id}`, data),
  delete: (id) => api.delete(`/piletas/${id}`),
};

// TURNOS ADMIN
export const turnosAdminAPI = {
  create: (data) => api.post('/turnos', data),
  update: (id, data) => api.put(`/turnos/${id}`, data),
  patch: (id, data) => api.patch(`/turnos/${id}`, data),
  delete: (id) => api.delete(`/turnos/${id}`),
  generarClases: (turnoId, payload) => api.post(`/turnos/${turnoId}/generar-clases`, payload),
  getClases: (turnoId) => api.get(`/turnos/${turnoId}/clases`),
    toggleActivo: (id) => api.patch(`/turnos/${id}/toggle-activo`),

};

// EXPORTS
export const exportsAPI = {
  inscriptosTurnoExcel: (turnoId) => api.get(`/turnos/${turnoId}/inscriptos/excel`, { responseType: 'blob' }),
};

export default api;
