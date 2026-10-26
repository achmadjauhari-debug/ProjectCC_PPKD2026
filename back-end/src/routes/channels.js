import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError, parse } from "../utils.js";
import { channelSchema } from "../schemas.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await prisma.channel.findMany({
      where: { user_id: req.user.id },
      orderBy: { id: "asc" },
      include: { _count: { select: { contents: true } } },
    });
    res
      .status(200)
      .json({
        data: rows.map(({ _count, ...c }) => ({
          ...c,
          contents_count: _count.contents,
        })),
      });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const d = parse(channelSchema, req.body);
    const handle = d.handle_name.startsWith("@")
      ? d.handle_name
      : `@${d.handle_name}`;
    try {
      const data = await prisma.channel.create({
        data: {
          user_id: req.user.id,
          platform: d.platform,
          handle_name: handle,
        },
      });
      res.status(201).json({ data });
    } catch (e) {
      if (e.code === "P2002")
        throw new HttpError(422, "Channel ini sudah terdaftar.", {
          handle_name: "Channel ini sudah terdaftar.",
        });
      throw e;
    }
  }),
);

export default router;
