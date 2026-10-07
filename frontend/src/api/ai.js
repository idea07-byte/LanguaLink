import api from './client'

export const checkGrammar = async (sentence, targetLanguage = 'English') => {
  const response = await api.post('/ai/grammar', { sentence, targetLanguage })
  return response.data?.data
}

export const getCorrectionsHistory = async () => {
  const response = await api.get('/ai/corrections')
  return response.data?.data || []
}

export const practiceConversation = async (message, targetLanguage = 'English', difficulty = 'Intermediate', history = []) => {
  const response = await api.post('/ai/practice', {
    message,
    targetLanguage,
    difficulty,
    conversationHistory: history,
  })
  return response.data?.data
}

export const generateAIFlashcards = async (topic, count = 5, targetLanguage = 'English', text = '') => {
  const response = await api.post('/ai/flashcards', {
    topic,
    count,
    targetLanguage,
    text,
  })
  return response.data?.data || []
}
