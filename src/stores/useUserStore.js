import { defineStore } from 'pinia';
import { useAppStore } from './useAppStore';
import { useOwnerStore } from './useOwnerStore';

const USE_MOCK_DATA = true;
const appStore = useAppStore();
const ownerStore = useOwnerStore();

export const useUserStore = defineStore('user', {
  state: () => ({
  }),

  getters: {
    current() {
      const currentId = appStore.currentUserId;
      return currentId != null ? this.getFromStore(currentId) : undefined;
    },

    users() {
      return [].concat(ownerStore.owners);
    },
  },

  actions: {
    async add(newUser) {
      return ownerStore.add(newUser);
    },

    getFromStore(id) {
      return this.users.find(user => user.id === id);
    },
  },
});
