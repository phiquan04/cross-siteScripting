import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postApi, type Post as PostType, type Comment } from '../lib/api'
import CommentSection from '../components/CommentSection'
import {
  AlertTriangle, ShieldCheck, ShieldOff, Clock, User as UserIcon,
  Info, Trash2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// UX2: step-by-step demo guide (removed from UI — for presenter reference only, see TESTING.md)

export default function Post() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error: toastError } = useToast()

  const [post, setPost] = useState<PostType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [secureMode, setSecureMode] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    postApi.getById(id).then(res => {
      if (res.data) setPost(res.data)
      else setError(res.error || 'Post not found')
      setLoading(false)
    })
  }, [id])

  const handleCommentAdded = (comment: Comment) => {
    if (!post) return
    setPost({ ...post, comments: [...(post.comments || []), comment] })
  }

  const handleCommentDeleted = (commentId: string) => {
    if (!post) return
    setPost({ ...post, comments: (post.comments || []).filter(c => c.id !== commentId) })
  }

  // FE2: delete post (owner only)
  const handleDelete = async () => {
    if (!post || !confirm('Delete this post and all its comments?')) return
    setDeleting(true)
    const res = await postApi.delete(post.id)
    if (res.data) {
      success('Post deleted')
      navigate('/posts', { replace: true })
    } else {
      toastError(res.error || 'Failed to delete post')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  if (error || !post) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="text-red-500">{error || 'Post not found'}</p>
    </div>
  )

  const isOwner = user?.id === post.authorId

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Secure Mode Toggle */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border">
        <span className="text-sm font-medium text-gray-700">Secure Mode:</span>
        <button
          onClick={() => setSecureMode(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            secureMode
              ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> ON (Safe)
        </button>
        <button
          onClick={() => setSecureMode(false)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !secureMode
              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ShieldOff className="w-4 h-4" /> OFF (Vulnerable)
        </button>
      </div>

      {/* Mode explanation */}
      {!secureMode ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Secure Mode OFF — Vulnerable</p>
              <p className="text-red-700 text-sm">Content rendered via <code className="bg-red-100 px-1 rounded">dangerouslySetInnerHTML</code> — scripts will execute. This demonstrates how XSS attacks work.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-800 font-semibold">Secure Mode ON — Protected</p>
              <p className="text-green-700 text-sm">Content sanitized with DOMPurify or rendered as plain text. Malicious scripts are neutralized.</p>
            </div>
          </div>
        </div>
      )}

      {/* Post content */}
      <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          {/* Title row with delete button */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            {/* FE2: delete button — owner only */}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <UserIcon className="w-4 h-4" /> @{post.author.username}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {new Date(post.createdAt).toLocaleString('en-US')}
            </span>
            {/* FE3: risk badge on post page */}
            {post.hasXSS && post.riskLevel && (
              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                post.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                post.riskLevel === 'high'     ? 'bg-orange-100 text-orange-700' :
                post.riskLevel === 'medium'   ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-blue-100 text-blue-700'
              }`}>
                {post.riskLevel.toUpperCase()} RISK
              </span>
            )}
          </div>

          <div className="prose max-w-none">
            {secureMode ? (
              post.sanitizedContent
                ? <div dangerouslySetInnerHTML={{ __html: post.sanitizedContent }} />
                : <div>{post.content}</div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            )}
          </div>
        </div>

        {/* Raw source view */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <details>
            <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800">
              View raw HTML source
            </summary>
            <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-x-auto text-gray-700">{post.content}</pre>
            {post.sanitizedContent && (
              <>
                <p className="text-xs font-medium text-green-600 mt-3 mb-1">Sanitized version:</p>
                <pre className="p-3 bg-white rounded border text-xs overflow-x-auto text-gray-700">{post.sanitizedContent}</pre>
              </>
            )}
          </details>
        </div>
      </article>

      {/* Comments */}
      <CommentSection
        postId={post.id}
        comments={post.comments || []}
        currentUserId={user?.id}
        secureMode={secureMode}
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
      />

      {/* Education box */}
      <div className="p-5 bg-blue-50 rounded-xl border border-blue-200 text-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 mb-2">How to prevent Stored XSS:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Use <strong>DOMPurify</strong> to sanitize HTML before storing or rendering</li>
              <li>Use React text rendering <code className="bg-blue-100 px-1 rounded">{'{content}'}</code> instead of <code className="bg-blue-100 px-1 rounded">dangerouslySetInnerHTML</code></li>
              <li>Set up <strong>Content Security Policy (CSP)</strong> headers</li>
              <li>Validate and escape input on the server side</li>
              <li>Set cookie <code className="bg-blue-100 px-1 rounded">httpOnly: true</code> to prevent cookie theft via JavaScript</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
