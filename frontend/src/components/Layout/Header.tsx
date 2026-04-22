import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <Link to="/" className="text-xl font-bold text-gray-900">XSS Security Lab</Link>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#lessons" className="text-gray-600 hover:text-gray-900 transition">Lessons</a>
          <a href="#lab" className="text-gray-600 hover:text-gray-900 transition">Lab</a>
          <a href="#resources" className="text-gray-600 hover:text-gray-900 transition">Resources</a>
          {/* Hai link mới cho demo XSS */}
          <Link to="/xss-demo" className="text-blue-600 hover:text-blue-800 font-medium transition">DOM XSS</Link>
          <Link to="/post/1" className="text-purple-600 hover:text-purple-800 font-medium transition">Stored XSS</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
              Sign In
            </button>
          </Link>
          <Link to="/register">
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header