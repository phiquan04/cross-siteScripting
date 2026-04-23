import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { detectXSS } from "../utils/xss-detector";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DOMPurify = require("isomorphic-dompurify");
const sanitize: (dirty: string, config?: any) => string = DOMPurify.sanitize.bind(DOMPurify);

export const commentRouter = Router();

// POST /api/posts/:postId/comments — add comment
commentRouter.post(
  "/posts/:postId/comments",
  requireAuth as any,
  async (req: AuthRequest, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        res.status(400).json({ error: "Missing content" });
        return;
      }

      const post = await prisma.post.findUnique({
        where: { id: req.params.postId as string },
      });
      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const mode = req.query.mode as string | undefined;
      const xssInfo = detectXSS(content);

      const comment = await prisma.comment.create({
        data: {
          content,
          sanitizedContent:
            mode === "secure"
              ? sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
              : null,
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
      res.status(500).json({ error: "Server error" });
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
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      if (comment.authorId !== req.userId) {
        res.status(403).json({ error: "Not authorized to delete" });
        return;
      }

      await prisma.comment.delete({ where: { id: req.params.id as string } });
      res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);
