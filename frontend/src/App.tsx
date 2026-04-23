import { Routes, Route, Link as RouterLink } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Post from './pages/Post'
import Posts from './pages/Posts'
import CreatePost from './pages/CreatePost'
import SecurityDashboard from './pages/SecurityDashboard'
import XSSDemo from './components/XSSDemo'
import ReflectedXSS from './pages/ReflectedXSS'
import AuthGuard from './components/AuthGuard'
import { AlertTriangle, Code2, Lock, FlaskConical } from 'lucide-react'

const XSS_TYPES = [
  {
    to: '/xss-demo',
    external: false,
    color: 'blue',
    Icon: Code2,
    title: 'DOM XSS',
    desc: 'Script is injected via dangerouslySetInnerHTML — executes directly in the DOM without going through the server.',
    points: ['dangerouslySetInnerHTML vs {content}', 'innerHTML vs textContent', 'React auto-escapes by default'],
  },
  {
    to: '/reflected-xss',
    external: false,
    color: 'purple',
    Icon: AlertTriangle,
    title: 'Reflected XSS',
    desc: 'User input from the URL is reflected directly into the HTML response — anyone clicking a malicious link gets attacked.',
    points: ['Query param is not escaped', 'he.encode() to fix', 'Compare /reflected-xss vs /reflected-xss-fixed'],
  },
  {
    to: '/posts',
    external: false,
    color: 'green',
    Icon: Lock,
    title: 'Stored XSS',
    desc: 'Script is saved to the database and executes every time a victim views the post — most dangerous type.',
    points: ['DOMPurify sanitize server-side', 'Vulnerable vs Secure mode toggle', 'Cookie theft & keylogger demo'],
  },
]

const colorMap: Record<string, { border: string; bg: string; icon: string; badge: string; dot: string }> = {
  blue:   { border: 'border-blue-400',   bg: 'bg-blue-50',   icon: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700',   dot: 'text-blue-500' },
  purple: { border: 'border-purple-400', bg: 'bg-purple-50', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', dot: 'text-purple-500' },
  green:  { border: 'border-green-400',  bg: 'bg-green-50',  icon: 'text-green-600',  badge: 'bg-green-100 text-green-700',  dot: 'text-green-500' },
}

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <FlaskConical className="w-3.5 h-3.5" /> Web Security Hands-on Lab
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            XSS Security Lab
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Practice attacking and defending against <strong>Cross-Site Scripting</strong> through 3 types: DOM, Reflected, and Stored XSS.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <RouterLink to="/posts">
              <button className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm">
                Start Lab →
              </button>
            </RouterLink>
            <RouterLink to="/security">
              <button className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                Security Dashboard
              </button>
            </RouterLink>
          </div>
        </div>
      </section>

      {/* XSS Types */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">3 Types of XSS Attacks</h2>
          <p className="text-gray-500 mt-1">Click each card to go directly to the demo</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {XSS_TYPES.map(({ to, external, color, Icon, title, desc, points }) => {
            const c = colorMap[color]
            const inner = (
              <div className={`group h-full border-l-4 ${c.border} bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4 cursor-pointer`}>
                <div className={`p-2 rounded-lg ${c.bg} w-fit`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
                <ul className="mt-auto space-y-1">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className={`mt-0.5 ${c.dot}`}>▸</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
            return external
              ? <a key={title} href={to} target="_blank" rel="noopener noreferrer">{inner}</a>
              : <RouterLink key={title} to={to}>{inner}</RouterLink>
          })}
        </div>
      </section>

    </div>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/new" element={<AuthGuard><CreatePost /></AuthGuard>} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/xss-demo" element={<XSSDemo />} />
        <Route path="/reflected-xss" element={<ReflectedXSS />} />
        <Route path="/security" element={<SecurityDashboard />} />
      </Routes>
    </Layout>
  )
}

export default App
