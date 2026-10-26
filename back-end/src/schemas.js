import { z } from 'zod';

export const STATUSES = ['idea', 'scripting', 'recording', 'editing', 'ready', 'published'];
export const FORMATS = ['short_video', 'long_video', 'carousel', 'single_post'];
export const PRIORITIES = ['low', 'medium', 'high'];
export const PLATFORMS = ['youtube', 'tiktok', 'instagram', 'linkedin'];

const oneOf = (vals, label) =>
  z.enum(vals, { errorMap: () => ({ message: `${label} harus salah satu dari: ${vals.join(', ')}` }) });
const blankToNull = (v) => (typeof v === 'string' && v.trim() === '' ? null : v);

export const isValidUrl = (v) => {
  try {
    const u = new URL(v);
    return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.') && v.length <= 255;
  } catch {
    return false;
  }
};

const dateStr = z
  .string({ invalid_type_error: 'Tanggal tidak valid' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Tanggal tidak valid');
const optDate = z.preprocess(blankToNull, dateStr.nullable().optional());
const optText = z.preprocess(blankToNull, z.string().max(65535).nullable().optional());
const optUrl = z.preprocess(
  blankToNull,
  z.string().trim().refine(isValidUrl, 'published_url bukan tautan valid (contoh: https://youtube.com/watch?v=...)').nullable().optional()
);

export const registerSchema = z.object({
  name: z.string({ required_error: 'Nama wajib diisi' }).trim().min(1, 'Nama wajib diisi').max(100),
  email: z.string({ required_error: 'Email wajib diisi' }).trim().toLowerCase().max(191).email('Format email tidak valid'),
  password: z.string({ required_error: 'Kata sandi wajib diisi' }).min(8, 'Kata sandi minimal 8 karakter').max(72),
});
export const loginSchema = z.object({
  email: z.string({ required_error: 'Email wajib diisi' }).trim().toLowerCase().email('Format email tidak valid'),
  password: z.string({ required_error: 'Kata sandi wajib diisi' }).min(1, 'Kata sandi wajib diisi'),
});

export const channelSchema = z.object({
  platform: oneOf(PLATFORMS, 'Platform'),
  handle_name: z.string({ required_error: 'Handle wajib diisi' }).trim().min(1, 'Handle wajib diisi').max(100),
});

const contentFields = {
  title: z.string({ required_error: 'Judul wajib diisi' }).trim().min(1, 'Judul wajib diisi').max(255, 'Judul maksimal 255 karakter'),
  channel_id: z.coerce
    .number({ invalid_type_error: 'Channel wajib dipilih', required_error: 'Channel wajib dipilih' })
    .int()
    .positive('Channel wajib dipilih'),
  format_type: oneOf(FORMATS, 'Format'),
  priority: oneOf(PRIORITIES, 'Prioritas').default('medium'),
  description: optText,
  script_draft: optText,
  scheduled_date: optDate,
};
export const createContentSchema = z.object(contentFields);
export const updateContentSchema = z
  .object(contentFields)
  .partial()
  .extend({ status: oneOf(STATUSES, 'Status').optional(), published_url: optUrl, published_date: optDate });

export const checklistSchema = z.object({
  task_name: z.string({ required_error: 'Nama tugas wajib diisi' }).trim().min(1, 'Nama tugas wajib diisi').max(255),
});

const count = z.coerce.number({ invalid_type_error: 'Harus berupa angka' }).int('Harus bilangan bulat').min(0, 'Tidak boleh negatif').default(0);
export const metricSchema = z.object({
  recorded_at: z.preprocess((v) => (v === '' ? undefined : v), dateStr.optional()),
  views_count: count,
  likes_count: count,
  comments_count: count,
  shares_count: count,
});
