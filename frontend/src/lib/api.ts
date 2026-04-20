
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    const json = await res.json()
    if (!res.ok) return { error: json.error || 'Lỗi không xác định' }
    return { data: json }
  } catch {
    return { error: 'Không thể kết nối đến server' }
  }
}


export interface User {
  id: string
  username: string
  createdAt: string
}

export const authApi = {
  register: (username: string, password: string) =>
    apiFetch<{ message: string; user: User }>('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    apiFetch<{ message: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiFetch<{ message: string }>('/api/logout', { method: 'POST' }),

  me: () =>
    apiFetch<{ user: User }>('/api/me'),
}