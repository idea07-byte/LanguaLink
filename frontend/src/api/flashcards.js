import api from './client'

export const getFlashcards = async () => {
  const response = await api.get('/flashcards')
  return response.data?.data || []
}

export const getDueFlashcards = async () => {
  const response = await api.get('/flashcards/due')
  return response.data?.data || []
}

export const getFlashcardStats = async () => {
  const response = await api.get('/flashcards/stats')
  return response.data?.data || { totalCards: 0, dueToday: 0, mastered: 0, learning: 0, retentionRate: 0 }
}

export const createFlashcard = async (cardData) => {
  const response = await api.post('/flashcards', cardData)
  return response.data?.data
}

export const reviewFlashcard = async (cardId, rating) => {
  const response = await api.post(`/flashcards/${cardId}/review`, { rating })
  return response.data?.data
}

export const deleteFlashcard = async (cardId) => {
  await api.delete(`/flashcards/${cardId}`)
}
