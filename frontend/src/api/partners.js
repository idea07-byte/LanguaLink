import api from './client'

export const fetchPartners = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.language && params.language !== 'All') query.append('language', params.language)
  if (params.level && params.level !== 'All') query.append('level', params.level)
  if (params.interest && params.interest !== 'All') query.append('interest', params.interest)
  if (params.search) query.append('search', params.search)

  const res = await api.get(`/partners?${query.toString()}`)
  return res.data
}

export const fetchPartnerById = async (id) => {
  const res = await api.get(`/partners/${id}`)
  return res.data
}
