export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Jalankan skema zod; gagal => 422 dengan pesan per field.
export function parse(schema, data) {
  const result = schema.safeParse(data ?? {});
  if (result.success) return result.data;
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_';
    if (!errors[key]) errors[key] = issue.message;
  }
  throw new HttpError(422, Object.values(errors)[0], errors);
}

export const today = () => new Date().toISOString().slice(0, 10);

// Param :id yang bukan bilangan bulat positif diperlakukan sebagai data tidak ditemukan.
export function parseId(value) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new HttpError(404, 'Data tidak ditemukan.');
  return n;
}

// 'YYYY-MM-DD' -> Date (UTC) untuk kolom DATE. undefined/null dibiarkan apa adanya.
export const toDate = (v) => (v === undefined || v === null ? v : new Date(`${v}T00:00:00.000Z`));
