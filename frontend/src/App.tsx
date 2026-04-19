import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Post from './pages/Post'
import XSSDemo from './components/XSSDemo'

function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl p-6 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🔐 Cross‑Site Scripting (XSS)</h1>
        <p className="text-lg">Hiểu cách tấn công – Biết cách phòng chống</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-red-500">
          <h2 className="text-xl font-semibold mb-2">⚠️ XSS là gì?</h2>
          <p className="text-gray-700 dark:text-gray-300">
            XSS cho phép kẻ tấn công chèn mã độc (JavaScript) vào website,
            đánh cắp cookie, phiên làm việc, hoặc chuyển hướng người dùng.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-2">🛡️ Cách phòng chống</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            <li>Luôn escape dữ liệu đầu ra</li>
            <li>Sử dụng CSP (Content Security Policy)</li>
            <li>Không dùng <code className="bg-gray-200 px-1 rounded">dangerouslySetInnerHTML</code> trực tiếp</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-blue-500 md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">🧪 Demo trong ứng dụng này</h2>
          <p className="mb-2">Trang <strong>Demo XSS</strong> minh hoạ DOM‑based XSS. Trang <strong>Bài viết</strong> (kết nối backend) minh hoạ Stored XSS.</p>
          <p>Hãy thử nhập <code className="bg-gray-200 px-1 rounded">&lt;img src=x onerror=alert('XSS')&gt;</code> vào ô input.</p>
        </div>
      </div>
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