import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api',
  timeout: 15000
})

service.interceptors.request.use(config => {
  const token = localStorage.getItem('smart_catering_admin_token')
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

service.interceptors.response.use(
  response => {
    const body = response.data
    if (body && typeof body.code !== 'undefined') {
      if (body.code === 200) return body.data
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(body)
    }
    return body
  },
  error => {
    ElMessage.error(error.response?.data?.message || error.message || '网络异常')
    return Promise.reject(error)
  }
)

export default service
