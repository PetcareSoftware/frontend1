import { defineStore } from 'pinia';
import { useAppStore } from './useAppStore';
import { OwnerService } from '@/services/api/v1/ownerService';
import { owners as seedOwners } from '@/data/mockData';

const USE_MOCK_DATA = true;
const appStore = useAppStore();

function clone(obj) {
  return Array.isArray(obj) ?
    obj.map(item => ({ ...item })) :
    { ...obj };
}

function findReplace(obj, test, newValue) {
  if (Array.isArray(obj)) {
    const i = obj.findIndex(test);
    if (i >= 0) {
      obj[i] = newValue;
    }
    return i;
  }

  for (const key in obj) {
    if (test(obj)) {
      obj[key] = newValue;
      return key;
    }
  }
}

export const useOwnerStore = defineStore('owner', {
  state: () => ({
    owners: [],
    selectedId: null,
  }),

  getters: {
    selected() {
      return this.selectedId != null ? this.getFromStore(this.selectedId) : undefined;
    }
  },

  actions: {
    async get(id) {
      let owner = this.getFromStore(id);

      if (!owner) {
        owner = await this.fetchOne(id);
      }

      return owner;
    },

    async fetchOne(id) {
      const newOwner = USE_MOCK_DATA ?
        seedOwners.find(owner => owner.id === id) :
        await OwnerService.get(id);

      if (!newOwner) return;

      this.saveInStore(newOwner);
      return newOwner;
    },

    async fetchAll() {
      const owners = USE_MOCK_DATA ?
        seedOwners :
        await OwnerService.list();

      if (!owners) return;

      this.owners = owners;
      return owners;
    },

    async add(newOwner) {
      if (USE_MOCK_DATA) {
        if (seedOwners.find(owner => owner.equals(newOwner)) ) {
          throw new Error('Esta cuenta ya existe');
        }
        seedOwners.push(newOwner);
      } else {
        await OwnerService.create(newOwner);

        try {
          newOwner = await OwnerService.getMe();
        } catch (e) {
          const newError = Error(
            'Hubo un problema. La cuenta puede haberse creado o no. Por favor, recargue la página');
          newError.cause = e;
          throw newError;
        }
      }

      return newOwner;
    },

    async update(newOwner) {
      if (USE_MOCK_DATA) {
        const oldIndex = findReplace(seedOwners, (old) => old.id === newOwner.id, newOwner);
        if (oldIndex < 0) {
          throw new Error('Esta cuenta no existe');
        }
      } else {
        if (newOwner.id === appStore.currentUserId) {
          newOwner = await OwnerService.updateMe(newOwner);
        } else {
          throw new Error('No se puede actualizar la cuenta de otro propietario');
        }
      }

      this.saveInStore(newOwner);
      return newOwner;
    },

    getFromStore(id) {
      return this.owners.find(owner => owner.id === id);
    },

    saveInStore(newOwner) {
      const oldIndex = findReplace(this.owners, (old) => old.id === newOwner.id, newOwner);
      if (oldIndex < 0) {
        this.owners.push(newOwner);
      }
    }
  },
});
