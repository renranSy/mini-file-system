import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi } from '@/api/authService'
import cache from '@/utils/cache.ts'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(cache.get('token'))
  const user = ref({
    username: '',
    userId: 0,
  })

  const login = async (username: string, password: string) => {
    try {
      const response = await loginApi({ username, password })
      token.value = response.data.token
      user.value.username = response.data.username
      user.value.userId = response.data.userId
      cache.set('token', response.data.token)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = null
    user.value = {
      username: '',
      userId: 0,
    }
    cache.clear()
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    token,
    user,
    login,
    logout,
    isAuthenticated,
  }
})
