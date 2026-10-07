import api from './client'

export const FALLBACK_LANGUAGES = [
  { id: 1, name: 'English', code: 'en', flag: '🇺🇸' },
  { id: 2, name: 'Tamil', code: 'ta', flag: '🇮🇳' },
  { id: 3, name: 'Hindi', code: 'hi', flag: '🇮🇳' },
  { id: 4, name: 'Telugu', code: 'te', flag: '🇮🇳' },
  { id: 5, name: 'Malayalam', code: 'ml', flag: '🇮🇳' },
  { id: 6, name: 'Kannada', code: 'kn', flag: '🇮🇳' },
  { id: 7, name: 'Bengali', code: 'bn', flag: '🇮🇳' },
  { id: 8, name: 'Marathi', code: 'mr', flag: '🇮🇳' },
  { id: 9, name: 'Spanish', code: 'es', flag: '🇪🇸' },
  { id: 10, name: 'French', code: 'fr', flag: '🇫🇷' },
  { id: 11, name: 'German', code: 'de', flag: '🇩🇪' },
  { id: 12, name: 'Japanese', code: 'ja', flag: '🇯🇵' },
  { id: 13, name: 'Korean', code: 'ko', flag: '🇰🇷' },
  { id: 14, name: 'Chinese', code: 'zh', flag: '🇨🇳' },
  { id: 15, name: 'Arabic', code: 'ar', flag: '🇸🇦' },
  { id: 16, name: 'Portuguese', code: 'pt', flag: '🇧🇷' },
  { id: 17, name: 'Russian', code: 'ru', flag: '🇷🇺' },
  { id: 18, name: 'Italian', code: 'it', flag: '🇮🇹' },
]

export async function fetchLanguages() {
  try {
    const response = await api.get('/languages')
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data
    }
    return FALLBACK_LANGUAGES
  } catch (err) {
    console.warn('Using fallback languages from client:', err?.message || err)
    return FALLBACK_LANGUAGES
  }
}
