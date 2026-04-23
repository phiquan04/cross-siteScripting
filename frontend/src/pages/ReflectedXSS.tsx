import { useState } from 'react'
import { AlertTriangle, ShieldCheck, BookOpen, ChevronDown, ChevronUp, ExternalLink, Copy, Check, Terminal } from 'lucide-react'

const BASE = 'http://localhost:3002/demo'

const DEMO_LINKS = [
  {
    label: 'Basic Script Tag',
    path: '/reflected-xss?msg=<script>alert("Reflected XSS")</script>',
    fixedPath: '/reflected-xss-fixed?msg=<script>alert("Reflected XSS")</script>',
    desc: 'Classic script injection via query param',
  },
  {
    label: 'IMG onerror',
    path: '/reflected-xss?msg=<img src=x onerror="alert(1)">',
    fixedPath: '/reflected-xss-fixed?msg=<img src=x onerror="alert(1)">',
    desc: 'Bypasses filters that only block <script>',
  },
  {
    label: 'SVG onload',
    path: '/reflected-xss?msg=<svg onload="alert(document.domain)">',
    fixedPath: '/reflected-xss-fixed?msg=<svg onload="alert(document.domain)">',
    desc: 'SVG element with JavaScript event',
  },
  {
    label: 'Cookie Attempt',
    path: '/reflected-xss?msg=<img src=x onerror="alert(\'Cookie: \'+document.cookie)">',
    fixedPath: '/reflected-xss-fixed?msg=<img src=x onerror="alert(\'Cookie: \'+document.cookie)">',
    desc: 'Attempts to read cookies (httpOnly blocks it)',
  },
]

const THEORY_SECTIONS = [
  {
    title: 'What is Reflected XSS?',
    content: `Reflected XSS (also called Non-Persistent XSS) happens when a web application takes user input from the HTTP request — typically a URL query parameter — and reflects it back in the HTML response without proper encoding.

Unlike Stored XSS, the payload is not saved to the database. It exists only in the URL and is "reflected" once to whoever opens that link.`,
  },
  {
    title: 'Attack Vector — Phishing Flow',
    content: `1. Attacker crafts a malicious URL:
   https://trusted-site.com/search?q=<script>stealCookies()</script>

2. Attacker sends this link to victims (email, SMS, social media).

3. Victim trusts the domain — it's a real site! — and clicks.

4. Server reflects the param into the page without escaping.

5. Script executes in victim's browser under the trusted domain.

The victim never realizes the link was malicious.`,
  },
  {
    title: 'Why is it dangerous?',
    content: `• Executes under the victim's authenticated session
• Can steal session tokens (non-httpOnly cookies)
• Can perform actions as the logged-in user
• The attacker's payload never touches server storage — harder to detect
• Victims trust the domain shown in the browser address bar`,
  },
  {
    title: 'How to fix — he.encode()',
    content: `The fix is simple: HTML-encode all user input before inserting it into the response.

VULNERABLE:
  res.send(\`<p>Hello \${req.query.msg}</p>\`)

FIXED:
  const he = require('he')
  res.send(\`<p>Hello \${he.encode(req.query.msg)}</p>\`)

he.encode() converts < to &lt;, > to &gt;, " to &quot;, etc.
The browser renders these as visible characters — scripts never execute.`,
  },
  {
    title: 'Real-world examples',
    content: `• CVE-2021-44228 (Log4Shell) — input reflected in log output
• Old search engines reflecting search terms verbatim
• Error pages showing "Page not found: <user input>"
• Redirect parameters: ?next=javascript:alert(1)
• Flash parameters (pre-2020): flashvars injected into embed tags`,
  },
]

export default function ReflectedXSS() {
  const [theoryOpen, setTheoryOpen] = useState(true)
  const [openSection, setOpenSection] = useState<number | null>(0)
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(key)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Reflected XSS Lab</h1>
        <p className="text-gray-500">Understand how URL query parameters can be weaponized — and how to prevent it.</p>
      </div>

      {/* Theory Panel */}
      <div className="bg-white border border-purple-200 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setTheoryOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-4 bg-purple-50 hover:bg-purple-100 transition"
        >
          <span className="flex items-center gap-2 font-semibold text-purple-900">
            <BookOpen className="w-4 h-4" /> Theory — Reflected XSS Explained
          </span>
          {theoryOpen ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />}
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

      {/* Demo Links */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Side-by-Side Demo Links</h2>
        <p className="text-sm text-gray-500">Click any link to see the vulnerable or fixed behavior. Compare them side by side.</p>

        <div className="space-y-3">
          {DEMO_LINKS.map((demo, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{demo.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{demo.desc}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Vulnerable */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Vulnerable endpoint
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-red-700 break-all">{BASE + demo.path}</code>
                    <button onClick={() => copy(BASE + demo.path, `v-${idx}`)} className="p-1 text-red-400 hover:text-red-600 flex-shrink-0">
                      {copiedIdx === `v-${idx}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a href={BASE + demo.path} target="_blank" rel="noopener noreferrer" className="p-1 text-red-400 hover:text-red-600 flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                {/* Fixed */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Fixed endpoint
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs text-green-700 break-all">{BASE + demo.fixedPath}</code>
                    <button onClick={() => copy(BASE + demo.fixedPath, `f-${idx}`)} className="p-1 text-green-400 hover:text-green-600 flex-shrink-0">
                      {copiedIdx === `f-${idx}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a href={BASE + demo.fixedPath} target="_blank" rel="noopener noreferrer" className="p-1 text-green-400 hover:text-green-600 flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code comparison */}
      <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="w-full">
            <p className="font-semibold text-gray-900 mb-3">Backend Code: Vulnerable vs Fixed</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">❌ Vulnerable — /reflected-xss</p>
                <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-800 overflow-x-auto">{`app.get('/demo/reflected-xss', (req, res) => {
  const msg = req.query.msg || 'Hello!'
  // Raw string interpolation — DANGEROUS
  res.send(\`
    <html>
      <body>
        <p>\${msg}</p>
      </body>
    </html>
  \`)
})`}</pre>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 mb-1">✅ Fixed — /reflected-xss-fixed</p>
                <pre className="bg-green-50 border border-green-200 rounded p-3 text-xs text-green-800 overflow-x-auto">{`const he = require('he')

app.get('/demo/reflected-xss-fixed', (req, res) => {
  const msg = req.query.msg || 'Hello!'
  // he.encode() escapes all HTML chars
  res.send(\`
    <html>
      <body>
        <p>\${he.encode(String(msg))}</p>
      </body>
    </html>
  \`)
})`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="p-5 bg-purple-50 rounded-xl border border-purple-200 text-sm">
        <p className="font-semibold text-purple-900 mb-2">Key Takeaways</p>
        <ul className="list-disc list-inside space-y-1.5 text-purple-800">
          <li>Never insert user-controlled data into HTML without encoding</li>
          <li>Use <code className="bg-purple-100 px-1 rounded">he.encode()</code> on the server — converts {'<'} to &amp;lt;, {'>'} to &amp;gt;</li>
          <li>Validate expected input format (e.g., only allow alphanumeric for search)</li>
          <li>Set <code className="bg-purple-100 px-1 rounded">Content-Type: text/html; charset=UTF-8</code> explicitly</li>
          <li>CSP header blocks inline script execution even if payload is injected</li>
          <li>Cookie <code className="bg-purple-100 px-1 rounded">httpOnly: true</code> prevents JavaScript from reading session cookies</li>
        </ul>
      </div>
    </div>
  )
}
