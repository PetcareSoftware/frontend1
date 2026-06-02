import api from '@/services/api/v1/api';

export const WAITING_LIST_BASE = 'waiting-list/';

export class WaitingListService {
  static async list() {
    const response = await api.get(WAITING_LIST_BASE);

    return response.data;
  }

  static async callNext(id) {
    const response = await api.post(`${WAITING_LIST_BASE}${id}/call-next/`);

    return response.data;
  }
}
