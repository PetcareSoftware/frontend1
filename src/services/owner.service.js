import api from '@/lib/api';

export const ownerService = {
  getMe() {
    return api.get('/owners/me/');
  },
  updateMe(data) {
    return api.patch('/owners/me/', data);
  },
  registerPet(data) {
    return api.post('/owners/me/pets/', data);
  },
};
