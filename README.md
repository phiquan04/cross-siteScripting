# XSS Security Lab

Bài tập thực hành **Cross-Site Scripting** — demo 3 loại tấn công và cách phòng chống.

| Service | Port | Mô tả |
|---|---|---|
| Backend (Express + Prisma + MongoDB) | 3002 | REST API |
| Frontend (React + Vite + Tailwind) | 5173 | Web app |
| Hacker Server (Express + WebSocket) | 4000 | Nhận dữ liệu bị đánh cắp |

---

## Cài đặt & Chạy

**Yêu cầu:** Node.js >= 18, tài khoản MongoDB Atlas

### Chạy từng service — mở 3 tab terminal riêng

#### Backend — `localhost:3002`
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

#### Frontend — `localhost:5173`
```bash
cd frontend
npm install
npm run dev
```

#### Hacker Server — `localhost:4000`
```bash
cd hacker-server
npm install
npm run dev
```

---

## Phân công

Chi tiết demo từng người xem **[TASKS.md](./TASKS.md)**

| Người | Demo | URL |
|---|---|---|
| Person 1 | DOM XSS | `localhost:5173/xss-demo` |
| Person 2 | Reflected XSS | `localhost:5173/reflected-xss` |
| Person 3 | Stored XSS + Security Dashboard | `localhost:5173/posts`, `/security` |
| Person 4 | Hacker Server real-time | `localhost:4000` |

---

## Quy trình demo

Xem **[TESTING.md](./TESTING.md)** — flow chi tiết từng loại XSS, payload thử, checklist test nhanh.

---

## Lưu ý

- Cookie `httpOnly: true` → `document.cookie` luôn trống. Dùng **Keylogger** hoặc **Phishing Overlay** để demo.
- File `.env` không được commit — xem `backend/.env.example`.
