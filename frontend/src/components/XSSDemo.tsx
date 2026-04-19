import { useState } from 'react'

const XSSDemo = () => {
  const [userInput, setUserInput] = useState('')
  const [alertMessage, setAlertMessage] = useState('')

  const handleSubmit = () => {
    setAlertMessage(userInput)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Demo lỗi DOM XSS và cách khắc phục</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder='Nhập nội dung, ví dụ: <img src=x onerror=alert("XSS")>'
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Hiển thị
        </button>
      </div>

      <hr className="my-6" />

      {/* PHẦN CÓ LỖI XSS */}
      <div className="border border-red-500 rounded-lg p-4 mb-6 bg-red-50">
        <h3 className="text-red-700 font-bold text-lg mb-2">
          🔴 Dễ bị tấn công XSS (dùng dangerouslySetInnerHTML)
        </h3>
        <div dangerouslySetInnerHTML={{ __html: alertMessage }} className="mb-2" />
        <p className="text-sm text-gray-600">
          Thử nhập: <code className="bg-gray-200 px-1 rounded">&lt;img src=x onerror=alert('XSS')&gt;</code> → sẽ hiện alert
        </p>
      </div>

      {/* PHẦN AN TOÀN */}
      <div className="border border-green-500 rounded-lg p-4 mb-6 bg-green-50">
        <h3 className="text-green-700 font-bold text-lg mb-2">
          ✅ An toàn (dùng {`{alertMessage}`})
        </h3>
        <div className="mb-2">{alertMessage}</div>
        <p className="text-sm text-gray-600">
          Nội dung được hiển thị dưới dạng text thuần, script không thực thi.
        </p>
      </div>

      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-2">Giải thích:</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        <li>
          <strong>Lỗi:</strong> <code className="bg-gray-200 px-1 rounded">dangerouslySetInnerHTML</code> cho phép chèn trực tiếp HTML, hacker có thể chèn script độc hại.
        </li>
        <li>
          <strong>Cách sửa:</strong> Sử dụng <code className="bg-gray-200 px-1 rounded">{'{alertMessage}'}</code> (React tự động escape) hoặc dùng thư viện DOMPurify để lọc nếu cần hiển thị HTML an toàn.
        </li>
      </ul>
    </div>
  )
}

export default XSSDemo