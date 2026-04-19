import { useParams } from 'react-router-dom'

const Post = () => {
  const { id } = useParams()
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Bài viết #{id}</h2>
      <p className="text-gray-600 mb-4">Đây là nội dung bài viết số {id}. (Demo không có XSS ở đây)</p>
      <p>
        Xem tính năng XSS tại trang{' '}
        <a href="/xss-demo" className="text-blue-600 hover:underline">/xss-demo</a>
      </p>
    </div>
  )
}

export default Post