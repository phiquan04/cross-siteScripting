import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { detectXSS } from "../utils/xss-detector";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DOMPurify = require("isomorphic-dompurify");
const sanitize: (dirty: string) => string = DOMPurify.sanitize.bind(DOMPurify);

export const postRouter = Router();

// GET /api/posts — list all posts
// BE1: returns hasXSS + riskLevel computed from detectXSS(content + title)
postRouter.get("/posts", async (_req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, username: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute XSS info for each post (content + title)
    const postsWithXss = posts.map((post) => {
      const contentXss = detectXSS(post.content);
      const titleXss = detectXSS(post.title); // BE3: detect XSS in title too
      const isXSS = contentXss.isXSS || titleXss.isXSS;
      const riskLevel = contentXss.score >= titleXss.score
        ? contentXss.riskLevel
        : titleXss.riskLevel;
      return { ...post, hasXSS: isXSS, riskLevel };
    });

    res.json(postsWithXss);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
      res.status(404).json({ error: "Post not found" });
      return;
    }
    // BE1+BE3: attach xss info
    const contentXss = detectXSS(post.content);
    const titleXss = detectXSS(post.title);
    const hasXSS = contentXss.isXSS || titleXss.isXSS;
    const riskLevel = contentXss.score >= titleXss.score
      ? contentXss.riskLevel
      : titleXss.riskLevel;
    res.json({ ...post, hasXSS, riskLevel });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/posts — create post (auth required)
postRouter.post(
  "/posts",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      const { title, content } = req.body;

      if (!title || !content) {
        res.status(400).json({ error: "Missing title or content" });
        return;
      }

      const mode = req.query.mode as string | undefined;
      // BE3: detect XSS in both content and title
      const contentXss = detectXSS(content);
      const titleXss = detectXSS(title);
      const xssInfo = contentXss.score >= titleXss.score ? contentXss : titleXss;
      xssInfo.isXSS = contentXss.isXSS || titleXss.isXSS;

      const post = await prisma.post.create({
        data: {
          title,
          content,
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
      res.status(500).json({ error: "Server error" });
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
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (existing.authorId !== req.userId) {
        res.status(403).json({ error: "Not authorized to edit" });
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
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE /api/posts/:id — delete post (owner only)
postRouter.delete(
  "/posts/:id",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      const deletePostId = req.params.id as string;
      const existing2 = await prisma.post.findUnique({
        where: { id: deletePostId },
      });
      if (!existing2) {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (existing2.authorId !== req.userId) {
        res.status(403).json({ error: "Not authorized to delete" });
        return;
      }

      await prisma.comment.deleteMany({ where: { postId: deletePostId } });
      await prisma.post.delete({ where: { id: deletePostId } });

      res.json({ message: "Post deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
