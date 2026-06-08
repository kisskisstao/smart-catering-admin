import request from './request'

export function fetchDashboard(params) {
  return request.get('/merchant/dashboard', { params })
}
