import api from '@/lib/api';

export const vaccinationService = {
  getSchedule(petId) {
    return api.get(`/pets/${petId}/vaccination-plan/schedule/`);
  },
  registerEvent(petId, data) {
    return api.post(`/pets/${petId}/vaccination-events/`, data);
  },
};
