import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
  }),
  actions: {
    setUser(data) {
      this.id = data.id
    },
    clearUser() {
      this.id = null
    },
  },
})
