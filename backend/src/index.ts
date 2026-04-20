import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { xssRouter } from "./routes/xss-demo";

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, 
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", authRouter);
app.use("/demo", xssRouter); 

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📋 Auth routes: POST /api/register | POST /api/login | POST /api/logout`);
  console.log(`🐛 XSS demo (có lỗi): GET /demo/reflected-xss?msg=hello`);
  console.log(`✅ XSS demo (đã fix): GET /demo/reflected-xss-fixed?msg=hello`);
});

export default app;