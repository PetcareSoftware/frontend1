import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { ConsultationService } from '@/services/api/v1/consultationService';
import { consultations as seedConsultations } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


export const useConsultationStore = defineStore('consultation', () => {


  // State

  const consultations = ref([]);
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
    let consultation = getFromStore(id);

    if (!consultation) {
      consultation = await fetchOne(id);
    }

    return consultation;
  }

  async function fetchOne(id) {
    const found = USE_MOCK_DATA
      ? seedConsultations.find(c => c.id === id)
      : null;

    if (!found) return;

    saveInStore(found);

    return found;
  }

  async function fetchAll(petId) {
    const newConsultations = USE_MOCK_DATA
      ? (petId ? seedConsultations.filter(c => c.petId === petId) : seedConsultations)
      : null;

    if (!newConsultations) return;

    consultations.value = newConsultations;

    return newConsultations;
  }

  async function add(appointmentId, newConsultation) {
    if (USE_MOCK_DATA) {
      seedConsultations.push(newConsultation);
    } else {
      newConsultation = await ConsultationService.create(appointmentId, newConsultation);
    }

    saveInStore(newConsultation);

    return newConsultation;
  }

  function getFromStore(id) {
    return consultations.value.find(c => c.id === id);
  }

  function saveInStore(newConsultation) {
    const oldIndex = findReplace(
      consultations.value,
      c => c.id === newConsultation.id,
      newConsultation
    );
    if (oldIndex < 0) {
      consultations.value.push(newConsultation);
    }
  }


  return {
    consultations, selectedId, status, lock,
    selected, locked,
    get, fetchOne, fetchAll, add, getFromStore, saveInStore,
  };
});
