import api from '@/lib/api';

export const medicalRecordService = {
  getSummary(petId) {
    return api.get(`/pets/${petId}/medical-record/summary/`);
  },
  getCompleteRecord(petId) {
    return api.get(`/pets/${petId}/medical-record/`);
  },
};
