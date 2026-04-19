import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 flex flex-wrap gap-6 py-2">
        <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
        <Link to="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
        <Link to="/post/123" className="text-gray-700 hover:text-blue-600">Blog Post</Link>
        <Link to="/xss-demo" className="text-gray-700 hover:text-blue-600">XSS Demo</Link>
      </div>
    </nav>
  )
}

export default Navbar