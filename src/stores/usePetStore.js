import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAppStore } from './useAppStore';
import { PetService } from '@/services/api/v1/petService';
import { pets as seedPets } from '@/data/mockData';
import { findReplace } from '@/lib/utils';
import { USE_MOCK_DATA, getSelectedById, getLocked, getLockWatcher } from './utils';


export const usePetStore = defineStore('pet', () => {
  const appStore = useAppStore();


  // State

  const pets = ref([]);
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
    let pet = getFromStore(id);

    if (!pet) {
      pet = await fetchOne(id);
    }

    return pet;
  }

  async function fetchOne(id) {
    status.value.loadingOne = true;
    try {
      const newPet = USE_MOCK_DATA
        ? seedPets.find(p => p.id === id)
        : await PetService.get(id);

      if (!newPet) return;

      saveInStore(newPet);

      return newPet;
    } finally {
      status.value.loadingOne = false;
    }
  }

  async function fetchAll() {
    status.value.loading = true;
    try {
      const newPets = USE_MOCK_DATA
        ? seedPets.filter(p => p.ownerId === appStore.currentUserId)
        : await PetService.list();

      if (!newPets) return;

      pets.value = newPets;

      return newPets;
    } finally {
      status.value.loading = false;
    }
  }

  async function add(newPet) {
    status.value.sendingOne = true;
    try {
      if (USE_MOCK_DATA) {
        if (seedPets.find(p => p.equals(newPet))) {
          throw new Error('Esta mascota ya existe');
        }
        seedPets.push(newPet);
      } else {
        newPet = await PetService.create(newPet);
      }

      saveInStore(newPet);

      return newPet;
    } finally {
      status.value.sendingOne = false;
    }
  }

  async function update(newPet) {
    status.value.sendingOne = true;
    try {
      if (USE_MOCK_DATA) {
        const oldIndex = findReplace(seedPets, p => p.id === newPet.id, newPet);
        if (oldIndex < 0) {
          throw new Error('Esta mascota no existe');
        }
      } else {
        newPet = await PetService.update(newPet);
      }

      saveInStore(newPet);

      return newPet;
    } finally {
      status.value.sendingOne = false;
    }
  }

  function getFromStore(id) {
    return pets.value.find(p => p.id === id);
  }

  function saveInStore(newPet) {
    const oldIndex = findReplace(pets.value, p => p.id === newPet.id, newPet);
    if (oldIndex < 0) {
      pets.value.push(newPet);
    }
  }


  return {
    pets, selectedId, status, lock,
    selected, locked,
    get, fetchOne, fetchAll, add, update, getFromStore, saveInStore,
  };
});
