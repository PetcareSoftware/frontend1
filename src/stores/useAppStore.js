import { defineStore } from 'pinia';
import { appTemplate } from '@/config/appTemplate';
import {
  vets as seedVets,
  owners as seedOwners,
  pets as seedPets,
  appointments as seedAppointments,
  consultations as seedConsultations,
  vaccines as seedVaccines,
  dewormings as seedDewormings,
} from '@/data/mockData';

const shiftDate = (dateStr) => {
  if (!dateStr) return dateStr;
  const base = new Date('2026-05-08T12:00:00').getTime();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = today.getTime() - base;
  const d = new Date(dateStr + 'T12:00:00');
  d.setTime(d.getTime() + diff);
  return d.toISOString().slice(0, 10);
};

const mapDates = (item) => {
  const newItem = { ...item };
  if (newItem.date) newItem.date = shiftDate(newItem.date);
  if (newItem.nextDate) newItem.nextDate = shiftDate(newItem.nextDate);
  if (newItem.birthDate) newItem.birthDate = shiftDate(newItem.birthDate);
  if (newItem.createdAt) newItem.createdAt = shiftDate(newItem.createdAt);
  if (newItem.followUpDate) newItem.followUpDate = shiftDate(newItem.followUpDate);
  return newItem;
};

const clone = (value) => value.map((item) => mapDates({ ...item }));

export const useAppStore = defineStore('app', {
  state: () => ({
    role: 'owner',
    currentUserId: 'o1',
    vets: clone(seedVets),
    owners: clone(seedOwners),
    pets: clone(seedPets),
    appointments: clone(seedAppointments),
    consultations: clone(seedConsultations),
    vaccines: clone(seedVaccines),
    dewormings: clone(seedDewormings),
    notifications: [],
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
    addOwner(owner) {
      this.owners.push(owner);
    },
    updateOwner(owner) {
      this.owners = this.owners.map((item) => (item.id === owner.id ? owner : item));
    },
    addPet(pet) {
      this.pets.push(pet);
    },
    updatePet(pet) {
      this.pets = this.pets.map((item) => (item.id === pet.id ? pet : item));
    },
    addAppointment(appointment) {
      this.appointments.push(appointment);
    },
    updateAppointment(appointment) {
      this.appointments = this.appointments.map((item) =>
        item.id === appointment.id ? appointment : item
      );
    },
    cancelAppointment(id, cancelReason = '') {
      this.appointments = this.appointments.map((item) =>
        item.id === id ? { ...item, status: 'cancelled', cancelReason } : item
      );
      this.addNotification({
        title: 'Cita cancelada',
        description: `La cita ha sido cancelada${cancelReason ? ' (' + cancelReason + ')' : ''}.`,
        type: 'info',
        date: new Date().toISOString()
      });
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
