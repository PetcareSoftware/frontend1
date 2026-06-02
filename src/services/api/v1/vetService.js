import api from '@/services/api/v1/api';

export const VETS_BASE = 'vets/';
export const SCHEDULES_BASE = 'schedules/';

export class VetService {
  static async getSlots(vetId, date) {
    const params = date ? { date } : {};
    const response = await api.get(`${VETS_BASE}${vetId}/slots/`, { params });

    return response.data;
  }

  static async getCalendar(from, to) {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const response = await api.get(`${SCHEDULES_BASE}calendar/`, { params });

    return response.data;
  }
}
