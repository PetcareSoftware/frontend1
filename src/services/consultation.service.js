import api from '@/lib/api';

export const consultationService = {
  registerSupplies(id, data) {
    return api.post(`/consultations/${id}/supplies-used/`, data);
  },
};
