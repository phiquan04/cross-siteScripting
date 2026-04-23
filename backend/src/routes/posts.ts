import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { detectXSS } from "../utils/xss-detector";

// Try to import isomorphic-dompurify, fallback to no sanitization
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DOMPurify = require("isomorphic-dompurify");
const sanitize: (dirty: string) => string = DOMPurify.sanitize.bind(DOMPurify);

export const postRouter = Router();

// GET /api/posts — list all posts
postRouter.get("/posts", async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// GET /api/posts/:id — get single post with comments
postRouter.get("/posts/:id", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id as string },
      include: {
        author: { select: { id: true, username: true } },
        comments: {
          include: {
            author: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!post) {
      res.status(404).json({ error: "Bài viết không tồn tại" });
      return;
    }
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// POST /api/posts — create post (auth required)
// ?mode=secure  → sanitize with DOMPurify
// default       → vulnerable (raw HTML stored)
postRouter.post(
  "/posts",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: "Thiếu title hoặc content" });
        return;
      }

      const mode = req.query.mode as string | undefined;
      const xssInfo = detectXSS(content);

      const post = await prisma.post.create({
        data: {
          title,
          content, // always store raw
          sanitizedContent:
            mode === "secure" ? sanitize(content) : null,
          authorId: req.userId!,
        },
        include: {
          author: { select: { id: true, username: true } },
        },
      });

      res.status(201).json({ ...post, xssDetection: xssInfo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);

// PUT /api/posts/:id — update post (owner only)
postRouter.put(
  "/posts/:id",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      const postId = req.params.id as string;
      const existing = await prisma.post.findUnique({
        where: { id: postId },
      });
      if (!existing) {
        res.status(404).json({ error: "Bài viết không tồn tại" });
        return;
      }
      if (existing.authorId !== req.userId) {
        res.status(403).json({ error: "Không có quyền chỉnh sửa" });
        return;
      }

      const { title, content } = req.body;
      const mode = req.query.mode as string | undefined;

      const post = await prisma.post.update({
        where: { id: postId },
        data: {
          ...(title && { title }),
          ...(content && {
            content,
            sanitizedContent:
              mode === "secure" ? sanitize(content) : null,
          }),
        },
        include: {
          author: { select: { id: true, username: true } },
        },
      });

      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);

// DELETE /api/posts/:id — delete post (owner only)
postRouter.delete(
  "/posts/:id",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      // Delete comments first, then post
      const deletePostId = req.params.id as string;
      const existing2 = await prisma.post.findUnique({
        where: { id: deletePostId },
      });
      if (!existing2) {
        res.status(404).json({ error: "Bài viết không tồn tại" });
        return;
      }
      if (existing2.authorId !== req.userId) {
        res.status(403).json({ error: "Không có quyền xóa" });
        return;
      }

      await prisma.comment.deleteMany({ where: { postId: deletePostId } });
      await prisma.post.delete({ where: { id: deletePostId } });

      res.json({ message: "Đã xóa bài viết" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
);
