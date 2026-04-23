
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

export interface Post {
  id: string
  title: string
  content: string
  sanitizedContent: string | null
  authorId: string
  author: { id: string; username: string }
  comments?: Comment[]
  _count?: { comments: number }
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  sanitizedContent: string | null
  authorId: string
  author: { id: string; username: string }
  postId: string
  createdAt: string
}

export interface XSSDetection {
  isXSS: boolean
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
  score: number
  matchedPatterns: string[]
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

export const postApi = {
  getAll: () =>
    apiFetch<Post[]>('/api/posts'),

  getById: (id: string) =>
    apiFetch<Post>(`/api/posts/${id}`),

  create: (title: string, content: string, mode?: 'secure') =>
    apiFetch<Post & { xssDetection: XSSDetection }>(`/api/posts${mode ? '?mode=secure' : ''}`, {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    }),

  update: (id: string, data: { title?: string; content?: string }, mode?: 'secure') =>
    apiFetch<Post>(`/api/posts/${id}${mode ? '?mode=secure' : ''}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/posts/${id}`, { method: 'DELETE' }),
}

export const commentApi = {
  create: (postId: string, content: string, mode?: 'secure') =>
    apiFetch<Comment & { xssDetection: XSSDetection }>(`/api/posts/${postId}/comments${mode ? '?mode=secure' : ''}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/comments/${id}`, { method: 'DELETE' }),
}

export const securityApi = {
  toggleCSP: (enabled: boolean) =>
    apiFetch<{ cspEnabled: boolean }>('/api/toggle-csp', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),
}
