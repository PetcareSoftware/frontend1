import { defineStore } from 'pinia';
import { appTemplate } from '@/config/appTemplate';
import { ownerService } from '@/services/owner.service';
import { vetService } from '@/services/vet.service';
import { appointmentService } from '@/services/appointment.service';
import { notificationService } from '@/services/notification.service';
import { medicalRecordService } from '@/services/medicalRecord.service';

export const useAppStore = defineStore('app', {
  state: () => ({
    role: 'owner',
    currentUserId: 'o1',
    vets: [],
    owners: [],
    pets: [],
    appointments: [],
    consultations: [],
    vaccines: [],
    dewormings: [],
    notifications: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    currentOwner(state) {
      return state.owners.find((owner) => owner.id === state.currentUserId) || null;
    },
    roleInfo(state) {
      return appTemplate.roles[state.role];
    },
    roleNavigation(state) {
      return appTemplate.navigation[state.role];
    },
  },
  actions: {
    setRole(role, userId = undefined) {
      this.role = role;
      if (userId !== undefined) {
        this.currentUserId = userId;
      }
    },
    
    // Asynchronous API Actions (Non-Auth)
    async fetchProfile() {
      this.isLoading = true;
      try {
        const response = await ownerService.getMe();
        // Assume response.data is the owner profile with a 'pets' array
        const profile = response.data;
        this.updateOwner(profile);
        if (profile.pets) {
          this.pets = profile.pets;
        }
      } catch (err) {
        this.error = err.response?.data?.detail || err.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchVetsCalendar(from, to) {
      this.isLoading = true;
      try {
        const response = await vetService.getCalendar(from, to);
        // Map the backend format to the expected state format
        // This is a placeholder; you'll need to adapt it to your components
        this.vets = response.data.vets || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchAppointments() {
      this.isLoading = true;
      try {
        // Here we could fetch all appointments or just today depending on context.
        // Assuming we want today's for the dashboard
        const response = await appointmentService.getTodayAppointments({});
        this.appointments = response.data.results || response.data || [];
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async addAppointment(appointmentData) {
      this.isLoading = true;
      try {
        const response = await appointmentService.scheduleAppointment(appointmentData);
        this.appointments.push(response.data);
        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async cancelAppointmentAPI(id, cancelReason = '') {
      this.isLoading = true;
      try {
        await appointmentService.cancelAppointment(id, cancelReason);
        this.appointments = this.appointments.map((item) =>
          item.id === id ? { ...item, status: 'CANCELLED', cancellation_reason: cancelReason } : item
        );
        this.addNotification({
          title: 'Cita cancelada',
          description: `La cita ha sido cancelada${cancelReason ? ' (' + cancelReason + ')' : ''}.`,
          type: 'info',
          date: new Date().toISOString()
        });
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Fallback synchronous methods for state updates
    addOwner(owner) {
      this.owners.push(owner);
    },
    updateOwner(owner) {
      if (!this.owners.find(o => o.id === owner.id)) {
        this.owners.push(owner);
      } else {
        this.owners = this.owners.map((item) => (item.id === owner.id ? owner : item));
      }
    },
    addPet(pet) {
      this.pets.push(pet);
    },
    updatePet(pet) {
      this.pets = this.pets.map((item) => (item.id === pet.id ? pet : item));
    },
    updateAppointment(appointment) {
      this.appointments = this.appointments.map((item) =>
        item.id === appointment.id ? appointment : item
      );
    },
    cancelAppointment(id, cancelReason = '') {
      // Synchronous version kept for backwards compatibility during migration
      this.appointments = this.appointments.map((item) =>
        item.id === id ? { ...item, status: 'cancelled', cancelReason } : item
      );
    },
    addConsultation(consultation) {
      this.consultations.push(consultation);
    },
    addVaccine(vaccine) {
      this.vaccines.push(vaccine);
    },
    addDeworming(deworming) {
      this.dewormings.push(deworming);
    },
    addNotification(notification) {
      this.notifications.unshift({
        id: `n${Date.now()}`,
        read: false,
        ...notification
      });
    },
    markNotificationAsRead(id) {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.read = true;
    },
  },
});
