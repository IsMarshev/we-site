const API_BASE = import.meta.env.VITE_API_BASE || ''

function authHeaders() {
  const token = localStorage.getItem('ct_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchJSON(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

export const api = {
  listPlaces: () => fetchJSON('/api/places/'),
  createPlace: (data) => fetchJSON('/api/places/', { method: 'POST', body: JSON.stringify(data) }),
  getPlace: (id) => fetchJSON(`/api/places/${id}`),
  updatePlace: (id, data) => fetchJSON(`/api/places/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlace: (id) => fetchJSON(`/api/places/${id}`, { method: 'DELETE' }),
  getPlaceReactions: (id) => fetchJSON(`/api/places/${id}/reactions`),
  reactPlace: (id, value) => fetchJSON(`/api/places/${id}/react`, { method: 'PUT', body: JSON.stringify({ value }) }),
  listComments: (placeId) => fetchJSON(`/api/comments/place/${placeId}`),
  createComment: (placeId, data) => fetchJSON(`/api/comments/place/${placeId}`, { method: 'POST', body: JSON.stringify(data) }),
  createContact: (data) => fetchJSON('/api/contacts/', { method: 'POST', body: JSON.stringify(data) }),
  // Gallery
  listGallery: () => fetchJSON('/api/gallery/'),
  addGalleryUrl: (data) => fetchJSON('/api/gallery/url', { method: 'POST', body: JSON.stringify(data) }),
  getImageReactions: (id) => fetchJSON(`/api/gallery/${id}/reactions`),
  reactImage: (id, value) => fetchJSON(`/api/gallery/${id}/react`, { method: 'PUT', body: JSON.stringify({ value }) }),
  uploadGallery: async (file, title) => {
    const form = new FormData()
    if (title) form.append('title', title)
    form.append('file', file)
    const token = localStorage.getItem('ct_token')
    const res = await fetch('/api/gallery/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },
}
