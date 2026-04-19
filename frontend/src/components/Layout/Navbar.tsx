import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 flex flex-wrap gap-4 py-3">
        <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600">🏠 Trang chủ</Link>
        <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-blue-600">🔑 Đăng nhập</Link>
        <Link to="/register" className="text-gray-700 dark:text-gray-200 hover:text-blue-600">📝 Đăng ký</Link>
        <Link to="/post/1" className="text-gray-700 dark:text-gray-200 hover:text-blue-600">📄 Stored XSS (Bài viết)</Link>
        <Link to="/xss-demo" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-semibold text-red-600">⚠️ Demo DOM XSS</Link>
      </div>
    </nav>
  )
}

export default Navbar