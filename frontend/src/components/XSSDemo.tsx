import { useState } from 'react'
import { AlertCircle, ShieldCheck, Terminal, BookOpen, ChevronDown, ChevronUp, Zap, Copy, Check } from 'lucide-react'

const PRESET_PAYLOADS = [
  { label: 'IMG onerror', payload: '<img src=x onerror="alert(\'DOM XSS\')">', category: 'basic' },
  { label: 'SVG onload', payload: '<svg onload="alert(\'XSS\')">', category: 'basic' },
  { label: 'Script tag', payload: '<script>alert("XSS")</script>', category: 'basic' },
  { label: 'Input autofocus', payload: '<input onfocus="alert(\'XSS\')" autofocus>', category: 'basic' },
  { label: 'Cookie read', payload: '<img src=x onerror="alert(\'Cookie: \'+document.cookie)">', category: 'advanced' },
  { label: 'Defacement', payload: '<b style="color:red;font-size:2em">Page Defaced!</b>', category: 'advanced' },
]

const THEORY_SECTIONS = [
  {
    title: 'What is DOM-based XSS?',
    content: `DOM XSS occurs entirely in the browser — no server involvement. The vulnerability exists when JavaScript reads untrusted data (URL hash, user input, localStorage) and writes it to the DOM using dangerous sinks like innerHTML or dangerouslySetInnerHTML without sanitization.`,
  },
  {
    title: 'Attack Vector',
    content: `An attacker tricks a victim into submitting malicious input through a form or URL fragment (#). The frontend JavaScript picks up that value and inserts it into the DOM as HTML, causing the script to execute in the victim's browser session.`,
  },
  {
    title: 'Why is it dangerous?',
    content: `Since the payload never hits the server, WAFs and server-side filters are completely bypassed. The attack runs with full access to the page's DOM, cookies (non-httpOnly), and can exfiltrate data or impersonate user actions.`,
  },
  {
    title: 'How to fix it',
    content: `1. Use React's {variable} rendering — auto-escapes HTML.\n2. Never pass user input to dangerouslySetInnerHTML.\n3. Use DOMPurify.sanitize() if you must render HTML.\n4. Avoid innerHTML, document.write(), eval() with user data.`,
  },
]

export default function XSSDemo() {
  const [userInput, setUserInput] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [theoryOpen, setTheoryOpen] = useState(true)
  const [openSection, setOpenSection] = useState<number | null>(0)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const handleSubmit = () => {
    setAlertMessage(userInput)
  }

  const insertPayload = (payload: string) => {
    setUserInput(payload)
    setAlertMessage('')
  }

  const copyPayload = (payload: string, idx: number) => {
    navigator.clipboard.writeText(payload)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">DOM XSS Hands-on Lab</h1>
        <p className="text-gray-500">Observe how unfiltered user input injected into the DOM can execute arbitrary scripts.</p>
      </div>

      {/* Theory Panel */}
      <div className="bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setTheoryOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 bg-blue-50 hover:bg-blue-100 transition"
        >
          <span className="flex items-center gap-2 font-semibold text-blue-900">
            <BookOpen className="w-4 h-4" /> Theory — DOM XSS Explained
          </span>
          {theoryOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
        </button>

        {theoryOpen && (
          <div className="divide-y divide-gray-100">
            {THEORY_SECTIONS.map((sec, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenSection(openSection === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition text-left"
                >
                  <span className="text-sm font-medium text-gray-800">{sec.title}</span>
                  {openSection === i
                    ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                {openSection === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{sec.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preset Payloads */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" /> Quick Payload Library
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {PRESET_PAYLOADS.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="text-xs font-medium text-gray-600 w-28 flex-shrink-0">{p.label}</span>
              <code className="flex-1 text-xs text-gray-500 truncate">{p.payload}</code>
              <button onClick={() => copyPayload(p.payload, idx)} className="p-1 text-gray-400 hover:text-gray-600 transition flex-shrink-0" title="Copy">
                {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => insertPayload(p.payload)}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium flex-shrink-0"
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* DOM XSS Warning */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-semibold">Live Demo — Vulnerable vs Safe Rendering</p>
            <p className="text-red-700 text-sm">The left panel uses <code className="bg-red-100 px-1 rounded">dangerouslySetInnerHTML</code> — scripts execute. The right panel uses React text rendering — scripts are escaped.</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Payload Input</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter payload..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Render
          </button>
        </div>
      </div>

      {/* Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vulnerable */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-5 py-3 border-b border-red-200">
            <h3 className="text-red-700 font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              Vulnerable — <code className="text-xs font-normal bg-red-100 px-1 rounded">dangerouslySetInnerHTML</code>
            </h3>
          </div>
          <div className="p-5">
            <div
              className="min-h-[80px] border-b border-red-100 pb-3 mb-3 text-sm"
              dangerouslySetInnerHTML={{ __html: alertMessage }}
            />
            <p className="text-xs text-gray-500">Raw HTML is inserted — scripts execute immediately.</p>
          </div>
        </div>

        {/* Safe */}
        <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-5 py-3 border-b border-green-200">
            <h3 className="text-green-700 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Safe — <code className="text-xs font-normal bg-green-100 px-1 rounded">{'{alertMessage}'}</code>
            </h3>
          </div>
          <div className="p-5">
            <div className="min-h-[80px] border-b border-green-100 pb-3 mb-3 text-sm break-all">{alertMessage}</div>
            <p className="text-xs text-gray-500">React auto-escapes — content displayed as plain text, scripts do not execute.</p>
          </div>
        </div>
      </div>

      {/* Fix explanation */}
      <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 text-sm">
        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 mb-3">Code Comparison: Vulnerable vs Fixed</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">❌ Vulnerable</p>
                <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800 overflow-x-auto">{`// Inserts raw HTML — XSS possible
<div dangerouslySetInnerHTML={{
  __html: userInput
}} />`}</pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 mb-1">✅ Fixed</p>
                <pre className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800 overflow-x-auto">{`// React auto-escapes — safe
<div>{userInput}</div>

// Or sanitize first:
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
