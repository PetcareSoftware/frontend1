import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { VetService } from '@/services/api/v1/vetService';
import { vets as seedVets } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


export const useVetStore = defineStore('vet', () => {


  // State

  const vets = ref([]);
  const selectedId = ref(null);
  const slots = ref([]);
  const status = ref({
    loading: false, loadingOne: false
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
    let vet = getFromStore(id);

    if (!vet) {
      vet = await fetchOne(id);
    }

    return vet;
  }

  async function fetchOne(id) {
    status.value.loadingOne = true;
    try {
      const found = USE_MOCK_DATA
        ? seedVets.find(v => v.id === id)
        : null;

      if (!found) return;

      saveInStore(found);

      return found;
    } finally {
      status.value.loadingOne = false;
    }
  }

  async function fetchAll() {
    status.value.loading = true;
    try {
      const newVets = USE_MOCK_DATA
        ? seedVets
        : null;

      if (!newVets) return;

      vets.value = newVets;

      return newVets;
    } finally {
      status.value.loading = false;
    }
  }

  async function fetchSlots(vetId, date) {
    status.value.loading = true;
    try {
      if (USE_MOCK_DATA) {
        slots.value = [];

        return slots.value;
      }

      const data = await VetService.getSlots(vetId, date);
      slots.value = data ?? [];

      return slots.value;
    } finally {
      status.value.loading = false;
    }
  }

  function getFromStore(id) {
    return vets.value.find(v => v.id === id);
  }

  function saveInStore(newVet) {
    const oldIndex = findReplace(vets.value, v => v.id === newVet.id, newVet);
    if (oldIndex < 0) {
      vets.value.push(newVet);
    }
  }


  return {
    vets, selectedId, slots, status, lock,
    selected, locked,
    get, fetchOne, fetchAll, fetchSlots, getFromStore, saveInStore,
  };
});
