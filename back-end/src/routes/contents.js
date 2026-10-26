import { Router } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, HttpError, parse, parseId, toDate, today } from '../utils.js';
import { createContentSchema, updateContentSchema, checklistSchema, metricSchema, STATUSES, FORMATS, PLATFORMS } from '../schemas.js';

const router = Router();
router.use(requireAuth);

const UPDATABLE = ['title', 'channel_id', 'format_type', 'priority', 'description', 'script_draft', 'scheduled_date', 'status', 'published_url', 'published_date'];
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

async function findOwned(id, userId) {
  const content = await prisma.content.findFirst({ where: { id, user_id: userId } });
  if (!content) throw new HttpError(404, 'Konten tidak ditemukan.');
  return content;
}
async function assertOwnsChannel(channelId, userId) {
  const ch = await prisma.channel.findFirst({ where: { id: channelId, user_id: userId }, select: { id: true } });
  if (!ch) throw new HttpError(422, 'Channel tidak valid.', { channel_id: 'Channel tidak valid.' });
}
async function getDetail(id, userId) {
  const row = await prisma.content.findFirst({
    where: { id, user_id: userId },
    include: {
      channel: { select: { platform: true, handle_name: true } },
      checklists: { orderBy: { id: 'asc' } },
      metrics: { orderBy: [{ recorded_at: 'asc' }, { id: 'asc' }] },
    },
  });
  if (!row) throw new HttpError(404, 'Konten tidak ditemukan.');
  const { channel, checklists, metrics, ...content } = row;
  return { content: { ...content, ...channel }, checklists, metrics };
}

// GET /contents?status=&channel_id=&format_type=&platform=&q=
router.get('/contents', asyncHandler(async (req, res) => {
  const { status, channel_id, format_type, platform, q } = req.query;
  if (status && !STATUSES.includes(status)) throw new HttpError(422, 'Filter status tidak valid.');
  if (format_type && !FORMATS.includes(format_type)) throw new HttpError(422, 'Filter format tidak valid.');
  if (platform && !PLATFORMS.includes(platform)) throw new HttpError(422, 'Filter platform tidak valid.');

  const rows = await prisma.content.findMany({
    where: {
      user_id: req.user.id,
      ...(status && { status }),
      ...(channel_id && { channel_id: Number(channel_id) || 0 }),
      ...(format_type && { format_type }),
      ...(platform && { channel: { platform } }),
      ...(q && { title: { contains: String(q) } }),
    },
    select: {
      id: true, channel_id: true, title: true, format_type: true, status: true, priority: true,
      scheduled_date: true, published_url: true,
      channel: { select: { platform: true, handle_name: true } },
      checklists: { select: { is_completed: true } },
    },
  });

  const data = rows
    .map(({ channel, checklists, ...c }) => ({
      ...c,
      ...channel,
      checklist_total: checklists.length,
      checklist_done: checklists.filter((k) => k.is_completed).length,
    }))
    // prioritas tinggi dulu, jadwal terdekat dulu (tanpa jadwal di akhir), lalu yang terbaru
    .sort((a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      (a.scheduled_date === null) - (b.scheduled_date === null) ||
      a.scheduled_date - b.scheduled_date ||
      Number(b.id) - Number(a.id));
  res.status(200).json({ data });
}));

router.post('/contents', asyncHandler(async (req, res) => {
  const d = parse(createContentSchema, req.body);
  await assertOwnsChannel(d.channel_id, req.user.id);
  const created = await prisma.content.create({
    data: {
      user_id: req.user.id,
      channel_id: d.channel_id,
      title: d.title,
      description: d.description ?? null,
      script_draft: d.script_draft ?? null,
      format_type: d.format_type,
      status: 'idea',
      priority: d.priority,
      scheduled_date: toDate(d.scheduled_date) ?? null,
    },
  });
  res.status(201).json(await getDetail(created.id, req.user.id));
}));

router.get('/contents/:id', asyncHandler(async (req, res) => {
  res.status(200).json(await getDetail(parseId(req.params.id), req.user.id));
}));

const update = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const current = await findOwned(id, req.user.id);
  const d = parse(updateContentSchema, req.body);
  if (d.channel_id !== undefined) await assertOwnsChannel(d.channel_id, req.user.id);

  // Aturan publikasi: status published wajib punya published_url yang valid.
  const next = { ...current, ...d };
  if (next.status === 'published') {
    if (!next.published_url) {
      throw new HttpError(422, 'Tidak bisa publish: published_url wajib diisi.', { published_url: 'published_url wajib diisi untuk status published.' });
    }
    if (!next.published_date) d.published_date = today();
  }

  const data = {};
  for (const key of UPDATABLE) if (d[key] !== undefined) data[key] = d[key];
  if ('scheduled_date' in data) data.scheduled_date = toDate(data.scheduled_date);
  if ('published_date' in data) data.published_date = toDate(data.published_date);

  if (Object.keys(data).length) await prisma.content.update({ where: { id }, data });
  res.status(200).json(await getDetail(id, req.user.id));
});
router.put('/contents/:id', update);
router.patch('/contents/:id', update);

// Relasi onDelete: Cascade menghapus checklist & metrik terkait di level database.
router.delete('/contents/:id', asyncHandler(async (req, res) => {
  const { count } = await prisma.content.deleteMany({ where: { id: parseId(req.params.id), user_id: req.user.id } });
  if (!count) throw new HttpError(404, 'Konten tidak ditemukan.');
  res.status(204).end();
}));

router.post('/contents/:id/checklists', asyncHandler(async (req, res) => {
  const content = await findOwned(parseId(req.params.id), req.user.id);
  const { task_name } = parse(checklistSchema, req.body);
  const data = await prisma.contentChecklist.create({ data: { content_id: content.id, task_name } });
  res.status(201).json({ data });
}));

router.patch('/checklists/:id/toggle', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const item = await prisma.contentChecklist.findFirst({ where: { id, content: { user_id: req.user.id } } });
  if (!item) throw new HttpError(404, 'Item checklist tidak ditemukan.');
  const data = await prisma.contentChecklist.update({ where: { id }, data: { is_completed: !item.is_completed } });
  res.status(200).json({ data });
}));

router.delete('/checklists/:id', asyncHandler(async (req, res) => {
  const { count } = await prisma.contentChecklist.deleteMany({ where: { id: parseId(req.params.id), content: { user_id: req.user.id } } });
  if (!count) throw new HttpError(404, 'Item checklist tidak ditemukan.');
  res.status(204).end();
}));

router.post('/contents/:id/metrics', asyncHandler(async (req, res) => {
  const content = await findOwned(parseId(req.params.id), req.user.id);
  if (content.status !== 'published') {
    throw new HttpError(409, 'Metrik hanya bisa dicatat untuk konten berstatus published.');
  }
  const d = parse(metricSchema, req.body);
  const data = await prisma.contentMetric.create({
    data: {
      content_id: content.id,
      recorded_at: toDate(d.recorded_at ?? today()),
      views_count: d.views_count,
      likes_count: d.likes_count,
      comments_count: d.comments_count,
      shares_count: d.shares_count,
    },
  });
  res.status(201).json({ data });
}));

export default router;
