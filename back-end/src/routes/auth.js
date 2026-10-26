import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler, HttpError, parse } from '../utils.js';
import { registerSchema, loginSchema } from '../schemas.js';

const router = Router();
const publicUser = { id: true, name: true, email: true, role: true };
const taken = () => new HttpError(422, 'Email already taken', { email: 'Email already taken' });

router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = parse(registerSchema, req.body);
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) throw taken();

  const password_hash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({ data: { name, email, password_hash }, select: publicUser });
    res.status(201).json({ user, token: signToken(user) });
  } catch (e) {
    if (e.code === 'P2002') throw taken(); // unique constraint (balapan dua request)
    throw e;
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);
  const found = await prisma.user.findUnique({ where: { email } });
  const ok = found && (await bcrypt.compare(password, found.password_hash));
  if (!ok) throw new HttpError(401, 'Email atau kata sandi salah.');
  const user = { id: found.id, name: found.name, email: found.email, role: found.role };
  res.status(200).json({ user, token: signToken(user) });
}));

export default router;
