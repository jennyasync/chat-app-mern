import api from './axios.js';

// The server gates all of these with protect + adminOnly; the UI admin guard is only for UX.

export const getStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

export const listUsers = async ({ q, role, status, page = 1, limit = 20 } = {}) => {
  const { data } = await api.get('/admin/users', {
    params: { q, role, status, page, limit },
  });
  return data;
};

export const getUser = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
};

export const updateUserStatus = async (id, payload) => {
  const { data } = await api.patch(`/admin/users/${id}/status`, payload);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const listReports = async ({ status, targetType, page = 1, limit = 20 } = {}) => {
  const { data } = await api.get('/admin/reports', {
    params: { status, targetType, page, limit },
  });
  return data;
};

export const getReport = async (id) => {
  const { data } = await api.get(`/admin/reports/${id}`);
  return data;
};

export const updateReport = async (id, payload) => {
  const { data } = await api.patch(`/admin/reports/${id}`, payload);
  return data;
};

// The server emits message:deleted, so open chats redact the bubble without extra client work.
export const forceDeleteMessage = async (id) => {
  const { data } = await api.delete(`/admin/messages/${id}`);
  return data;
};

// Every call is recorded in AdminAuditLog on the server.
export const getConversationMessages = async (id, { page = 1, limit = 30 } = {}) => {
  const { data } = await api.get(`/admin/conversations/${id}/messages`, {
    params: { page, limit },
  });
  return data;
};
