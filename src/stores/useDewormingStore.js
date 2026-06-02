import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { VaccinationService } from '@/services/api/v1/vaccinationService';
import { Deworming } from '@/models/deworming';
import { dewormings as seedDewormings } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


export const useDewormingStore = defineStore('deworming', () => {


  // State

  const dewormings = ref([]);
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
    let deworming = getFromStore(id);

    if (!deworming) {
      deworming = await fetchOne(id);
    }

    return deworming;
  }

  async function fetchOne(id) {
    const found = USE_MOCK_DATA
      ? seedDewormings.find(d => d.id === id)
      : null;

    if (!found) return;

    saveInStore(found);

    return found;
  }

  async function fetchAll(petId) {
    const newDewormings = USE_MOCK_DATA
      ? (petId ? seedDewormings.filter(d => d.petId === petId) : seedDewormings)
      : null;

    if (!newDewormings) return;

    dewormings.value = newDewormings;

    return newDewormings;
  }

  async function add(petId, newDeworming) {
    if (USE_MOCK_DATA) {
      seedDewormings.push(newDeworming);
    } else {
      const apiData = await VaccinationService.create(petId, newDeworming);
      newDeworming = Deworming.fromApi(apiData, petId);
    }

    saveInStore(newDeworming);

    return newDeworming;
  }

  function getFromStore(id) {
    return dewormings.value.find(d => d.id === id);
  }

  function saveInStore(newDeworming) {
    const oldIndex = findReplace(dewormings.value, d => d.id === newDeworming.id, newDeworming);
    if (oldIndex < 0) {
      dewormings.value.push(newDeworming);
    }
  }


  return {
    dewormings, selectedId, status, lock,
    selected, locked,
    get, fetchOne, fetchAll, add, getFromStore, saveInStore,
  };
});
