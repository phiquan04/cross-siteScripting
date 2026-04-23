import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { postApi, authApi, type Post as PostType, type Comment, type User } from '../lib/api'
import CommentSection from '../components/CommentSection'
import { AlertTriangle, ShieldCheck, ShieldOff, Clock, User as UserIcon } from 'lucide-react'

export default function Post() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<PostType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [secureMode, setSecureMode] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    if (!id) return
    postApi.getById(id).then(res => {
      if (res.data) setPost(res.data)
      else setError(res.error || 'Bài viết không tồn tại')
      setLoading(false)
    })
    authApi.me().then(res => {
      if (res.data) setCurrentUser(res.data.user)
    })
  }, [id])

  const handleCommentAdded = (comment: Comment) => {
    if (!post) return
    setPost({ ...post, comments: [...(post.comments || []), comment] })
  }

  const handleCommentDeleted = (commentId: string) => {
    if (!post) return
    setPost({
      ...post,
      comments: (post.comments || []).filter(c => c.id !== commentId),
    })
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  if (error || !post) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-red-500">{error || 'Không tìm thấy bài viết'}</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border">
        <span className="text-sm font-medium text-gray-700">Render Mode:</span>
        <button
          onClick={() => setSecureMode(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !secureMode
              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ShieldOff className="w-4 h-4" /> Vulnerable
        </button>
        <button
          onClick={() => setSecureMode(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            secureMode
              ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Secure
        </button>
      </div>

      {/* Warning */}
      {!secureMode && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Chế độ Vulnerable</p>
              <p className="text-red-700 text-sm">Nội dung đang render bằng <code className="bg-red-100 px-1 rounded">dangerouslySetInnerHTML</code> — script sẽ thực thi!</p>
            </div>
          </div>
        </div>
      )}

      {secureMode && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold">Chế độ Secure</p>
              <p className="text-green-700 text-sm">Nội dung đã được sanitize bằng DOMPurify hoặc render dạng text thuần.</p>
            </div>
          </div>
        </div>
      )}

      {/* Post content */}
      <article className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" /> @{post.author.username}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {new Date(post.createdAt).toLocaleString('vi-VN')}
            </span>
          </div>

          {/* Content rendering */}
          <div className="prose max-w-none">
            {secureMode ? (
              post.sanitizedContent ? (
                <div dangerouslySetInnerHTML={{ __html: post.sanitizedContent }} />
              ) : (
                <div>{post.content}</div>
              )
            ) : (
              // VULNERABLE: raw HTML rendering
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            )}
          </div>
        </div>

        {/* Source code view */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <details>
            <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800">
              View raw HTML source
            </summary>
            <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-x-auto text-gray-700">
              {post.content}
            </pre>
            {post.sanitizedContent && (
              <>
                <p className="text-xs font-medium text-green-600 mt-3 mb-1">Sanitized version:</p>
                <pre className="p-3 bg-white rounded border text-xs overflow-x-auto text-gray-700">
                  {post.sanitizedContent}
                </pre>
              </>
            )}
          </details>
        </div>
      </article>

      {/* Comments */}
      <CommentSection
        postId={post.id}
        comments={post.comments || []}
        currentUserId={currentUser?.id}
        secureMode={secureMode}
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
      />

      {/* Education box */}
      <div className="mt-10 p-5 bg-blue-50 rounded-xl border border-blue-200 text-sm">
        <p className="font-semibold text-blue-900 mb-2">Cách phòng chống Stored XSS:</p>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Sử dụng <strong>DOMPurify</strong> để sanitize HTML trước khi lưu hoặc render</li>
          <li>Dùng React text rendering <code className="bg-blue-100 px-1 rounded">{'{content}'}</code> thay vì <code className="bg-blue-100 px-1 rounded">dangerouslySetInnerHTML</code></li>
          <li>Thiết lập <strong>Content Security Policy (CSP)</strong> header</li>
          <li>Validate và escape input phía server</li>
          <li>Set cookie <code className="bg-blue-100 px-1 rounded">httpOnly: true</code> để chống đánh cắp cookie qua JavaScript</li>
        </ul>
      </div>
    </div>
  )
}
