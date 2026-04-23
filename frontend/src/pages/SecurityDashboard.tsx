import { useState, useEffect } from 'react'
import { securityApi } from '../lib/api'
import { Shield, ShieldOff, ShieldCheck, ExternalLink } from 'lucide-react'
import { useToast } from '../context/ToastContext'

export default function SecurityDashboard() {
  const [cspEnabled, setCspEnabled] = useState(false)
  const [cspLoading, setCspLoading] = useState(false)
  const { success, info } = useToast()

  useEffect(() => {
    securityApi.getCspStatus().then(res => {
      if (res.data) setCspEnabled(res.data.cspEnabled)
    })
  }, [])

  const handleCSPToggle = async () => {
    setCspLoading(true)
    const res = await securityApi.toggleCSP(!cspEnabled)
    if (res.data) {
      setCspEnabled(res.data.cspEnabled)
      if (res.data.cspEnabled) {
        success('CSP enabled — browser will block inline scripts')
      } else {
        info('CSP disabled — inline scripts can execute again')
      }
    }
    setCspLoading(false)
  }

  const testUrl = `http://localhost:3002/demo/reflected-xss?msg=${encodeURIComponent('<script>alert("CSP test")</script>')}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Security Policy</h1>
          <p className="text-gray-500 mt-0.5">Toggle CSP on the backend and observe the difference</p>
        </div>
      </div>

      {/* CSP Toggle Card */}
      <div className={`rounded-xl border-2 p-6 mb-6 transition ${cspEnabled ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-900">CSP Header</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {cspEnabled
                ? 'Active — backend sends Content-Security-Policy on every response'
                : 'Inactive — no CSP header, inline scripts execute freely'}
            </p>
          </div>
          <button
            onClick={handleCSPToggle}
            disabled={cspLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition ${
              cspEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cspEnabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
            CSP {cspEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {cspEnabled && (
          <pre className="mt-4 text-xs bg-white border border-green-200 rounded-lg p-3 text-gray-700 overflow-x-auto">
            Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
          </pre>
        )}
      </div>

      {/* Test link */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Test URL</h2>
        <p className="text-sm text-gray-500 mb-3">
          Open this URL before and after toggling CSP to see the difference.
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-xs bg-gray-50 border rounded px-3 py-2 text-gray-700 break-all">
            {testUrl}
          </code>
          <a
            href={testUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </a>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="font-medium text-red-700 mb-1">CSP OFF</p>
            <p className="text-red-600 text-xs">Browser executes the inline script → alert appears</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-medium text-green-700 mb-1">CSP ON</p>
            <p className="text-green-600 text-xs">Browser blocks the script → console: "Refused to execute inline script"</p>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> CSP headers are set by the backend at <code className="bg-amber-100 px-1 rounded">localhost:3002</code>.
        They apply to pages served directly by that server — not to this React app running on Vite.
      </div>
    </div>
  )
}
