import { useState } from 'react'
import { AlertCircle, ShieldCheck, Terminal } from 'lucide-react'

const XSSDemo = () => {
  const [userInput, setUserInput] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  const handleSubmit = () => {
    setAlertMessage(userInput)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Cảnh báo DOM XSS */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">⚠️ DOM‑based XSS</p>
            <p className="text-red-700 text-sm">Xảy ra khi dùng <code className="bg-red-100 px-1 rounded">dangerouslySetInnerHTML</code> với dữ liệu người dùng không được lọc.</p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">🧪 Thực hành tấn công DOM XSS</h2>
      <p className="text-gray-600 mb-6">Nhập payload vào ô bên dưới và quan sát sự khác biệt</p>

      {/* Input và button */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder='Ví dụ: <img src=x onerror=alert("XSS")>'
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            Hiển thị
          </button>
        </div>
      </div>

      {/* Kết quả so sánh */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Lỗ hổng */}
        <div className="bg-white rounded-xl shadow-md border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-5 py-3 border-b border-red-200">
            <h3 className="text-red-700 font-bold flex items-center gap-2">
              <span>🔴</span> Lỗ hổng (dangerouslySetInnerHTML)
            </h3>
          </div>
          <div className="p-5">
            <div className="min-h-[80px] border-b border-red-100 pb-3 mb-3" dangerouslySetInnerHTML={{ __html: alertMessage }} />
            <p className="text-sm text-gray-600">Script được thực thi → XSS thành công.</p>
          </div>
        </div>

        {/* An toàn */}
        <div className="bg-white rounded-xl shadow-md border border-green-200 overflow-hidden">
          <div className="bg-green-50 px-5 py-3 border-b border-green-200">
            <h3 className="text-green-700 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Đã sửa an toàn
            </h3>
          </div>
          <div className="p-5">
            <div className="min-h-[80px] border-b border-green-100 pb-3 mb-3">{alertMessage}</div>
            <p className="text-sm text-gray-600">Dữ liệu hiển thị dạng text thuần, không thực thi script.</p>
          </div>
        </div>
      </div>

      {/* Giải thích */}
      <div className="mt-10 p-5 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 text-sm">
        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold mb-2">📘 Cơ chế và cách khắc phục:</p>
            <p className="mb-2"><code className="bg-gray-200 px-1 rounded">dangerouslySetInnerHTML</code> cho phép chèn trực tiếp HTML. Nếu dữ liệu đến từ người dùng không được lọc, kẻ tấn công có thể nhúng <code>&lt;script&gt;</code> hoặc sự kiện <code>onerror</code>.</p>
            <p><strong>Cách sửa:</strong> luôn sử dụng <code className="bg-gray-200 px-1 rounded">{'{variable}'}</code> (React tự động escape) hoặc dùng thư viện <strong>DOMPurify</strong> nếu cần hiển thị HTML an toàn.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default XSSDemo