# XSS Security Lab

Bài tập thực hành **Cross-Site Scripting** — demo 3 loại tấn công và cách phòng chống.

| Service | Port | Mô tả |
|---|---|---|
| Backend (Express + Prisma + MongoDB) | 3000 | REST API |
| Frontend (React + Vite + Tailwind) | 5173 | Web app |
| Hacker Server (Express + WebSocket) | 4000 | Nhận dữ liệu bị đánh cắp |

---

## Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- Tài khoản MongoDB Atlas

### Lần đầu

```bash
git clone <repo-url>
cd cross-siteScripting

# Copy file cấu hình
cp backend/.env.example backend/.env
# Sửa backend/.env — điền DATABASE_URL từ MongoDB Atlas

# Cài dependencies + generate Prisma
npm run setup
```

### Chạy

```bash
# Chạy cả 3 server cùng lúc
npm run dev
```

Hoặc mở 3 terminal riêng:
```bash
cd backend       && npm run dev   # port 3000
cd frontend      && npm run dev   # port 5173
cd hacker-server && npm run dev   # port 4000
```

> **Lần đầu chạy backend:** cần thêm `npx prisma generate && npx prisma db push`

---

## Phân công & Demo

Xem chi tiết từng người: **[TASKS.md](./TASKS.md)**  
Hướng dẫn test: **[RUN-AND-TEST.md](./RUN-AND-TEST.md)**

| Người | Demo | URL |
|---|---|---|
| Person 1 | DOM XSS | `/xss-demo` |
| Person 2 | Reflected XSS + Auth | `/demo/reflected-xss?msg=` |
| Person 3 | Stored XSS + Security Dashboard | `/posts`, `/security` |
| Person 4 | Hacker Server real-time | `localhost:4000` |

---

## Lưu ý

- Cookie được set `httpOnly: true` → `document.cookie` luôn **trống**. Dùng payload **Keylogger** hoặc **Phishing Overlay** để demo data theft.
- MongoDB Atlas cần whitelist IP: Atlas → Network Access → Allow from anywhere.
- File `.env` không được commit — xem `backend/.env.example`.
