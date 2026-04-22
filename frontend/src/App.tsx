import { Routes, Route, Link as RouterLink } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Post from './pages/Post'
import XSSDemo from './components/XSSDemo'
import { Shield, AlertTriangle, BookOpen, Code2, Lock, Zap, ArrowRight } from 'lucide-react'

function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Zap className="w-4 h-4" />
            Learn Web Security Through Practice
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900">
            Master Cross-Site Scripting Security
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Interactive platform to understand, identify, and prevent XSS vulnerabilities. Learn DOM XSS, Reflected XSS, and Stored XSS through hands-on examples.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <RouterLink to="/register">
              <button className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md">
                Start Learning Now
              </button>
            </RouterLink>
            <a href="#lessons">
              <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                View Lessons
              </button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">3 Types</div>
            <p className="text-gray-600">DOM, Reflected & Stored XSS</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">Interactive</div>
            <p className="text-gray-600">Real-world vulnerability scenarios</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">Secure</div>
            <p className="text-gray-600">Learn best practices & solutions</p>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="lessons" className="bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Learning Paths</h2>
            <p className="text-gray-600 text-lg">Comprehensive modules covering all XSS attack vectors</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* DOM XSS */}
            <div className="border-l-4 border-l-blue-500 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Code2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">DOM XSS</h3>
              </div>
              <p className="text-gray-600">
                Understand how JavaScript DOM manipulation can create vulnerabilities through unsafe innerHTML and dangerouslySetInnerHTML.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-blue-600">•</span> Understanding DOM vulnerabilities</li>
                <li className="flex items-start gap-2"><span className="text-blue-600">•</span> innerHTML vs textContent</li>
                <li className="flex items-start gap-2"><span className="text-blue-600">•</span> Safe rendering practices</li>
              </ul>
            </div>

            {/* Reflected XSS */}
            <div className="border-l-4 border-l-purple-500 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Reflected XSS</h3>
              </div>
              <p className="text-gray-600">
                Learn how user input can be reflected back in responses without proper sanitization, affecting users who click malicious links.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-purple-600">•</span> Query parameter vulnerabilities</li>
                <li className="flex items-start gap-2"><span className="text-purple-600">•</span> HTML escaping techniques</li>
                <li className="flex items-start gap-2"><span className="text-purple-600">•</span> Secure cookie practices</li>
              </ul>
            </div>

            {/* Stored XSS */}
            <div className="border-l-4 border-l-green-500 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Stored XSS</h3>
              </div>
              <p className="text-gray-600">
                Explore persistent XSS attacks where malicious scripts are stored in the database and executed for all users viewing the content.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2"><span className="text-green-600">•</span> Content sanitization with DOMPurify</li>
                <li className="flex items-start gap-2"><span className="text-green-600">•</span> Server-side validation</li>
                <li className="flex items-start gap-2"><span className="text-green-600">•</span> Content Security Policy</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Lab */}
      <section id="lab" className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 space-y-6 border border-blue-100 shadow-md">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <BookOpen className="w-10 h-10 text-blue-600 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Interactive Lab</h2>
                <p className="text-gray-600 mb-6">
                  Test your skills in our secure sandbox environment. Practice identifying vulnerabilities and implementing fixes without risk.
                </p>
                <RouterLink to="/register">
                  <button className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition inline-flex items-center gap-2 shadow-sm">
                    Access Lab <ArrowRight className="w-4 h-4" />
                  </button>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="resources" className="bg-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Learn', desc: 'Study the fundamentals of each XSS type' },
              { num: '02', title: 'Identify', desc: 'Spot vulnerabilities in code examples' },
              { num: '03', title: 'Test', desc: 'Create payloads in the safe lab environment' },
              { num: '04', title: 'Fix', desc: 'Implement secure solutions and best practices' },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center">
                <div className="text-5xl font-bold text-blue-200 mb-4">{step.num}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
                {idx < 3 && <div className="hidden md:block absolute top-12 -right-4 text-2xl text-gray-300">→</div>}
              </div>
            ))}
          </div>
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
        <Route path="/post/:id" element={<Post />} />
        <Route path="/xss-demo" element={<XSSDemo />} />
      </Routes>
    </Layout>
  )
}

export default App