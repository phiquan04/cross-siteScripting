import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

interface JwtPayload {
  userId: string;
  username: string;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Chưa đăng nhập" });
      return;
    }

    const secret = process.env.JWT_SECRET || "fallback_secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.userId = decoded.userId;
    req.username = decoded.username;

    next();
  } catch {
    res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }
};