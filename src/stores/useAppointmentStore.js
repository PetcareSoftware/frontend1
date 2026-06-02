import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAppStore } from './useAppStore';
import { AppointmentService } from '@/services/api/v1/appointmentService';
import { appointments as seedAppointments } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


export const useAppointmentStore = defineStore('appointment', () => {
  const appStore = useAppStore();


  // State

  const appointments = ref([]);
  const selectedId = ref(null);
  const status = ref({
    loading: false, loadingOne: false, sendingOne: false
  });
  const lock = ref(null);


  // Getters

  const selected = computed(() => {
    return getSelectedById(selectedId.value, getFromStore);
  });
  const locked = computed(() => {
    return getLocked(status.value);
  });


  // Extra

  watch(locked, getLockWatcher(lock), { flush: 'sync' });


  // Actions

  async function get(id) {
    let appointment = getFromStore(id);

    if (!appointment) {
      appointment = await fetchOne(id);
    }

    return appointment;
  }

  async function fetchOne(id) {
    status.value.loadingOne = true;
    try {
      const newAppointment = USE_MOCK_DATA
        ? seedAppointments.find(a => a.id === id)
        : await AppointmentService.get(id);

      if (!newAppointment) return;

      saveInStore(newAppointment);

      return newAppointment;
    } finally {
      status.value.loadingOne = false;
    }
  }

  async function fetchAll() {
    status.value.loading = true;
    try {
      const newAppointments = USE_MOCK_DATA
        ? seedAppointments.filter(a => a.ownerId === appStore.currentUserId)
        : await AppointmentService.list();

      if (!newAppointments) return;

      appointments.value = newAppointments;

      return newAppointments;
    } finally {
      status.value.loading = false;
    }
  }

  async function fetchToday() {
    status.value.loading = true;
    try {
      const newAppointments = USE_MOCK_DATA
        ? seedAppointments
        : await AppointmentService.listToday();

      if (!newAppointments) return;

      appointments.value = newAppointments;

      return newAppointments;
    } finally {
      status.value.loading = false;
    }
  }

  async function add(newAppointment) {
    status.value.sendingOne = true;
    try {
      if (USE_MOCK_DATA) {
        if (seedAppointments.find(a => a.equals(newAppointment))) {
          throw new Error('Esta cita ya existe');
        }
        seedAppointments.push(newAppointment);
      } else {
        newAppointment = await AppointmentService.create(newAppointment);
      }

      saveInStore(newAppointment);

      return newAppointment;
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function update(newAppointment) {
    status.value.sendingOne = true;
    try {
      if (USE_MOCK_DATA) {
        const oldIndex = findReplace(seedAppointments, a => a.id === newAppointment.id, newAppointment);
        if (oldIndex < 0) {
          throw new Error('Esta cita no existe');
        }
      } else {
        await AppointmentService.confirm(newAppointment.id);
      }

      saveInStore(newAppointment);

      return newAppointment;
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function cancel(id) {
    status.value.sendingOne = true;
    try {
      if (USE_MOCK_DATA) {
        const appointment = seedAppointments.find(a => a.id === id);
        if (!appointment) throw new Error('Esta cita no existe');
        appointment.status = 'cancelled';
        saveInStore({ ...appointment });
      } else {
        await AppointmentService.cancel(id);
        const appointment = getFromStore(id);
        if (appointment) saveInStore({ ...appointment, status: 'cancelled' });
      }
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function confirm(id) {
    status.value.sendingOne = true;
    try {
      if (USE_MOCK_DATA) {
        const appointment = seedAppointments.find(a => a.id === id);
        if (!appointment) throw new Error('Esta cita no existe');
        appointment.status = 'confirmed';
        saveInStore({ ...appointment });
      } else {
        await AppointmentService.confirm(id);
        const appointment = getFromStore(id);
        if (appointment) saveInStore({ ...appointment, status: 'confirmed' });
      }
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function checkIn(id) {
    status.value.sendingOne = true;
    try {
      if (USE_MOCK_DATA) {
        const appointment = seedAppointments.find(a => a.id === id);
        if (!appointment) throw new Error('Esta cita no existe');
        appointment.status = 'waiting';
        saveInStore({ ...appointment });
      } else {
        await AppointmentService.checkIn(id);
        const appointment = getFromStore(id);
        if (appointment) saveInStore({ ...appointment, status: 'waiting' });
      }
    } finally {
      status.value.sendingOne = false;
    }
  }

  function getFromStore(id) {
    return appointments.value.find(a => a.id === id);
  }

  function saveInStore(newAppointment) {
    const oldIndex = findReplace(appointments.value, a => a.id === newAppointment.id, newAppointment);
    if (oldIndex < 0) {
      appointments.value.push(newAppointment);
    }
  }


  return {
    appointments, selectedId, status, lock,
    selected, locked,
    get, fetchOne, fetchAll, fetchToday, add, update, cancel, confirm, checkIn,
    getFromStore, saveInStore,
  };
});
