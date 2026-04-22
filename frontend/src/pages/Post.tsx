import { useParams } from 'react-router-dom'
import { AlertTriangle, ShieldCheck } from 'lucide-react'

const Post = () => {
  const { id } = useParams()
  // Giả lập nội dung bài viết (backend sẽ trả về HTML có script)
  const vulnerableContent = id === '1' 
    ? 'Bài viết bình thường. <b>Chữ đậm</b> an toàn.'
    : '<script>alert("Stored XSS from backend!")</script> <i>Nội dung độc hại</i>'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cảnh báo Stored XSS */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-amber-800 font-semibold">⚠️ Trang này demo <strong>Stored XSS</strong></p>
            <p className="text-amber-700 text-sm">Nội dung lấy từ backend không được lọc – với id=2 sẽ kích hoạt script độc hại.</p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-6">Bài viết #{id}</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* PHẦN CÓ LỖI */}
        <div className="bg-white rounded-xl shadow-md border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-5 py-3 border-b border-red-200">
            <h3 className="text-red-700 font-bold flex items-center gap-2">
              <span>🔴</span> Lỗ hổng (dangerouslySetInnerHTML)
            </h3>
          </div>
          <div className="p-5">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: vulnerableContent }} />
            <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
              Với id=2, nội dung chứa script sẽ được thực thi.
            </p>
          </div>
        </div>

        {/* PHẦN AN TOÀN */}
        <div className="bg-white rounded-xl shadow-md border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-5 py-3 border-b border-green-200">
            <h3 className="text-green-700 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Đã sửa an toàn
            </h3>
          </div>
          <div className="p-5">
            <div className="prose max-w-none">{vulnerableContent}</div>
            <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
              Hiển thị dạng text thuần, script không thực thi.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 p-5 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 text-sm">
        <p className="font-semibold mb-2">📘 Cách phòng chống Stored XSS:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Luôn escape dữ liệu đầu ra (dùng <code className="bg-gray-200 px-1 rounded">textContent</code> thay vì <code>innerHTML</code>)</li>
          <li>Sử dụng thư viện <strong>DOMPurify</strong> để lọc HTML an toàn khi cần hiển thị markup</li>
          <li>Thiết lập <strong>Content Security Policy (CSP)</strong> nghiêm ngặt</li>
        </ul>
      </div>
    </div>
  )
}

export default Post