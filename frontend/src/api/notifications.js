import api from './client'

export const getNotifications = async () => {
  const response = await api.get('/notifications')
  return response.data?.data || []
}

export const getUnreadNotificationsCount = async () => {
  const response = await api.get('/notifications/unread-count')
  return response.data?.data?.count || 0
}

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`)
  return response.data?.data
}

export const markAllNotificationsAsRead = async () => {
  await api.post('/notifications/read-all')
}
