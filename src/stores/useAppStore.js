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

const clone = (value) => value.map((item) => ({ ...item }));

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

    inventory:[
      { id: 1, name: 'Jeringas 5ml', quantity: 150, unitCost: 0.50, status: 'approved' },
      { id: 2, name: 'Vacuna Antirrábica', quantity: 20, unitCost: 15.00, status: 'pending' },
      { id: 3, name: 'Gasas Estériles (Caja)', quantity: 300, unitCost: 5.00, status: 'approved' },
      { id: 4, name: 'Anestesia General (Frasco)', quantity: 5, unitCost: 45.00, status: 'cancelled' } ]

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
    cancelAppointment(id) {
      this.appointments = this.appointments.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' } : item
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
  },
});