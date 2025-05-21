import { AxiosInstance, http } from '@/utils/request/axios.ts'
import cache from '@/utils/cache.ts'

export const queryFile = () => {
  return http.get<API.QueryFileRes>('/file/query')
}

export const uploadFile = (formData: FormData, fn: (value: number) => void) => {
  return http.post<null>('/file/upload', formData, {
    onUploadProgress(progressEvent) {
      if (!!progressEvent.progress) {
        fn(progressEvent.progress)
      }
    },
  })
}

export const downloadFile = async (id: number) => {
  try {
    // 发送GET请求获取文件内容，设置responseType为'blob'以获取二进制数据
    return await AxiosInstance.get(`/file/download?id=${id}`, {
      responseType: 'blob', // 重要：设置响应类型为blob
      headers: {
        Authorization: cache.get('token') || '',
      },
    })
  } catch (error) {
    console.error('下载文件时出错:', error)
    throw error
  }
}

export const deleteFile = (id: number) => {
  return http.post<null>('/file/delete', { id })
}
