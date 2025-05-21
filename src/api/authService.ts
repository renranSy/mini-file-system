import { http } from '@/utils/request/axios.ts'

export const login = (data: API.LoginReq) => {
  return http.post<API.LoginRes>('/auth/login', data)
}
