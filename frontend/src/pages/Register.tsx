import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../lib/api'
import { Loader2 } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username chỉ chứa chữ, số và dấu _'); return }
    setLoading(true)
    const result = await authApi.register(username, password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setSuccess('Đăng ký thành công! Đang chuyển hướng...')
    setTimeout(() => navigate('/login'), 1200)
  }

  const strength = password.length === 0 ? null : password.length < 4 ? 'Yếu' : password.length < 8 ? 'Trung bình' : 'Mạnh'
  const strengthClass = strength === 'Yếu' ? 'bg-red-500' : strength === 'Trung bình' ? 'bg-yellow-400' : 'bg-green-500'
  const strengthWidth = strength === 'Yếu' ? 'w-1/3' : strength === 'Trung bình' ? 'w-2/3' : 'w-full'

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h2>
          <p className="text-gray-500 text-sm mt-1">Đăng ký để bắt đầu thực hành</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="your_username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
            {strength && (
              <div className="mt-1.5">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Độ mạnh mật khẩu</span>
                  <span className={strength === 'Yếu' ? 'text-red-500' : strength === 'Trung bình' ? 'text-yellow-600' : 'text-green-600'}>
                    {strength}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strengthClass} ${strengthWidth} transition-all duration-300`} />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">✓ {success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
