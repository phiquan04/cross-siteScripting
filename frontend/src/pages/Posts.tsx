import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { postApi, type Post } from '../lib/api'
import { MessageSquare, Plus, Clock, AlertTriangle } from 'lucide-react'

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    postApi.getAll().then(res => {
      if (res.data) setPosts(res.data)
      else setError(res.error || 'Lỗi tải bài viết')
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bài viết</h1>
          <p className="text-gray-500 mt-1">Stored XSS demo — tạo bài với payload XSS để test</p>
        </div>
        <Link to="/posts/new">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Tạo bài viết
          </button>
        </Link>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-amber-800 text-sm">
            <strong>Cảnh báo:</strong> Bài viết có thể chứa mã XSS độc hại. Khi mở bài viết ở chế độ <strong>Vulnerable</strong>, script sẽ được thực thi trong trình duyệt của bạn. Hãy cẩn thận!
          </p>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Chưa có bài viết nào</p>
          <p className="text-sm mt-1">Hãy tạo bài viết đầu tiên để test Stored XSS!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Link key={post.id} to={`/post/${post.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition cursor-pointer mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {post.content.replace(/<[^>]*>/g, '').slice(0, 150)}
                      {post.content.length > 150 ? '...' : ''}
                    </p>
                  </div>
                  {post.sanitizedContent === null && (
                    <span className="ml-3 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium flex-shrink-0">
                      Vulnerable
                    </span>
                  )}
                  {post.sanitizedContent !== null && (
                    <span className="ml-3 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium flex-shrink-0">
                      Sanitized
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>@{post.author.username}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post._count?.comments ?? 0} comment
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
