import api from './client'

export const checkHealth = async () => {
  const res = await api.get('/health')
  return res.data
}

export const registerUser = async ({ name, email, password, nativeLanguage, learningLanguages }) => {
  const res = await api.post('/auth/register', {
    name,
    email,
    password,
    nativeLanguage,
    learningLanguages,
  })
  return res.data
}

export const loginUser = async ({ email, password }) => {
  const res = await api.post('/auth/login', {
    email,
    password,
  })
  return res.data
}

export const socialLoginUser = async ({ email, provider, name, avatarUrl }) => {
  const res = await api.post('/auth/social', {
    email,
    provider,
    name,
    avatarUrl,
  })
  return res.data
}

export const getProfile = async () => {
  const res = await api.get('/profile')
  return res.data
}

export const updateProfile = async (data) => {
  const res = await api.put('/profile', data)
  return res.data
}
