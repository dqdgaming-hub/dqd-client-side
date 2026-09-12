import apiClient from './client'

export const getGames = (genre = '') =>
  apiClient.get('/games/', { params: genre ? { genre } : {} })

export const getGame = (id) => apiClient.get(`/games/${id}/`)
export const createGame = (data) => apiClient.post('/games/', data)
export const updateGame = (id, data) => apiClient.put(`/games/${id}/`, data)
export const deleteGame = (id) => apiClient.delete(`/games/${id}/`)
