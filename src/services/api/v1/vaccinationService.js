import api from '@/services/api/v1/api';
import { Vaccination } from '@/models/vaccination';

export const PETS_BASE = 'pets/';

export class VaccinationService {
  static async list(petId) {
    const response = await api.get(`${PETS_BASE}${petId}/vaccination-plan/schedule/`);
    const data = response.data;

    return Array.isArray(data)
      ? data.map(item => Vaccination.fromApi(item, petId))
      : data;
  }

  static async create(petId, vaccination) {
    const response = await api.post(`${PETS_BASE}${petId}/vaccination-events/`, vaccination.toApi());

    return Vaccination.fromApi(response.data, petId);
  }
}
