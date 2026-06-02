import api from '@/services/api/v1/api';
import { Appointment } from '@/models/appointment';

export const APPOINTMENTS_BASE = 'appointments/';

export class AppointmentService {
  static async list() {
    const response = await api.get(APPOINTMENTS_BASE);
    const data = response.data;

    return Array.isArray(data)
      ? data.map(item => Appointment.fromApi(item))
      : data;
  }

  static async get(id) {
    const response = await api.get(`${APPOINTMENTS_BASE}${id}/`);

    return Appointment.fromApi(response.data);
  }

  static async create(appointment) {
    const response = await api.post(APPOINTMENTS_BASE, appointment.toApi());

    return Appointment.fromApi(response.data);
  }

  static async listToday() {
    const response = await api.get(`${APPOINTMENTS_BASE}today/`);
    const data = response.data;

    return Array.isArray(data)
      ? data.map(item => Appointment.fromApi(item))
      : data;
  }

  static async listTodayByVet(vetId) {
    const response = await api.get(`${APPOINTMENTS_BASE}today/by-vet/${vetId}/`);
    const data = response.data;

    return Array.isArray(data)
      ? data.map(item => Appointment.fromApi(item))
      : data;
  }

  static async cancel(id) {
    const response = await api.post(`${APPOINTMENTS_BASE}${id}/cancel/`);

    return response.data;
  }

  static async confirm(id) {
    const response = await api.post(`${APPOINTMENTS_BASE}${id}/confirm/`);

    return response.data;
  }

  static async checkIn(id) {
    const response = await api.post(`${APPOINTMENTS_BASE}${id}/check-in/`);

    return response.data;
  }
}
