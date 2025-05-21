<template>
  <div class="login-bg">
    <div
      class="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] flex flex-col items-center justify-center bg-[#f1f7fe] rounded-lg overflow-hidden"
    >
      <div class="max-w-md w-full space-y-8 px-8 py-4 shadow-lg">
        <div>
          <h2 class="text-center text-3xl font-extrabold text-gray-900">登录系统</h2>
        </div>
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="username" class="sr-only">用户名</label>
              <input
                id="username"
                v-model="username"
                name="username"
                type="text"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="用户名"
              />
            </div>
            <div>
              <label for="password" class="sr-only">密码</label>
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span v-if="loading">登录中...</span>
              <span v-else>登录</span>
            </button>
          </div>
        </form>
      </div>
      <div class="bg-[#e0ecfb] py-4 px-8 w-full">欢迎使用e2e文件管理系统！👏🏻</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '@/store/authStore'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    await authStore.login(username.value, password.value)
    message.success('登录成功')
    await router.push('/dashboard')
  } catch (error: any) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-width: 100vw;
  min-height: 100vh;
  background: linear-gradient(45deg, #3498db, #2ecc71); /* Gradient background */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Shadow for depth */
  position: relative;
  overflow: hidden;
}

.login-bg::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none; /* Allow clicking through the pattern layer */
}
</style>
