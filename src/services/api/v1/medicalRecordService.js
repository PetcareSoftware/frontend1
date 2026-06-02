import api from '@/services/api/v1/api';

export const PETS_BASE = 'pets/';

export class MedicalRecordService {
  static async get(petId) {
    const response = await api.get(`${PETS_BASE}${petId}/medical-record/`);

    return response.data;
  }

  static async getSummary(petId) {
    const response = await api.get(`${PETS_BASE}${petId}/medical-record/summary/`);

    return response.data;
  }
}
