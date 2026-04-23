import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X } from 'lucide-react'
import { useEffect } from 'react'
import { authApi, type User } from '../../lib/api'

const NAV = [
  { to: '/posts',    label: 'Stored XSS' },
  { to: '/xss-demo', label: 'DOM XSS' },
  { to: '/security', label: 'Security Lab' },
]

const Header = () => {
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    authApi.me().then(res => {
      if (res.data) setUser(res.data.user)
    })
  }, [])

  // Close mobile menu on route change
  const prevPath = useState(location.pathname)[0]
  if (prevPath !== location.pathname && open) setOpen(false)

  const handleLogout = async () => {
    await authApi.logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-blue-600" />
          <span className="text-lg font-bold text-gray-900">XSS Security Lab</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                location.pathname === n.to
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Auth + hamburger */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">@{user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <button className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                  Đăng nhập
                </button>
              </Link>
              <Link to="/register">
                <button className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm">
                  Đăng ký
                </button>
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {NAV.map(n => (
            <Link
              key={n.to}
              to={n.to}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition ${
                location.pathname === n.to
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {n.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">@{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="flex-1">
                  <button className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                    Đăng nhập
                  </button>
                </Link>
                <Link to="/register" className="flex-1">
                  <button className="w-full px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
                    Đăng ký
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
