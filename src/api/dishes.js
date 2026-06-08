import request from './request'

export function fetchDishes(params) {
  return request.get('/merchant/dish/page', { params })
}

export function fetchDishDetail(id) {
  return request.get(`/dish/detail/${id}`)
}

export function createDish(data) {
  return request.post('/merchant/dish', data)
}

export function updateDish(id, data) {
  return request.put(`/merchant/dish/${id}`, data)
}

export function deleteDish(id, params) {
  return request.delete(`/merchant/dish/${id}`, { params })
}

export function uploadDishImage(file) {
  return Promise.resolve(URL.createObjectURL(file))
}
