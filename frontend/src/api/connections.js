import api from './client'

export const sendConnectionRequest = async (receiverId) => {
  const res = await api.post(`/connections/request/${receiverId}`)
  return res.data
}

export const acceptConnection = async (connectionId) => {
  const res = await api.post(`/connections/${connectionId}/accept`)
  return res.data
}

export const rejectConnection = async (connectionId) => {
  const res = await api.post(`/connections/${connectionId}/reject`)
  return res.data
}

export const fetchConnections = async () => {
  const res = await api.get('/connections')
  return res.data
}

export const fetchPendingRequests = async () => {
  const res = await api.get('/connections/pending')
  return res.data
}

export const fetchConnectionStatus = async (targetUserId) => {
  const res = await api.get(`/connections/status/${targetUserId}`)
  return res.data
}
