import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { VaccinationService } from '@/services/api/v1/vaccinationService';
import { vaccines as seedVaccines } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


export const useVaccinationStore = defineStore('vaccination', () => {


  // State

  const vaccines = ref([]);
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
    let vaccine = getFromStore(id);

    if (!vaccine) {
      vaccine = await fetchOne(id);
    }

    return vaccine;
  }

  async function fetchOne(id) {
    const found = USE_MOCK_DATA
      ? seedVaccines.find(v => v.id === id)
      : null;

    if (!found) return;

    saveInStore(found);

    return found;
  }

  async function fetchAll(petId) {
    const newVaccines = USE_MOCK_DATA
      ? (petId ? seedVaccines.filter(v => v.petId === petId) : seedVaccines)
      : await VaccinationService.list(petId);

    if (!newVaccines) return;

    vaccines.value = newVaccines;

    return newVaccines;
  }

  async function add(petId, newVaccine) {
    if (USE_MOCK_DATA) {
      seedVaccines.push(newVaccine);
    } else {
      newVaccine = await VaccinationService.create(petId, newVaccine);
    }

    saveInStore(newVaccine);

    return newVaccine;
  }

  function getFromStore(id) {
    return vaccines.value.find(v => v.id === id);
  }

  function saveInStore(newVaccine) {
    const oldIndex = findReplace(vaccines.value, v => v.id === newVaccine.id, newVaccine);
    if (oldIndex < 0) {
      vaccines.value.push(newVaccine);
    }
  }


  return {
    vaccines, selectedId, status, lock,
    selected, locked,
    get, fetchOne, fetchAll, add, getFromStore, saveInStore,
  };
});
