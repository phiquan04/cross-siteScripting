import { useParams } from 'react-router-dom'

const Post = () => {
  const { id } = useParams()
  // Giả lập nội dung bài viết (backend sẽ trả về HTML có script)
  const vulnerableContent = id === '1' 
    ? 'Bài viết bình thường. <b>Chữ đậm</b> an toàn.'
    : '<script>alert("Stored XSS from backend!")</script> <i>Nội dung độc hại</i>'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-800 font-medium">⚠️ Trang này demo <strong>Stored XSS</strong> – nội dung lấy từ backend không được lọc.</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Bài viết #{id}</h2>

      {/* PHẦN CÓ LỖI (giả lập backend trả HTML) */}
      <div className="border border-red-300 rounded-lg p-4 mb-6 bg-red-50">
        <h3 className="text-red-700 font-bold mb-2">🔴 Bản demo có lỗ hổng (dangerouslySetInnerHTML)</h3>
        <div dangerouslySetInnerHTML={{ __html: vulnerableContent }} />
        <p className="text-sm text-gray-600 mt-2">Với id=2, nội dung chứa script sẽ được thực thi.</p>
      </div>

      {/* PHẦN AN TOÀN */}
      <div className="border border-green-300 rounded-lg p-4 bg-green-50">
        <h3 className="text-green-700 font-bold mb-2">✅ Cách hiển thị an toàn</h3>
        <div>{vulnerableContent}</div>
      </div>
    </div>
  )
}

export default Post