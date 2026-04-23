import { useState } from 'react'
import { securityApi } from '../lib/api'
import { Shield, ShieldOff, ShieldCheck, AlertTriangle, Eye } from 'lucide-react'

const TEST_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror="alert(1)">',
  '<svg onload="alert(1)">',
  '<a href="javascript:alert(1)">click</a>',
  '<iframe src="javascript:alert(1)">',
  '<input onfocus="alert(1)" autofocus>',
  'Hello <b>world</b>',
  '<p>Safe paragraph</p>',
]

interface SanitizationResult {
  method: string
  output: string
  safe: boolean
  description: string
}

function analyzePayload(input: string): SanitizationResult[] {
  return [
    {
      method: 'No sanitization',
      output: input,
      safe: false,
      description: 'Raw HTML — scripts execute',
    },
    {
      method: 'HTML Entity Encode (he.encode)',
      output: input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;'),
      safe: true,
      description: 'All HTML encoded — no tags render',
    },
    {
      method: 'React text {content}',
      output: input,
      safe: true,
      description: 'React auto-escapes — displayed as plain text',
    },
    {
      method: 'Strip all tags',
      output: input.replace(/<[^>]*>/g, ''),
      safe: true,
      description: 'All HTML tags removed',
    },
    {
      method: 'DOMPurify.sanitize()',
      output: (() => {
        // Simulate DOMPurify behavior
        let cleaned = input
        cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '')
        cleaned = cleaned.replace(/<iframe[\s\S]*?(?:<\/iframe>|\/?>)/gi, '')
        cleaned = cleaned.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
        cleaned = cleaned.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '')
        cleaned = cleaned.replace(/javascript:/gi, '')
        return cleaned || '(empty)'
      })(),
      safe: true,
      description: 'Dangerous tags/attrs removed, safe HTML kept',
    },
  ]
}

function getRiskColor(level: string) {
  switch (level) {
    case 'critical': return 'text-red-700 bg-red-100'
    case 'high': return 'text-orange-700 bg-orange-100'
    case 'medium': return 'text-yellow-700 bg-yellow-100'
    case 'low': return 'text-blue-700 bg-blue-100'
    default: return 'text-green-700 bg-green-100'
  }
}

export default function SecurityDashboard() {
  const [selectedPayload, setSelectedPayload] = useState(TEST_PAYLOADS[0])
  const [customPayload, setCustomPayload] = useState('')
  const [cspEnabled, setCspEnabled] = useState(false)
  const [cspLoading, setCspLoading] = useState(false)
  const [results, setResults] = useState<SanitizationResult[]>(() => analyzePayload(TEST_PAYLOADS[0]))

  const analyze = (payload: string) => {
    setSelectedPayload(payload)
    setResults(analyzePayload(payload))
  }

  const handleCSPToggle = async () => {
    setCspLoading(true)
    const res = await securityApi.toggleCSP(!cspEnabled)
    if (res.data) setCspEnabled(res.data.cspEnabled)
    setCspLoading(false)
  }

  // Simple XSS detection
  const patterns = [
    { re: /<script/i, label: 'script tag' },
    { re: /on\w+\s*=/i, label: 'event handler' },
    { re: /javascript:/i, label: 'javascript: URI' },
    { re: /<iframe/i, label: 'iframe' },
    { re: /eval\(/i, label: 'eval()' },
    { re: /document\.cookie/i, label: 'cookie access' },
    { re: /fetch\(/i, label: 'fetch()' },
  ]
  const matched = patterns.filter(p => p.re.test(selectedPayload))
  const riskLevel = matched.length === 0 ? 'none' : matched.length <= 1 ? 'low' : matched.length <= 3 ? 'medium' : matched.length <= 5 ? 'high' : 'critical'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Security Dashboard
          </h1>
          <p className="text-gray-500 mt-1">So sánh các phương pháp phòng chống XSS</p>
        </div>

        {/* CSP Toggle */}
        <button
          onClick={handleCSPToggle}
          disabled={cspLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            cspEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cspEnabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
          CSP: {cspEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Payload selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Test Payloads</h2>
            <div className="space-y-2">
              {TEST_PAYLOADS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => analyze(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition ${
                    selectedPayload === p
                      ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p.length > 60 ? p.slice(0, 60) + '...' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Custom payload */}
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Custom Payload</h2>
            <textarea
              value={customPayload}
              onChange={e => setCustomPayload(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-xs font-mono mb-2"
              placeholder="Enter custom payload..."
            />
            <button
              onClick={() => { if (customPayload.trim()) analyze(customPayload) }}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Analyze
            </button>
          </div>

          {/* Risk assessment */}
          <div className="bg-white rounded-xl border p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Risk Assessment
            </h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${getRiskColor(riskLevel)}`}>
              {riskLevel.toUpperCase()}
            </div>
            {matched.length > 0 ? (
              <ul className="space-y-1">
                {matched.map((m, i) => (
                  <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {m.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-600">No XSS patterns detected</p>
            )}
          </div>
        </div>

        {/* Right: Comparison table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Sanitization Comparison
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Input: <code className="bg-gray-200 px-1 rounded">{selectedPayload.slice(0, 80)}{selectedPayload.length > 80 ? '...' : ''}</code></p>
            </div>
            <div className="divide-y">
              {results.map((r, idx) => (
                <div key={idx} className={`p-4 ${idx === 0 ? 'bg-red-50/50' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">{r.method}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.safe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.safe ? 'SAFE' : 'VULNERABLE'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{r.description}</p>
                  <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto text-gray-700">
                    {r.output}
                  </pre>
                  {idx === 0 && !r.safe && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Live render (vulnerable):</p>
                      <div className="p-2 bg-white border border-red-200 rounded text-sm" dangerouslySetInnerHTML={{ __html: r.output }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CSP explanation */}
          <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h3 className="font-semibold text-blue-900 mb-2">Content Security Policy (CSP)</h3>
            <p className="text-sm text-blue-800 mb-3">
              CSP là layer phòng thủ cuối cùng. Khi bật CSP, trình duyệt sẽ chặn inline scripts ngay cả khi payload XSS đã inject thành công.
            </p>
            <pre className="text-xs bg-white p-3 rounded border text-gray-700 overflow-x-auto">
              Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
            </pre>
            <p className="text-xs text-blue-600 mt-2">
              Status: CSP is currently <strong>{cspEnabled ? 'ENABLED' : 'DISABLED'}</strong> on the backend
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
