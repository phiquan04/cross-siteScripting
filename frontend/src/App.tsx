import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Post from './pages/Post'
import XSSDemo from './components/XSSDemo'

function Home() {
  return (
    <div className="text-center py-10">
      <h1 className="text-3xl font-bold text-blue-600">Demo Bảo mật - XSS</h1>
      <p className="mt-2 text-gray-600">Chọn một chức năng ở thanh navigation</p>
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