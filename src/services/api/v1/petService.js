import api from './api';
import { Pet } from '@/models/pet';

export const PETS_BASE = 'pets/';
export const OWNER_PETS_BASE = 'owners/me/pets/';

export class PetService {
  static async list() {
    const response = await api.get(OWNER_PETS_BASE);
    const data = response.data;

    return Array.isArray(data)
      ? data.map(item => Pet.fromApi(item))
      : data;
  }

  static async get(id) {
    const response = await api.get(`${PETS_BASE}${id}/`);

    return Pet.fromApi(response.data);
  }

  static async create(pet) {
    const response = await api.post(OWNER_PETS_BASE, pet.toApi());

    return Pet.fromApi(response.data);
  }

  static async update(pet) {
    const response = await api.patch(`${PETS_BASE}${pet.id}/`, pet.toApiUpdate());

    return Pet.fromApi(response.data);
  }

  static async delete(id) {
    const response = await api.delete(`${PETS_BASE}${id}/`);

    return response.data;
  }
}
