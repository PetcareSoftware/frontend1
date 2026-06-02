import api from '@/services/api/v1/api';

export const NOTIFICATIONS_BASE = 'notifications/';

export class NotificationService {
  static async list(params) {
    const response = await api.get(NOTIFICATIONS_BASE, { params });

    return response.data;
  }

  static async markAsRead(id) {
    const response = await api.patch(`${NOTIFICATIONS_BASE}${id}/read/`);

    return response.data;
  }

  static async markAllAsRead() {
    const response = await api.patch(`${NOTIFICATIONS_BASE}read-all/`);

    return response.data;
  }
}
