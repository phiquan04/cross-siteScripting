import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { postApi, type Post } from '../lib/api'
import { MessageSquare, Plus, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// FE3: risk level color map
const RISK_COLORS: Record<string, { badge: string; dot: string }> = {
  critical: { badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500' },
  high:     { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  medium:   { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  low:      { badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
  none:     { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    postApi.getAll().then(res => {
      if (res.data) setPosts(res.data)
      else setError(res.error || 'Failed to load posts')
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  const xssCount = posts.filter(p => p.hasXSS).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-500 mt-1">Stored XSS Demo — create posts with XSS payloads to test</p>
        </div>
        <Link to="/posts/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </Link>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-amber-800 text-sm">
            <strong>Warning:</strong> Posts may contain malicious XSS code. When viewing a post with <strong>Secure Mode OFF</strong>, scripts will execute in your browser.
          </p>
        </div>
      </div>

      {/* FE3: XSS stats bar */}
      {posts.length > 0 && (
        <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
          <span className="flex items-center gap-1.5 text-gray-600">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{xssCount}</span> post{xssCount !== 1 ? 's' : ''} with XSS payload
          </span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span className="font-medium">{posts.length - xssCount}</span> clean
          </span>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No posts yet</p>
          <p className="text-sm mt-1">Create the first post to test Stored XSS!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const risk = post.riskLevel || 'none'
            const rc = RISK_COLORS[risk] || RISK_COLORS.none
            return (
              <Link key={post.id} to={`/post/${post.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* FE3: XSS risk dot indicator */}
                        {post.hasXSS && (
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rc.dot}`} title={`Risk: ${risk}`} />
                        )}
                        <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition truncate">
                          {post.title}
                        </h2>
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {post.content.replace(/<[^>]*>/g, '').slice(0, 150)}
                        {post.content.length > 150 ? '...' : ''}
                      </p>
                    </div>
                    {/* FE3: XSS risk badge */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {post.hasXSS ? (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${rc.badge}`}>
                          {risk.toUpperCase()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                          Clean
                        </span>
                      )}
                      {post.sanitizedContent !== null && (
                        <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full font-medium">
                          Sanitized
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>@{post.author.username}</span>
                    {user && post.authorId === user.id && (
                      <span className="text-blue-500 font-medium">my post</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString('en-US')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post._count?.comments ?? 0} comments
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
