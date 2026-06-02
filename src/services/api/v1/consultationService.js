import api from '@/services/api/v1/api';
import { Consultation } from '@/models/consultation';

export const APPOINTMENTS_BASE = 'appointments/';
export const CONSULTATIONS_BASE = 'consultations/';

export class ConsultationService {
  static async create(appointmentId, consultation) {
    const response = await api.post(
      `${APPOINTMENTS_BASE}${appointmentId}/consultations/`,
      consultation.toApi()
    );

    return Consultation.fromApi(response.data, { appointmentId });
  }

  static async registerSupplies(consultationId, data) {
    const response = await api.post(`${CONSULTATIONS_BASE}${consultationId}/supplies-used/`, data);

    return response.data;
  }
}
