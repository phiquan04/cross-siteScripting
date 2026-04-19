import { useState } from 'react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`🔐 Đăng nhập demo với: ${email}`)
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🔑</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Đăng nhập</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Demo không có xác thực thật</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Đăng nhập
        </button>
      </form>
      <p className="text-center text-xs text-gray-500 mt-4">
        Dùng bất kỳ email/mật khẩu nào (chỉ demo)
      </p>
    </div>
  )
}

export default Login