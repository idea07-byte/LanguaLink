import api from './client'

export const fetchConversations = async () => {
  const res = await api.get('/conversations')
  return res.data
}

export const startConversationWithPartner = async (partnerId) => {
  const res = await api.post(`/conversations/start/${partnerId}`)
  return res.data
}

export const fetchConversationMessages = async (conversationId) => {
  const res = await api.get(`/conversations/${conversationId}/messages`)
  return res.data
}

export const sendChatMessage = async (conversationId, content, type = 'TEXT') => {
  const res = await api.post(`/conversations/${conversationId}/messages`, {
    content,
    type,
  })
  return res.data
}

export const markMessagesRead = async (conversationId) => {
  const res = await api.put(`/conversations/${conversationId}/read`)
  return res.data
}
