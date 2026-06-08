import request from './request'

export function fetchReservations(params) {
  return request({
    url: '/merchant/reservation/page',
    method: 'GET',
    params
  })
}

export function updateReservationStatus(id, params) {
  return request({
    url: `/merchant/reservation/${id}/status`,
    method: 'PUT',
    params
  })
}
