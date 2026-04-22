import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../lib/api'

const Register = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
 
    if (password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới')
      return
    }
 
    setLoading(true)
    const result = await authApi.register(username, password)
    setLoading(false)
 
    if (result.error) {
      setError(result.error)
      return
    }
 
    setSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...')
    setTimeout(() => navigate('/login'), 1500)
  }

  // Tính độ mạnh mật khẩu (demo)
  const getPasswordStrength = () => {
    if (password.length === 0) return ''
    if (password.length < 4) return 'Weak'
    if (password.length < 8) return 'Medium'
    return 'Strong'
  }
  const strength = getPasswordStrength()
  const strengthColor =
    strength === 'Weak' ? 'bg-red-500' : strength === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Start learning web security today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="securitylearner"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
            {password && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Password strength:</span>
                  <span className={`font-medium ${strength === 'Weak' ? 'text-red-500' : strength === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {strength}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthColor} transition-all duration-300`}
                    style={{ width: password.length === 0 ? '0%' : password.length < 4 ? '33%' : password.length < 8 ? '66%' : '100%' }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
 
        {/* Thông báo thành công */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-300 rounded-lg">
            <p className="text-green-700 dark:text-green-400 text-sm">✅ {success}</p>
          </div>
        )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              required
            />
            <label htmlFor="agree" className="text-sm text-gray-600 dark:text-gray-400">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold transition duration-200 shadow-md ${
              agree
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang đăng ký...
            </span>
          ) : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register