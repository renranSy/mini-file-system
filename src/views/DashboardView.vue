<template>
  <div class="min-h-screen bg-gray-100 bg">
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      title="确认删除"
      :content="'确定要删除文件 \'' + fileToDelete?.filename + '\' 吗？'"
      :loading="deleteLoading"
      positive-text="确认"
      negative-text="取消"
      type="warning"
      @positive-click="confirmDelete"
      @negative-click="showDeleteModal = false"
    />
    <nav class="bg-white/10 backdrop-blur-sm shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold">文件传输系统</h1>
            </div>
          </div>
          <div class="flex items-center">
            <button
              @click="handleLogout"
              class="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- 文件上传区域 -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-lg font-medium mb-4">上传文件</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-center w-full">
            <label
              class="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300"
            >
              <span class="flex flex-col items-center justify-center pt-7 cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-12 h-12 text-gray-400 group-hover:text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                  选择文件
                </span>
              </span>
              <input
                type="file"
                class="opacity-0"
                @change="handleFileSelect"
                :disabled="uploading"
              />
            </label>
          </div>
          <div v-if="selectedFile" class="text-sm text-gray-500">
            已选择: {{ selectedFile.name }}
          </div>
          <div
            v-if="uploadProgress > 0 && uploadProgress < 100"
            class="w-full bg-gray-200 rounded-full h-2.5"
          >
            <div
              class="bg-blue-600 h-2.5 rounded-full"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <button
            @click="handleUpload"
            :disabled="uploading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white cursor-pointer bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ uploading ? '上传中...' : '上传文件' }}
          </button>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium mb-4">文件列表</h2>
          <n-button @click="loadFiles" type="primary" size="small">刷新</n-button>
        </div>
        <n-data-table
          :loading="loading"
          :columns="columns"
          :data="files"
          :pagination="pagination"
          :bordered="false"
          striped
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NDataTable, NModal, NSpace, useMessage } from 'naive-ui'
import { useAuthStore } from '@/store/authStore'
import { deleteFile, downloadFile, queryFile, uploadFile } from '@/api/fileService'
import QueryFile = API.QueryFile

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const files = ref<QueryFile[]>([])
const showDeleteModal = ref(false)
const fileToDelete = ref<QueryFile | null>(null)

const pagination = {
  pageSize: 10,
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const createColumns = () => {
  return [
    {
      title: '文件名',
      key: 'filename',
      width: 300,
    },
    {
      title: '哈希值',
      key: 'hash',
      width: 300,
    },
    {
      title: '大小',
      key: 'filesize',
      width: 150,
      render: (row: QueryFile) => formatFileSize(row.filesize),
    },
    {
      title: '上传时间',
      key: 'createdAt',
      width: 180,
      render: (row: QueryFile) => formatDate(row.createdAt),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (row: QueryFile) => {
        return h(
          NSpace,
          {},
          {
            default: () => [
              h(
                NButton,
                {
                  size: 'small',
                  type: 'primary',
                  onClick: () => handleDownload(row),
                },
                { default: () => '下载' },
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  onClick: () => handleDelete(row),
                },
                { default: () => '删除' },
              ),
            ],
          },
        )
      },
    },
  ]
}

const columns = createColumns()

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    if (file.size > MAX_FILE_SIZE) {
      message.error('文件大小不能超过100MB')
      input.value = '' // 清空选择
      selectedFile.value = null
      return
    }
    selectedFile.value = file
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) {
    message.warning('请先选择文件')
    return
  }

  if (selectedFile.value.size > MAX_FILE_SIZE) {
    message.error('文件大小不能超过100MB')
    return
  }

  try {
    uploading.value = true
    uploadProgress.value = 0

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const resp = await uploadFile(formData, (progress) => {
      uploadProgress.value = progress
    })

    if (resp.code === 200) {
      message.success('文件上传成功')
    } else {
      message.error(resp.message)
    }

    selectedFile.value = null
    uploadProgress.value = 0
    await loadFiles()
  } catch (error) {
    message.error('上传失败')
    console.error(error)
  } finally {
    uploading.value = false
  }
}

// 计算文件的 SHA-256 哈希值
const calculateFileHash = async (file: Blob): Promise<string> => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

const handleDownload = async (file: QueryFile) => {
  try {
    const response = await downloadFile(file.id)
    const blob = new Blob([response.data], { type: 'application/octet-binary' })

    // 计算下载文件的哈希值
    const downloadedHash = await calculateFileHash(blob)

    // 比较哈希值
    if (downloadedHash === file.hash) {
      // 哈希值匹配，创建下载链接
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      message.success('文件下载成功')
    } else {
      message.error('文件完整性验证失败，下载已取消')
    }
  } catch (error) {
    message.error('下载失败')
    console.error(error)
  }
}

const handleDelete = (file: QueryFile) => {
  fileToDelete.value = file
  showDeleteModal.value = true
}

const deleteLoading = ref(false)
const confirmDelete = async () => {
  if (!fileToDelete.value) return

  try {
    deleteLoading.value = true
    const resp = await deleteFile(fileToDelete.value.id)
    if (resp.code === 200) {
      message.success('文件删除成功')
    } else {
      message.error(resp.message)
    }
  } catch (error) {
    message.error('删除失败')
    console.error(error)
  } finally {
    deleteLoading.value = false
    showDeleteModal.value = false
    fileToDelete.value = null
    await loadFiles()
  }
}

const handleLogout = async () => {
  try {
    authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

const loading = ref(false)
const loadFiles = async () => {
  loading.value = true
  const resp = await queryFile()
  loading.value = false

  if (resp.code === 200) {
    files.value = resp.data.list
  } else {
    message.error(resp.message)
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  if (!authStore.isAuthenticated()) {
    router.push('/login')
    return
  }
  loadFiles()
})
</script>

<style scoped>
.bg {
  width: 100%;
  height: 100%;
  --color: #e1e1e1;
  background-color: #f3f3f3;
  background-image:
    linear-gradient(
      0deg,
      transparent 24%,
      var(--color) 25%,
      var(--color) 26%,
      transparent 27%,
      transparent 74%,
      var(--color) 75%,
      var(--color) 76%,
      transparent 77%,
      transparent
    ),
    linear-gradient(
      90deg,
      transparent 24%,
      var(--color) 25%,
      var(--color) 26%,
      transparent 27%,
      transparent 74%,
      var(--color) 75%,
      var(--color) 76%,
      transparent 77%,
      transparent
    );
  background-size: 55px 55px;
}
</style>
