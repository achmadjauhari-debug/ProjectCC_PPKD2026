import jwt from 'jsonwebtoken';
import { HttpError } from '../utils.js';

export const signToken = (user) =>
  jwt.sign({ sub: Number(user.id), role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Autentikasi diperlukan.'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, 'Token tidak valid atau sudah kedaluwarsa.'));
  }
}
