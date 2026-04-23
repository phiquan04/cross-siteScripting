import { useState } from 'react'
import { commentApi, type Comment, type XSSDetection } from '../lib/api'
import { Send, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useToast } from '../context/ToastContext'

interface Props {
  postId: string
  comments: Comment[]
  currentUserId?: string
  secureMode: boolean
  onCommentAdded: (comment: Comment) => void
  onCommentDeleted: (id: string) => void
}

export default function CommentSection({
  postId,
  comments,
  currentUserId,
  secureMode,
  onCommentAdded,
  onCommentDeleted,
}: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [xssInfo, setXssInfo] = useState<XSSDetection | null>(null)
  const { success, warning, error: toastError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')

    const res = await commentApi.create(postId, content, secureMode ? 'secure' : undefined)
    if (res.data) {
      onCommentAdded(res.data)
      if (res.data.xssDetection?.isXSS) {
        setXssInfo(res.data.xssDetection)
        warning(`XSS payload detected in comment (${res.data.xssDetection.riskLevel} risk)`)
      } else {
        success('Comment posted!')
      }
      setContent('')
    } else {
      setError(res.error || 'Failed to post comment')
      toastError(res.error || 'Failed to post comment')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const res = await commentApi.delete(id)
    if (res.data) {
      onCommentDeleted(id)
      success('Comment deleted')
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-3 mb-6">
        {comments.length === 0 && (
          <p className="text-gray-400 text-sm">No comments yet.</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">@{comment.author.username}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString('en-US')}
                </span>
                {currentUserId === comment.authorId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {/* Render comment content */}
            {secureMode ? (
              <div className="text-gray-800 text-sm">
                {comment.sanitizedContent ? (
                  <div dangerouslySetInnerHTML={{ __html: comment.sanitizedContent }} />
                ) : (
                  <div>{comment.content}</div>
                )}
              </div>
            ) : (
              <div
                className="text-gray-800 text-sm"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Comment form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Write a comment..."
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {xssInfo && xssInfo.isXSS && (
            <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
              <AlertTriangle className="w-3.5 h-3.5" />
              XSS detected: {xssInfo.riskLevel} — {xssInfo.matchedPatterns.join(', ')}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Sending...' : 'Post Comment'}
            </button>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              {secureMode ? (
                <><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Secure mode</>
              ) : (
                <><AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Vulnerable mode</>
              )}
            </span>
          </div>
        </form>
      ) : (
        <p className="text-gray-400 text-sm">Please login to comment.</p>
      )}
    </div>
  )
}
