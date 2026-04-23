import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { detectXSS } from "../utils/xss-detector";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DOMPurify = require("isomorphic-dompurify");
const sanitize: (dirty: string) => string = DOMPurify.sanitize.bind(DOMPurify);

export const commentRouter = Router();

// POST /api/posts/:postId/comments — add comment
commentRouter.post(
  "/posts/:postId/comments",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        res.status(400).json({ error: "Thiếu content" });
        return;
      }

      const post = await prisma.post.findUnique({
        where: { id: req.params.postId as string },
      });
      if (!post) {
        res.status(404).json({ error: "Bài viết không tồn tại" });
        return;
      }

      const mode = req.query.mode as string | undefined;
      const xssInfo = detectXSS(content);

      const comment = await prisma.comment.create({
        data: {
          content,
          sanitizedContent:
            mode === "secure" ? sanitize(content) : null,
          authorId: req.userId!,
          postId: req.params.postId as string,
        },
        include: {
          author: { select: { id: true, username: true } },
        },
      });

      res.status(201).json({ ...comment, xssDetection: xssInfo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);

// DELETE /api/comments/:id — delete comment (owner only)
commentRouter.delete(
  "/comments/:id",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: req.params.id as string },
      });
      if (!comment) {
        res.status(404).json({ error: "Comment không tồn tại" });
        return;
      }
      if (comment.authorId !== req.userId) {
        res.status(403).json({ error: "Không có quyền xóa" });
        return;
      }

      await prisma.comment.delete({ where: { id: req.params.id as string } });
      res.json({ message: "Đã xóa comment" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);
