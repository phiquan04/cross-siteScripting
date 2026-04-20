import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Vui lòng nhập username và password" });
      return;
    }

    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Dữ liệu không hợp lệ" });
      return;
    }

    if (username.length < 3 || username.length > 30) {
      res.status(400).json({ error: "Username phải từ 3–30 ký tự" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password phải ít nhất 6 ký tự" });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      res.status(400).json({
        error: "Username chỉ chứa chữ cái, số và dấu gạch dưới",
      });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(409).json({ error: "Username đã tồn tại" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
      select: { id: true, username: true, createdAt: true }, // KHÔNG trả password
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      user,
    });
  } catch (error) {
    console.error("[register] Error:", error);
    res.status(500).json({ error: "Lỗi server, vui lòng thử lại" });
  }
});


authRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Vui lòng nhập username và password" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      res.status(401).json({ error: "Username hoặc password không đúng" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Username hoặc password không đúng" });
      return;
    }

    const secret = process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,  // ✅ Không thể đọc bằng JavaScript (chống XSS)
      secure: process.env.NODE_ENV === "production", // ✅ Chỉ HTTPS trên production
      sameSite: "strict", // ✅ Chống CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("[login] Error:", error);
    res.status(500).json({ error: "Lỗi server, vui lòng thử lại" });
  }
});

authRouter.post("/logout", (_req: Request, res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Đăng xuất thành công" });
});

authRouter.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, username: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: "Không tìm thấy user" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("[me] Error:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});