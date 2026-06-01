import api from './api';

const ALERTS_BASE = 'alerts/';

/**
 * Insumos en estado crítico (stock bajo / vencimiento próximo).
 * @param {Record<string, unknown>} params - filtros opcionales del backend (ej. severity, category)
 */
export async function listCriticalAlerts(params = {}) {
  const response = await api.get(ALERTS_BASE, { params });
  return response.data;
}
