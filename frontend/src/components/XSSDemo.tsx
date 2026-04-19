import { useState } from 'react'

const XSSDemo = () => {
  const [userInput, setUserInput] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  const handleSubmit = () => {
    setAlertMessage(userInput)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6 rounded">
        <p className="text-red-800"><strong>⚠️ DOM‑based XSS</strong> – xảy ra khi dùng <code>dangerouslySetInnerHTML</code> với dữ liệu người dùng.</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">🧪 Thực hành tấn công DOM XSS</h2>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder='Nhập payload: <img src=x onerror=alert("XSS")>'
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Hiển thị
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Vulnerable */}
        <div className="border border-red-400 rounded-lg p-4 bg-red-50 shadow">
          <h3 className="text-red-700 font-bold text-lg mb-2">🔴 Lỗ hổng (dangerouslySetInnerHTML)</h3>
          <div className="min-h-[60px] border-b border-red-200 pb-2 mb-2" dangerouslySetInnerHTML={{ __html: alertMessage }} />
          <p className="text-sm text-gray-600">Script sẽ được thực thi → XSS thành công.</p>
        </div>

        {/* Safe */}
        <div className="border border-green-400 rounded-lg p-4 bg-green-50 shadow">
          <h3 className="text-green-700 font-bold text-lg mb-2">✅ Đã sửa (React escape)</h3>
          <div className="min-h-[60px] border-b border-green-200 pb-2 mb-2">{alertMessage}</div>
          <p className="text-sm text-gray-600">Dữ liệu hiển thị dạng text thuần, không thực thi script.</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">📘 Giải thích cơ chế</h3>
        <p className="mb-2"><code>dangerouslySetInnerHTML</code> cho phép chèn trực tiếp HTML, nếu dữ liệu đến từ người dùng không được lọc, kẻ tấn công có thể nhúng <code>&lt;script&gt;</code> hoặc sự kiện <code>onerror</code>.</p>
        <p>Cách khắc phục: luôn sử dụng <code>{'{variable}'}</code> (React tự động escape) hoặc dùng thư viện <strong>DOMPurify</strong> nếu cần hiển thị HTML an toàn.</p>
      </div>
    </div>
  )
}

export default XSSDemo